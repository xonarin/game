import BaseRepository from './base';
import { PaymentMethod } from '../models/PaymentMethod';
import { WithdrawMethod } from '../models/WithdrawMethod';

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
}

export default PaymentsRepository;
