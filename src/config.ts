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
        // 'mysql://root:OMHQ7rNPh0LozBnm5Jud@localhost:3306/playtime',
        'mysql://b6a4ff4918e389:147e8cbc@eu-cdbr-west-03.cleardb.net/heroku_9b236af7a8e92d4?reconnect=true',

    // Redis
    redisUrl:
        process.env.REDIS_URL ||
        // 'localhost',
        'redis://redistogo:5825e9b0e37cdad535f42a1a9c387d39@soapfish.redistogo.com:10821/',

    // Web analytics
    analytics: {
        // https://analytics.google.com/
        googleTrackingId: process.env.GOOGLE_TRACKING_ID, // UA-XXXXX-X
    },

    // Authentication
    auth: {
        tokenKey: process.env.TOKEN_KEY || 'idToken',

        jwt: { secret: process.env.JWT_SECRET || 'idontknow' },

        vk: {
            appId: process.env.VK_APP_ID || '7008761',
            appSecret: process.env.VK_APP_SECRET || 'vi494aFY2zgy7pPSyHDf',
        },

        fk: {
            merchantId: process.env.FK_MERCHANT_ID || '253080',
            secret: process.env.FK_SECRET || 'pbicjr2m',
            secret2: process.env.FK_SECRET2 || 'g0cj8gw8',
            walletId: process.env.FK_WALLET_ID || 'F101281784',
            apiKey: process.env.FK_API_KEY || 'B733D6F3C6F167DD948E4DA95B3A091F',
        },
    },

    // App config
    app: {
        lastBidDelay: 3000,
        onlineDelay: 10000,
        additionalOnlineK: 0.1,
    },
};
