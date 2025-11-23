const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

// Load environment variables as early as possible
dotenv.config();

// Import custom middleware and routes
const shopifyMiddleware = require('./middleware/shopifyMiddleware');
const syncProductsRoute = require('./routes/syncProducts');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Global Middleware ----------
app.use(express.json());
app.use(helmet()); // security headers
app.use(cors()); // enable CORS (adjust origin as needed)
app.use(morgan('dev'));

// Rate limiting – protect against abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per window
});
app.use(limiter);

// Custom Shopify middleware – attaches shop config to each request
app.use(shopifyMiddleware);

// ---------- Routes ----------
app.use('/sync-products', syncProductsRoute);

// Base health check route
app.get('/', (req, res) => {
    res.send('Shopify Middleware is running.');
});

// 404 handler for unknown routes
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', message: 'The requested endpoint does not exist.' });
});

// ---------- Error Handling Middleware ----------
app.use((err, req, res, next) => {
    console.error('Error stack:', err.stack);
    const status = err.status || 500;
    const response = {
        error: 'Internal Server Error',
        message: err.message,
    };
    // In development, expose the stack trace for easier debugging
    if (process.env.NODE_ENV !== 'production') {
        response.stack = err.stack;
    }
    res.status(status).json(response);
});

// Export app for testing purposes
module.exports = app;

// Start server only when this file is executed directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
