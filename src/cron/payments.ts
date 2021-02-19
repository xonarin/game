import cron from 'node-cron';
import fetch from 'node-fetch';

import config from '../config';
import { repositories } from '../data/database';
import { UserWithdraw, WithdrawStatus } from '../data/models/UserWithdraw';
import { md5Hash } from '../utils/crypto';
import Locker from '../utils/locker';

const { walletId, apiKey } = config.auth.fk;

const timeout = (secs: number = 1) => new Promise(resolve => setTimeout(resolve, secs * 1000));

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
            await withdraw.update({ status: WithdrawStatus.SUCCESS });
            break;

        case 'Canceled':
            // await repositories.payments.cancelWithdraw(withdraw.id, withdraw.userId);
            break;

        default:
            console.warn('withdrawCheck - bad payment status', respJson);
    }
};

const withdrawCashOut = async (withdraw: UserWithdraw) => {
    const { purse, sum: amount, methodId } = withdraw;

    const method = await repositories.payments.getWithdrawMethodByIdStrict(methodId);
    const finalAmount = amount - (amount * method.commission) / 100;

    const sign = md5Hash(`${walletId}${methodId}${finalAmount}${purse}${apiKey}`);

    const query = new URLSearchParams({
        action: 'cashout',
        wallet_id: walletId,
        purse,
        amount: String(finalAmount),
        desc: 'Cash out',
        currency: methodId,
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
        if (respJson?.status === 'error' && typeof respJson?.desc === 'string') {
            const desc: string = respJson?.desc;

            if (desc.includes('Invalid Purse')) {
                await repositories.payments.makeWithdrawStatusBadPurse(withdraw.id);
                return;
            }
        }

        console.warn('withdrawCashOut - bad response body', respJson);
        return;
    }

    await withdraw.update({ paymentId, status: WithdrawStatus.IN_PROGRESS });
};

const withdrawCheckLock = new Locker();
const checkInProgressWithdrawsLock = new Locker();
const checkInProgressWithdraws = async () => {
    await checkInProgressWithdrawsLock.lock();

    try {
        const withdraws = await repositories.payments.getWithdrawsByStatus(WithdrawStatus.IN_PROGRESS);

        await Promise.all(
            withdraws.map(async withdraw => {
                await withdrawCheckLock.lock();

                try {
                    await withdrawCheck(withdraw);
                } finally {
                    await timeout();
                    withdrawCheckLock.unlock();
                }
            }),
        );
    } finally {
        checkInProgressWithdrawsLock.unlock();
    }
};

const withdrawCashOutLock = new Locker();
const checkApprovedWithdrawsLock = new Locker();
const checkApprovedWithdraws = async () => {
    // Separated lock to prevent duplicated cash outs from different cron calls
    await checkApprovedWithdrawsLock.lock();

    try {
        const withdraws = await repositories.payments.getWithdrawsByStatus(WithdrawStatus.APPROVED);

        await Promise.all(
            withdraws.map(async withdraw => {
                await withdrawCashOutLock.lock();

                try {
                    await withdrawCashOut(withdraw);
                } finally {
                    await timeout();
                    withdrawCashOutLock.unlock();
                }
            }),
        );
    } finally {
        checkApprovedWithdrawsLock.unlock();
    }
};

const withdrawTask = async () => {
    try {
        await checkApprovedWithdraws();
        await checkInProgressWithdraws();
    } catch (e) {
        console.error(e);
    }
};

export default () => {
    cron.schedule('0 * * * *', withdrawTask);
    withdrawTask();
};
