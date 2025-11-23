const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const shopifyMiddleware = require('./middleware/shopifyMiddleware');
const syncProductsRoute = require('./routes/syncProducts');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(morgan('dev')); // Logging

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Custom Shopify Middleware
app.use(shopifyMiddleware);

// Routes
app.use('/sync-products', syncProductsRoute);

// Base route
app.get('/', (req, res) => {
    res.send('Shopify Middleware is running.');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
