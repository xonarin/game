import cron from 'node-cron';
import fetch from 'node-fetch';

import config from '../config';
import { repositories } from '../data/database';
import { UserWithdraw, WithdrawStatus } from '../data/models/UserWithdraw';
import { md5Hash } from '../utils/crypto';

const { walletId, apiKey } = config.auth.fk;

const withdrawCheck = async (withdraw: UserWithdraw) => {
    const { paymentId } = withdraw;

    const sign = md5Hash(`${walletId}${paymentId}${apiKey}`);
    const query = new URLSearchParams({
        action: 'get_payment_status',
        wallet_id: walletId,
        payment_id: paymentId,
        sign,
    });

    const resp = await fetch(`https://www.fkwallet.ru/api_v1.php`, { method: 'POST', body: query });

    if (!resp.ok) {
        console.warn('withdrawCheck - bad response status', resp);
        return;
    }

    const respJson = await resp.json();
    if (respJson?.data?.payment_id !== paymentId) {
        console.warn('withdrawCheck - bad response body', respJson);
        return;
    }

    switch (respJson?.data?.status) {
        case 'In process':
            return;

        case 'Completed':
            withdraw.update({ status: WithdrawStatus.SUCCESS });
            break;

        case 'Canceled':
            withdraw.update({ status: WithdrawStatus.CANCELLED });
            break;

        default:
            console.warn('withdrawCheck - bad payment status', respJson);
    }
};

const withdrawCashOut = async (withdraw: UserWithdraw) => {
    const { purse, sum: amount, methodId: currency } = withdraw;
    const sign = md5Hash(`${walletId}${currency}${amount}${purse}${apiKey}`);

    const query = new URLSearchParams({
        action: 'cashout',
        wallet_id: walletId,
        purse,
        amount: String(amount),
        desc: 'Cash out',
        currency,
        sign,
    });

    const resp = await fetch(`https://www.fkwallet.ru/api_v1.php`, { method: 'POST', body: query });

    if (!resp.ok) {
        console.warn('withdrawCashOut - bad response status', resp);
        return;
    }

    const respJson = await resp.json();
    const paymentId = respJson?.data?.payment_id;
    if (!paymentId) {
        console.warn('withdrawCashOut - bad response body', respJson);
        return;
    }

    withdraw.update({ paymentId, status: WithdrawStatus.IN_PROGRESS });
};

const checkInProgressWithdraws = async () => {
    (await repositories.payments.getWithdrawsByStatus(WithdrawStatus.IN_PROGRESS)).forEach(withdrawCheck);
};

const checkApprovedWithdraws = async () => {
    (await repositories.payments.getWithdrawsByStatus(WithdrawStatus.APPROVED)).forEach(withdrawCashOut);
};

const withdrawTask = async () => {
    try {
        await checkInProgressWithdraws();
        await checkApprovedWithdraws();
    } catch (e) {
        console.error(e);
    }
};

export default () => {
    cron.schedule('0 * * * *', withdrawTask);
    withdrawTask();
};
