import express, { Express } from 'express';

import config from '../config';
import { md5Hash } from '../utils/crypto';
import { repositories } from '../data/database';

const freeKassaIps = [
    '136.243.38.147',
    '136.243.38.149',
    '136.243.38.150',
    '136.243.38.151',
    '136.243.38.189',
    '136.243.38.108',
];

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
            !(freeKassaIps.includes(req.ip) || __DEV__) ||
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
};

export default initPayments;
