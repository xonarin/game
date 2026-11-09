import { Express } from 'express';

import config from '../config';
import { telegramMarkBotStarted } from '../utils/telegram';

interface TelegramUpdate {
    message?: {
        text?: string;
        from?: { id?: number };
    };
}

/**
 * Bot webhook. Telegram must be pointed here via setWebhook with a secret_token:
 *   https://api.telegram.org/bot<token>/setWebhook?url=<PUBLIC_URL>/api/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>
 * We only use it to record which users have started the bot (sent /start), which the bonus
 * eligibility check requires. Requests without the correct secret header are ignored.
 */
const initTelegramWebhook = (app: Express) => {
    app.post('/api/telegram/webhook', async (req, res) => {
        const secret = config.auth.telegram.webhookSecret;
        if (!secret || req.header('X-Telegram-Bot-Api-Secret-Token') !== secret) {
            res.sendStatus(403);
            return;
        }

        const update = req.body as TelegramUpdate;
        const text = update.message?.text || '';
        const fromId = update.message?.from?.id;

        if (fromId && /^\/start\b/.test(text)) {
            try {
                await telegramMarkBotStarted(String(fromId));
            } catch (e) {
                console.error('[telegram] failed to record /start', e);
            }
        }

        // Always 200 so Telegram does not retry.
        res.sendStatus(200);
    });
};

export default initTelegramWebhook;
