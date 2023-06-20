import { col, fn, Transaction } from 'sequelize';

import BaseRepository from './base';
import { PaymentMethod } from '../models/PaymentMethod';
import { WithdrawMethod } from '../models/WithdrawMethod';
import { PaymentStatus, UserPayment } from '../models/UserPayment';
import { UserError } from '../../utils/errors';
import { UserWithdraw, WithdrawStatus } from '../models/UserWithdraw';

class PaymentsRepository extends BaseRepository {
    getAvailablePaymentMethods(): Promise<PaymentMethod[]> {
        return this.db.PaymentMethod.findAll({
            where: { enabled: true },
            order: ['sortPayment'],
        });
    }

    getAvailableWithdrawMethods(): Promise<WithdrawMethod[]> {
        return this.db.WithdrawMethod.findAll({
            where: { enabled: true },
            order: ['sortPayment'],
        });
    }

    async getPaymentMethodById(paymentMethodId: string, transaction?: Transaction): Promise<PaymentMethod | null> {
        return this.db.PaymentMethod.findByPk(paymentMethodId, {
            ...this.sequelizeContext,
            ...(transaction && { transaction, lock: transaction.LOCK.UPDATE }),
            rejectOnEmpty: false,
        });
    }

    async getPaymentMethodByIdStrict(paymentMethodId: string, transaction?: Transaction): Promise<PaymentMethod> {
        const user = await this.getPaymentMethodById(paymentMethodId, transaction);

        if (!user) {
            throw new UserError('NO_PAYMENT_METHOD');
        }

        return user;
    }

    async getWithdrawMethodById(withdrawMethodId: string, transaction?: Transaction): Promise<PaymentMethod | null> {
        return this.db.WithdrawMethod.findByPk(withdrawMethodId, {
            ...this.sequelizeContext,
            ...(transaction && { transaction, lock: transaction.LOCK.UPDATE }),
            rejectOnEmpty: false,
        });
    }

    async getWithdrawMethodByIdStrict(withdrawMethodId: string, transaction?: Transaction): Promise<WithdrawMethod> {
        const user = await this.getWithdrawMethodById(withdrawMethodId, transaction);

        if (!user) {
            throw new UserError('NO_WITHDRAW_METHOD');
        }

        return user;
    }

    async getPaymentById(paymentId: string, transaction?: Transaction): Promise<UserPayment | null> {
        return this.db.UserPayment.findByPk(paymentId, {
            ...this.sequelizeContext,
            ...(transaction && { transaction, lock: transaction.LOCK.UPDATE }),
            rejectOnEmpty: false,
        });
    }

    async getPaymentByIdStrict(paymentId: string, transaction?: Transaction): Promise<UserPayment> {
        const user = await this.getPaymentById(paymentId, transaction);

        if (!user) {
            throw new UserError('NO_PAYMENT');
        }

        return user;
    }

    getPaymentsByUserId(userId: string, status?: PaymentStatus, transaction?: Transaction): Promise<UserPayment[]> {
        if (status) {
            return this.db.UserPayment.findAll({
                where: { userId, status },
                order: [['createdAt', 'DESC']],
                transaction,
            });
        }

        return this.db.UserPayment.findAll({ where: { userId }, order: [['createdAt', 'DESC']], transaction });
    }

    async getFinishedPaymentsSumByUserId(userId: string, transaction?: Transaction): Promise<number> {
        const result = await this.db.UserPayment.findOne({
            attributes: [[fn('COALESCE', fn('SUM', col('sum')), 0), 'sum']],
            where: { userId, status: PaymentStatus.FINISHED },
            order: [['createdAt', 'DESC']],
            transaction,
        });

        return result.sum;
    }

    async createPayment(userId: string, methodId: string, amount: number): Promise<string> {
        const { commission } = await this.getPaymentMethodByIdStrict(methodId);

        const payment: UserPayment = await this.db.UserPayment.create({
            userId,
            methodId,
            sum: amount,
            commission,
        });

        return payment.id;
    }

