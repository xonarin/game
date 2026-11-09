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

    // Authentication
    auth: {
        tokenKey: process.env.TOKEN_KEY || 'idToken',

        // Signs session tokens: random, at least 32 characters (required in production)
        jwt: { secret: env('JWT_SECRET') || (__DEV__ ? 'dev-only-insecure-jwt-secret-change-me' : '') },

        // Public site URL used to build OAuth redirect URIs, e.g. https://plant.cash
        // (if empty, it is derived from the request host)
        publicUrl: env('PUBLIC_URL'),

        // VK ID (OAuth 2.1 + PKCE), app from https://id.vk.com/about/business/go
        vkid: {
            appId: env('VKID_APP_ID'),
        },

        // Telegram Login Widget: bot from @BotFather, domain linked via /setdomain
        telegram: {
            botToken: env('TELEGRAM_BOT_TOKEN'),
            // without "@" (the widget expects plain bot username)
            botUsername: env('TELEGRAM_BOT_USERNAME').replace(/^@/, ''),
        },

        // Local test login (/auth/dev), only works in development builds
        devLogin: process.env.DEV_LOGIN === '1',

        // VK API for bonuses and promo codes (group membership, reposts, friends count)
        vk: {
            appAccessToken: env('VK_APP_TOKEN'),
            userAccessToken: env('VK_USER_TOKEN'),
            groupId: env('VK_GROUP_ID'),
            groupAccessToken: env('VK_GROUP_TOKEN'),
        },

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
