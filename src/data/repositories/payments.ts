import { Transaction } from 'sequelize';

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
            order: ['id'],
        });
    }

    getAvailableWithdrawMethods(): Promise<WithdrawMethod[]> {
        return this.db.WithdrawMethod.findAll({
            where: { enabled: true },
            order: ['id'],
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

    getPaymentsByUserId(userId: string): Promise<UserPayment[]> {
        return this.db.UserPayment.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
    }

    async createPayment(userId: string, methodId: string, amount: number): Promise<string> {
        const payment: UserPayment = await this.db.UserPayment.create({ userId, methodId, sum: amount });

        return payment.id;
    }

    finishPayment(paymentId: string, methodId: string): Promise<void> {
        return this.db.sequelize.transaction(async transaction => {
            const payment = await this.getPaymentByIdStrict(paymentId, transaction);

            if (payment.status !== 'IN_PROGRESS') {
                return;
            }

            await this.repositories.users.giveMoney(payment.userId, payment.sum, transaction);
            await payment.update({ methodId, status: PaymentStatus.FINISHED }, { transaction });
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

    createWithdraw(userId: string, methodId: string, purse: string, amount: number): Promise<UserWithdraw> {
        // TODO check prerequisites

        return this.db.UserWithdraw.create({ userId, methodId, purse, sum: amount });
    }

    async cancelWithdraw(withdrawId: string, userId: string): Promise<UserWithdraw> {
        const withdraw = await this.getWithdrawByIdStrict(withdrawId);

        if (withdraw.userId !== userId) {
            throw new UserError('NO_WITHDRAW');
        }

        if (withdraw.status !== WithdrawStatus.WAIT_APPROVE) {
            throw new UserError('CANNOT_CANCEL_WITHDRAW');
        }

        return withdraw.update({ status: WithdrawStatus.CANCELLED });
    }
}

export default PaymentsRepository;
