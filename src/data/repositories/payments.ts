import { Transaction } from 'sequelize';

import BaseRepository from './base';
import { PaymentMethod } from '../models/PaymentMethod';
import { WithdrawMethod } from '../models/WithdrawMethod';
import { PaymentStatus, UserPayment } from '../models/UserPayment';
import { UserError } from '../../utils/errors';

class PaymentsRepository extends BaseRepository {
    getAvailablePaymentMethods(): Promise<PaymentMethod[]> {
        return this.db.PaymentMethod.findAll({
            where: { enabled: true },
        });
    }

    getAvailableWithdrawMethods(): Promise<WithdrawMethod[]> {
        return this.db.WithdrawMethod.findAll({
            where: { enabled: true },
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

    async createPayment(userId: string, methodId: string, amount: number): Promise<string> {
        const payment: UserPayment = await this.db.UserPayment.create({ userId, methodId, sum: amount });

        return payment.id;
    }
}

export default PaymentsRepository;