    finishPayment(paymentId: string, methodId?: string): Promise<void> {
        return this.db.sequelize.transaction(async transaction => {
            const payment = await this.getPaymentByIdStrict(paymentId, transaction);

            if (payment.status !== 'IN_PROGRESS') {
                return;
            }

            const method = await this.getPaymentMethodById(payment.methodId);
            const commissionPercent =
                method?.commission ??
                (await this.repositories.settings.getSettingAsNumber('payments::defaultDepositCommission'));

            const commission = (commissionPercent * payment.sum) / 100;
            const finalSum = payment.sum - commission;

            await payment.update(
                {
                    methodId: methodId === undefined ? payment.methodId : methodId,
                    status: PaymentStatus.FINISHED,
                    commission: commissionPercent,
                },
                { transaction },
            );

            await this.repositories.users.giveMoney(payment.userId, finalSum, transaction);
            await this.repositories.users.giveIncomeToReferrer(payment.userId, finalSum, transaction);
        });
    }

    async getWithdrawById(withdrawId: string, transaction?: Transaction): Promise<UserWithdraw | null> {
        return this.db.UserWithdraw.findByPk(withdrawId, {
            ...this.sequelizeContext,
            ...(transaction && { transaction, lock: transaction.LOCK.UPDATE }),
            rejectOnEmpty: false,
        });
    }

    async getWithdrawByIdStrict(paymentId: string, transaction?: Transaction): Promise<UserWithdraw> {
        const user = await this.getWithdrawById(paymentId, transaction);

        if (!user) {
            throw new UserError('NO_WITHDRAW');
        }

        return user;
    }

    getWithdrawsByUserId(userId: string): Promise<UserWithdraw[]> {
        return this.db.UserWithdraw.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
    }

    getWithdrawsByStatus(status: WithdrawStatus): Promise<UserWithdraw[]> {
        return this.db.UserWithdraw.findAll({ where: { status }, order: [['createdAt', 'DESC']] });
    }

    async createWithdraw(userId: string, methodId: string, wallet: string, amount: number): Promise<UserWithdraw> {
        const withdraws = await this.getWithdrawsByUserId(userId);

        const successDepositSum = await this.getFinishedPaymentsSumByUserId(userId);
        const minDeposit = await this.repositories.settings.getSettingAsNumber('payments::minDepositToWithdraw');

        if (successDepositSum < minDeposit) {
            throw new UserError('NOT_ENOUGH_DEPOSITS');
        }

        if (!withdraws.some(withdraw => withdraw.status === WithdrawStatus.SUCCESS)) {
            const minBet = await this.repositories.settings.getSettingAsNumber('payments::minBetToWithdraw');
            const user = await this.repositories.users.getUserByIdStrict(userId);

            if (user.turnover < minBet) {
                throw new UserError('NOT_ENOUGH_BETS');
            }
        }

        const purse = wallet.replace(/\s/g, '');

        return this.db.sequelize.transaction(async transaction => {
            await this.repositories.users.withdrawMoney(userId, amount, transaction);
            return this.db.UserWithdraw.create({ userId, methodId, purse, sum: amount }, { transaction });
        });
    }

    async cancelWithdraw(withdrawId: string, userId: string): Promise<UserWithdraw> {
        return this.db.sequelize.transaction(async transaction => {
            const withdraw = await this.getWithdrawByIdStrict(withdrawId);

            if (withdraw.userId !== userId) {
                throw new UserError('NO_WITHDRAW');
            }

            if (withdraw.status !== WithdrawStatus.WAIT_APPROVE) {
                throw new UserError('CANNOT_CANCEL_WITHDRAW');
            }

            await this.repositories.users.giveMoney(withdraw.userId, withdraw.sum, transaction);
            return withdraw.update({ status: WithdrawStatus.CANCELLED }, { transaction });
        });
    }

    async makeWithdrawStatusBadPurse(withdrawId: string): Promise<void> {
        return this.db.sequelize.transaction(async transaction => {
            const withdraw = await this.getWithdrawByIdStrict(withdrawId);

            if (withdraw.status !== WithdrawStatus.APPROVED) {
                return;
            }

            await this.repositories.users.giveMoney(withdraw.userId, withdraw.sum, transaction);
            await withdraw.update({ status: WithdrawStatus.BAD_PURSE }, { transaction });
        });
    }

    async addQiwiWithdraw(
        methodId: string,
        purse: string,
        paymentId: string,
        amount: number,
        transactionId: string,
        userId: string,
    ) {
        await this.db.QiwiWithdraw.create({ userId, purse, methodId, paymentId, transactionId, amount });
    }
}

export default PaymentsRepository;
