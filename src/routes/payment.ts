import { Express } from 'express';

import config from '../config';
import { hmacSha256Hash, md5Hash } from '../utils/crypto';
import { repositories } from '../data/database';

interface QiwiNotification {
    bill: {
        siteId: string;
        billId: string;
        amount: {
            value: string;
            currency: string;
        };
        status: {
            value: string;
        };
    };
}

// const freeKassaIps = [
//     '136.243.38.147',
//     '136.243.38.149',
//     '136.243.38.150',
//     '136.243.38.151',
//     '136.243.38.189',
//     '136.243.38.108',
// ];

const qiwiNotificationTypeGuard = (value: unknown): value is QiwiNotification => {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    if (
        typeof (value as Record<'bill', unknown>).bill !== 'object' ||
        (value as Record<'bill', object>).bill === null
    ) {
        return false;
    }

    const { bill } = value as Record<'bill', Record<string | number | symbol, unknown>>;
    if (['siteId', 'billId'].some(field => typeof bill[field] !== 'string')) {
        return false;
    }

    if (['amount', 'status'].some(field => typeof bill[field] !== 'object' || bill[field] === null)) {
        return false;
    }

    const { amount, status } = bill as Record<'amount' | 'status', Record<string | number | symbol, unknown>>;
    if (['value', 'currency'].some(field => typeof amount[field] !== 'string')) {
        return false;
    }

    return typeof status.value === 'string';
};

const initPayments = (app: Express) => {
    app.post('/api/v1/kassa/notify', async (req, res, next) => {
        const {
            MERCHANT_ID: merchantId,
            AMOUNT: amount,
            MERCHANT_ORDER_ID: merchantOrderId,
            CUR_ID: curId,
            SIGN: sign,
        } = req.body;

        const realSign = md5Hash(`${merchantId}:${amount}:${config.auth.fk.secret2}:${merchantOrderId}`);
        if (
            // Turned off due to errors with determining Free-Kassa IP
            // !(freeKassaIps.includes(req.ip) || __DEV__) ||
            merchantId !== config.auth.fk.merchantId ||
            sign !== realSign
        ) {
            return next();
        }

        try {
            await repositories.payments.finishPayment(merchantOrderId, curId);
        } catch (e) {
            console.error(e);
            return res.send('NO');
        }

        return res.send('YES');
    });

    app.post('/api/v1/qiwi/notify', async (req, res, next) => {
        const data = req.body;

        if (!qiwiNotificationTypeGuard(data)) {
            console.warn('qiwi bad notification data', data);
            return next();
        }

        const {
            bill: { siteId, billId, amount, status },
        } = data;

        const sign = req.header('X-Api-Signature-SHA256');
        const invoiceParameters = `${amount.currency}|${amount.value}|${billId}|${siteId}|${status.value}`;
        if (sign !== hmacSha256Hash(config.auth.qiwi.p2pSecret, invoiceParameters)) {
            console.warn(
                'qiwi bad notification sign',
                sign,
                invoiceParameters,
                hmacSha256Hash(config.auth.qiwi.p2pSecret, invoiceParameters),
            );

            return next();
        }

        try {
            await repositories.payments.finishPayment(billId);
        } catch (e) {
            console.error(e);
            return res.sendStatus(500);
        }

        return res.sendStatus(200);
    });
};

export default initPayments;
