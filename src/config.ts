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

        // Google sign-in (OAuth 2.0 + PKCE), OAuth client from https://console.cloud.google.com/apis/credentials
        // Authorized redirect URI: <PUBLIC_URL>/auth/google/return
        google: {
            clientId: env('GOOGLE_CLIENT_ID'),
            clientSecret: env('GOOGLE_CLIENT_SECRET'),
        },

        // Steam sign-in (OpenID 2.0). The Web API key (https://steamcommunity.com/dev/apikey)
        // is used to read the player name/avatar and gates whether the button is shown.
        steam: {
            apiKey: env('STEAM_API_KEY'),
        },

        // Telegram Login Widget: bot from @BotFather, domain linked via /setdomain
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

    // Central auth broker (auth.<domain>, separate app/server — see src/authservice).
    // Sites delegate social login to it and exchange a one-time code for the user via /verify.
    authService: {
        // Port the broker listens on
        port: process.env.AUTH_SERVICE_PORT || 3300,
        // Public URL of the broker itself (used to build its own OAuth redirect URIs)
        publicUrl: env('AUTH_PUBLIC_URL'),
        // Public URL sites point their login buttons to (usually the same as publicUrl)
        url: env('AUTH_SERVICE_URL'),
        // URL sites use for the server-to-server /verify call (inside the private network)
        internalUrl: env('AUTH_SERVICE_INTERNAL_URL') || env('AUTH_SERVICE_URL'),
        // Shared secret protecting /verify (site <-> broker). Required in production.
        sharedSecret: env('AUTH_SHARED_SECRET') || (__DEV__ ? 'dev-only-insecure-auth-shared-secret' : ''),
    },

    // Admin panel (separate app/server/domain, shares this database — see src/admin)
    admin: {
        // Port the admin backend listens on
        port: process.env.ADMIN_PORT || 3200,
        // Public URL of the admin domain, used to build OAuth redirect URIs (e.g. https://admin.example.com)
        publicUrl: env('ADMIN_PUBLIC_URL'),
        // Admin session cookie, separate from the player cookie (different domain)
        tokenKey: process.env.ADMIN_TOKEN_KEY || 'adminToken',
        // Signs admin session tokens (own secret, isolated from the player session)
        jwt: { secret: env('ADMIN_JWT_SECRET') || (__DEV__ ? 'dev-only-insecure-admin-secret-change-me' : '') },
    },

    // Deploy panel (admin): compares each app's running /version against the branch on GitHub.
    deploy: {
        // Repo "owner/name" (e.g. xonarin/game) and branch the apps are deployed from
        githubRepo: env('GITHUB_REPO'),
        githubBranch: env('GITHUB_BRANCH') || 'plant',
        // Token to read commits of a private repo (GitHub REST API)
        githubToken: env('GITHUB_TOKEN'),
        // Secret the admin uses to call each VPS deploy agent (phase 2)
        agentSecret: env('DEPLOY_AGENT_SECRET') || (__DEV__ ? 'dev-only-deploy-agent-secret' : ''),
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
    if (!__DEV__ && config.admin.jwt.secret.length < 32) {
        errors.push('ADMIN_JWT_SECRET must be set to a random string of at least 32 characters');
    }
    return errors;
};

export default config;
