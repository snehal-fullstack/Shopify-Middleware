const fs = require('fs');

// Middleware to log requests and verify Shopify config
const shopifyMiddleware = (req, res, next) => {
    // 1. Log the request
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);

    // 2. Verify Shopify Credentials exist
    const { SHOPIFY_SHOP_NAME, SHOPIFY_ADMIN_API_ACCESS_TOKEN } = process.env;

    if (!SHOPIFY_SHOP_NAME || !SHOPIFY_ADMIN_API_ACCESS_TOKEN) {
        console.error('Shopify credentials missing in .env');
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Shopify configuration is missing.'
        });
    }

    // 3. Attach shopify config to request for easy access
    req.shopifyConfig = {
        shopName: SHOPIFY_SHOP_NAME,
        accessToken: SHOPIFY_ADMIN_API_ACCESS_TOKEN,
        apiVersion: process.env.SHOPIFY_API_VERSION || '2024-01'
    };

    next();
};

module.exports = shopifyMiddleware;
