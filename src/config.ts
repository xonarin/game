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
        'mysql://root:OMHQ7rNPh0LozBnm5Jud@localhost:3306/playtime',

    // Redis
    redisUrl: process.env.REDIS_URL || 'localhost',

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
            appId: process.env.VK_APP_ID || '7389243',
            appSecret: process.env.VK_APP_SECRET || 'nSv8gRPyhjkuNiO5cvYf',
        },
    },

    // App config
    app: {
        lastBidDelay: 3000,
    },
};