if (process.env.BROWSER) {
    throw new Error('Do not import `config.js` from inside the client-side code.');
}

export default {
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

    // Database
    databaseUrl:
        process.env.DATABASE_URL ||
        process.env.CLEARDB_DATABASE_URL ||
        //'mysql://root:2644824@localhost:3306/playtime',
        'mysql://root:OMHQ7rNPh0LozBnm5Jud@localhost:3306/playtime',

    // Redis
    redisUrl: process.env.REDIS_URL || 'localhost',
    // 'redis://redistogo:5825e9b0e37cdad535f42a1a9c387d39@soapfish.redistogo.com:10821/',

    // Authentication
    auth: {
        tokenKey: process.env.TOKEN_KEY || 'idToken',

        jwt: { secret: process.env.JWT_SECRET || 'idontknow' },

        // Public site URL used to build OAuth redirect URIs, e.g. https://willy.bet
        // (if empty, it is derived from the request host)
        publicUrl: process.env.PUBLIC_URL || '',

        // VK ID (OAuth 2.1 + PKCE), app from https://id.vk.com/about/business/go
        vkid: {
            appId: process.env.VKID_APP_ID || '',
        },

        // Telegram Login Widget: bot from @BotFather, domain linked via /setdomain
        telegram: {
            botToken: process.env.TELEGRAM_BOT_TOKEN || '',
            // without "@" (the widget expects plain bot username)
            botUsername: (process.env.TELEGRAM_BOT_USERNAME || '').trim().replace(/^@/, ''),
        },

        // Local test login (/auth/dev), only works in development builds
        devLogin: process.env.DEV_LOGIN === '1',

        vk: {
            // localhost
            appId: process.env.VK_APP_ID || '7008761',
            appSecret: process.env.VK_APP_SECRET || 'vi494aFY2zgy7pPSyHDf',
            // Production
            // appId: process.env.VK_APP_ID || '7723218',
            // appSecret: process.env.VK_APP_SECRET || 'UZgw4N4CTvkY9BuTcRUY',
            // appAccessToken: process.env.VK_APP_TOKEN || '4968df8c4968df8c4968df8ca0491d075e449684968df8c1691663a40f9a0cf90a7daea',
            appAccessToken:
                process.env.VK_APP_TOKEN ||
                'b4ebbe8e34429fbc06ab9de4bb1d0e4a5f5e85b11df5c2bbf93b0a3fe6d1bb745165bee41200b3d7bbd0c',

            userAccessToken:
                process.env.VK_USER_TOKEN ||
                'e4d78546388887dc841ae89d15ff9de8ebef85977f40f365bfd24a004760c11f495a17b76c3ce5e213b37',

            groupId: process.env.VK_GROUP_ID || '202468109',
            groupAccessToken:
                process.env.VK_GROUP_TOKEN ||
                'fd7ceb7ebe18e06d44b23d8e2bd980242b4574689f28d9caa39938460ea27ac31962190bf8b543bdad5b4',
        },

        fk: {
            merchantId: process.env.FK_MERCHANT_ID || '252728',
            secret: process.env.FK_SECRET || '5vbryudo',
            secret2: process.env.FK_SECRET2 || 'ul5a01ql',
            walletId: process.env.FK_WALLET_ID || 'F100481963',
            apiKey: process.env.FK_API_KEY || 'F89FA8AE6F56780C48FD8A5E5EB34BEF',
        },
    },

    // App config
    app: {
        lastBidDelay: 3000,
        onlineDelay: 10000,
        additionalOnlineK: 0.1,
    },
};
