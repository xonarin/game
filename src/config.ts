if (process.env.BROWSER) {
    throw new Error('Do not import `config.js` from inside the client-side code.');
}

/*
 * All secrets come from environment variables only (see .env.example).
 * Nothing secret may have a default value in the code: anything committed to git is public.
 * Optional integrations (VK ID, Telegram, FreeKassa, VK group API) are switched off when not configured.
 */

const env = (name: string): string => (process.env[name] || '').trim();

const config = {
    // Node.js app
    port: process.env.PORT || 3000,

    // Dev server port
    devPort: process.env.DEV_PORT || 3002,

    // https://expressjs.com/en/guide/behind-proxies.html
    trustProxy: process.env.TRUST_PROXY || 'loopback',

    // API Gateway
    api: {
        // API URL to be used in the client-side code
        clientUrl: process.env.API_CLIENT_URL || '',
        // API URL to be used in the server-side code
        serverUrl: process.env.API_SERVER_URL || `http://localhost:${process.env.PORT || 3000}`,
    },

    // Database, e.g. mysql://user:password@host:3306/playtime (required)
    databaseUrl: env('DATABASE_URL') || env('CLEARDB_DATABASE_URL'),

    // Redis, e.g. redis://:password@host:6379
    redisUrl: env('REDIS_URL') || 'redis://localhost:6379',

    // Internal service API: the central auth service (plant-auth) resolves/creates users here,
    // over GraphQL, authenticated with this shared token (header `X-Service-Token`). It has no
    // direct DB access. Empty token = the service operations are disabled (rejected).
    service: {
        token: env('SERVICE_API_TOKEN') || (__DEV__ ? 'dev-only-insecure-service-api-token' : ''),
    },

    // Сервисный доступ plant-admin к GraphQL (крон читает расписания без входа админа):
    // заголовок X-Admin-Service-Token. Отдельный от SERVICE_API_TOKEN plant-auth. Пусто = выключено.
    adminService: {
        token: env('ADMIN_SERVICE_TOKEN') || (__DEV__ ? 'dev-only-insecure-admin-service-token' : ''),
    },

    // Приём каталога от plant-admin: POST /internal/sync/*, HMAC-SHA256 подпись тела.
    // Пусто = маршруты отвечают 503.
    sync: {
        hmacSecret: env('SYNC_HMAC_SECRET') || (__DEV__ ? 'dev-only-insecure-sync-hmac-secret' : ''),
    },

    // Authentication
    auth: {
        tokenKey: process.env.TOKEN_KEY || 'idToken',

        // Signs session tokens: random, at least 32 characters (required in production)
        jwt: { secret: env('JWT_SECRET') || (__DEV__ ? 'dev-only-insecure-jwt-secret-change-me' : '') },

        // Public site URL used to build OAuth redirect URIs, e.g. https://plant.cash
        // (if empty, it is derived from the request host)
        publicUrl: env('PUBLIC_URL'),

        // Social login (VK ID, Google, Steam, Telegram) lives entirely in the central auth
        // service (plant-auth). The game only keeps Telegram below for bonus account-linking.

        // Telegram: bot from @BotFather. Used for the bonus (channel check + account linking),
        telegram: {
            botToken: env('TELEGRAM_BOT_TOKEN'),
            // without "@" (the widget expects plain bot username)
            botUsername: env('TELEGRAM_BOT_USERNAME').replace(/^@/, ''),
            // Channel the bonus requires a subscription to (id like -1001234567890 or @channel);
            // the bot must be an administrator of it so getChatMember works.
            bonusChannel: env('TELEGRAM_BONUS_CHANNEL'),
            // Secret for the bot webhook that records who started the bot (/api/telegram/webhook).
            webhookSecret: env('TELEGRAM_WEBHOOK_SECRET'),
        },

        // Central auth service (plant-auth): when `url` is set, /login routes through the broker
        // (/auth/go -> auth service -> /auth/callback) instead of the site's own providers.
        authService: {
            // Public URL the browser is redirected to for login.
            url: env('AUTH_SERVICE_URL') || (__DEV__ ? 'http://localhost:3300' : ''),
            // Server-to-server URL for the /verify code exchange.
            internalUrl:
                env('AUTH_SERVICE_INTERNAL_URL') || env('AUTH_SERVICE_URL') || (__DEV__ ? 'http://localhost:3300' : ''),
            // This site's per-domain /verify secret. Must equal the secret stored for this
            // origin in the admin "Домены" (AuthClient.secret). In dev, falls back to the shared
            // dev secret so local testing works without configuring a per-domain secret.
            verifySecret: env('GAME_VERIFY_SECRET') || (__DEV__ ? 'dev-only-insecure-auth-shared-secret' : ''),
        },

        // Local test login (/auth/dev), only works in development builds
        devLogin: process.env.DEV_LOGIN === '1',

        // FreeKassa deposits (merchant) and FKWallet withdrawals
        fk: {
            merchantId: env('FK_MERCHANT_ID'),
            secret: env('FK_SECRET'),
            secret2: env('FK_SECRET2'),
            walletId: env('FK_WALLET_ID'),
            apiKey: env('FK_API_KEY'),
        },
    },

    // App config
    app: {
        lastBidDelay: 3000,
        onlineDelay: 10000,
        additionalOnlineK: 0.1,
    },
};

/** FreeKassa deposits need the merchant id and both secret words. */
export const isFreeKassaEnabled = () =>
    Boolean(config.auth.fk.merchantId && config.auth.fk.secret && config.auth.fk.secret2);

/** FKWallet withdrawals need the wallet id and API key. */
export const isFkWalletEnabled = () => Boolean(config.auth.fk.walletId && config.auth.fk.apiKey);

/** Problems that make the server unsafe or unable to start; checked on startup in src/server.tsx. */
export const getConfigErrors = (): string[] => {
    const errors: string[] = [];
    if (!config.databaseUrl) {
        errors.push('DATABASE_URL is not set');
    }
    if (!__DEV__ && config.auth.jwt.secret.length < 32) {
        errors.push('JWT_SECRET must be set to a random string of at least 32 characters');
    }
    return errors;
};

export default config;
