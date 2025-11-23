# Shopify Middleware - Product Sync API

A Node.js Express middleware application that authenticates with Shopify Admin API and syncs product data using GraphQL.

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Shopify App Authentication Setup](#shopify-app-authentication-setup)
- [Installation](#installation)
- [Configuration](#configuration)
- [Middleware Explanation](#middleware-explanation)
- [API Usage](#api-usage)
- [Project Structure](#project-structure)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## ✨ Features

- ✅ Express.js server with modular architecture
- ✅ Shopify Admin API authentication middleware
- ✅ GraphQL-based product fetching
- ✅ Request logging and verification
- ✅ Graceful error handling with async/await
- ✅ Local JSON storage for product data
- ✅ Rate limiting middleware
- ✅ Comprehensive logging with Morgan

## 📦 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Shopify store with Admin API access
- Shopify Admin API Access Token

## 🔐 Shopify App Authentication Setup

### Understanding Shopify Authentication

Shopify offers two main authentication methods:

1. **Custom App (Private App) - Recommended for this project**
2. **Public App with OAuth**

For this middleware, we're using **Custom App authentication** with an Admin API access token.

### Step-by-Step: Creating a Custom App

#### 1. Access Your Shopify Admin

- Log in to your Shopify store admin panel
- Navigate to: **Settings** → **Apps and sales channels**

#### 2. Create a Custom App

- Click **"Develop apps"** (or **"Allow custom app development"** if first time)
- Click **"Create an app"**
- Enter app name: e.g., "Product Sync Middleware"
- Click **"Create app"**

#### 3. Configure Admin API Scopes

- Click **"Configure Admin API scopes"**
- Select the following scopes (minimum required):
  - ✅ `read_products` - Read products, variants, and collections
  - ✅ `write_products` - (Optional) If you plan to update products
  - ✅ `read_inventory` - Read inventory levels
  
- Click **"Save"**

#### 4. Install the App

- Click **"Install app"**
- Confirm the installation

#### 5. Get Your Admin API Access Token

- After installation, click **"API credentials"** tab
- Under **"Admin API access token"**, click **"Reveal token once"**
- **⚠️ IMPORTANT**: Copy this token immediately - it will only be shown once!
- This is your `SHOPIFY_ADMIN_API_ACCESS_TOKEN`

#### 6. Get Your Shop Name

- Your shop name is the subdomain of your Shopify store
- Example: If your store URL is `https://my-awesome-store.myshopify.com`
- Your shop name is: `my-awesome-store`

### OAuth Flow (For Public Apps)

If you're building a public app that other merchants will install, you'll need OAuth:

1. **Create a Partner Account**: https://partners.shopify.com/
2. **Create an App** in the Partner Dashboard
3. **Get API credentials**: API Key and API Secret
4. **Implement OAuth flow**:
   - Redirect user to Shopify authorization URL
   - Handle callback with authorization code
   - Exchange code for access token
   - Store token securely per shop

**Note**: This current implementation uses Custom App authentication. For OAuth implementation, additional routes and session management would be required.

## 🚀 Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd "e:/shopify/Dermatouch/Shopify Middleware"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables** (see Configuration section below)

4. **Start the server**:
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## ⚙️ Configuration

Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
SHOPIFY_SHOP_NAME=your-shop-name
SHOPIFY_ADMIN_API_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SHOPIFY_API_VERSION=2024-01
```

### Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port number | `3000` |
| `SHOPIFY_SHOP_NAME` | Your Shopify store subdomain (without .myshopify.com) | `my-store` |
| `SHOPIFY_ADMIN_API_ACCESS_TOKEN` | Admin API access token from Shopify | `shpat_abc123...` |
| `SHOPIFY_API_VERSION` | Shopify API version | `2024-01` |

**⚠️ Security Note**: Never commit your `.env` file to version control!

## 🛡️ Middleware Explanation

### Shopify Authentication Middleware

Located in: `middleware/shopifyMiddleware.js`

This middleware performs three critical functions:

#### 1. Request Logging
```javascript
const timestamp = new Date().toISOString();
console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
```
- Logs every incoming request with timestamp
- Helps with debugging and monitoring

#### 2. Credential Verification
```javascript
if (!SHOPIFY_SHOP_NAME || !SHOPIFY_ADMIN_API_ACCESS_TOKEN) {
    return res.status(500).json({ 
        error: 'Internal Server Error', 
        message: 'Shopify configuration is missing.' 
    });
}
```
- Validates that required Shopify credentials exist
- Prevents requests from proceeding without proper configuration
- Returns 500 error if credentials are missing

#### 3. Configuration Attachment
```javascript
req.shopifyConfig = {
    shopName: SHOPIFY_SHOP_NAME,
    accessToken: SHOPIFY_ADMIN_API_ACCESS_TOKEN,
    apiVersion: process.env.SHOPIFY_API_VERSION || '2024-01'
};
```
- Attaches Shopify configuration to the request object
- Makes credentials easily accessible in route handlers
- Centralizes configuration management

### Additional Middleware

#### Morgan (Logging)
- Logs HTTP requests in 'dev' format
- Provides detailed request/response information

#### Express Rate Limiter
- Limits each IP to 100 requests per 15 minutes
- Prevents abuse and protects against DoS attacks
- Configurable in `index.js`

## 📡 API Usage

### Base URL
```
http://localhost:3000
```

### Endpoints

#### 1. Health Check
```http
GET /
```

**Response**:
```json
"Shopify Middleware is running."
```

---

#### 2. Sync Products (Fetch from Shopify)
```http
POST /sync-products
```

**Description**: Fetches products from Shopify Admin API using GraphQL and stores them in a local JSON file.

**Headers**: None required (authentication handled by middleware)

**Response** (Success - 200):
```json
{
  "success": true,
  "message": "Synced 25 products",
  "count": 25,
  "products": [
    {
      "id": "gid://shopify/Product/1234567890",
      "title": "Awesome T-Shirt",
      "handle": "awesome-t-shirt",
      "description": "A really awesome t-shirt",
      "productType": "Apparel",
      "vendor": "My Brand",
      "tags": ["summer", "casual"],
      "status": "ACTIVE",
      "variants": {
        "edges": [
          {
            "node": {
              "id": "gid://shopify/ProductVariant/9876543210",
              "title": "Small / Blue",
              "price": "29.99",
              "sku": "TS-SM-BLU",
              "inventoryQuantity": 50,
              "availableForSale": true
            }
          }
        ]
      },
      "images": {
        "edges": [
          {
            "node": {
              "id": "gid://shopify/ProductImage/1111111111",
              "url": "https://cdn.shopify.com/...",
              "altText": "Blue t-shirt front view"
            }
          }
        ]
      }
    }
  ]
}
```

**Response** (Error - 400):
```json
{
  "error": "GraphQL Error",
  "details": [
    {
      "message": "Field 'products' doesn't exist on type 'QueryRoot'",
      "locations": [{"line": 2, "column": 3}]
    }
  ]
}
```

**Response** (Error - 401):
```json
{
  "error": "Shopify API Error",
  "message": "Unauthorized",
  "status": 401
}
```

---

#### 3. Get Stored Products
```http
GET /sync-products
```

**Description**: Retrieves products from the local JSON storage.

**Response** (Success - 200):
```json
{
  "success": true,
  "count": 25,
  "products": [...]
}
```

**Response** (Error - 404):
```json
{
  "error": "No products found",
  "message": "Please sync products first by making a POST request to /sync-products"
}
```

---

### Testing with cURL

#### Sync Products:
```bash
curl -X POST http://localhost:3000/sync-products
```

#### Get Stored Products:
```bash
curl http://localhost:3000/sync-products
```

### Testing with Postman

1. Create a new request
2. Set method to `POST`
3. Enter URL: `http://localhost:3000/sync-products`
4. Click **Send**

## 📁 Project Structure

```
Shopify Middleware/
├── data/
│   ├── .gitkeep
│   └── products.json          # Stored product data (generated)
├── middleware/
│   └── shopifyMiddleware.js   # Authentication & logging middleware
├── routes/
│   └── syncProducts.js        # Product sync endpoints
├── .env                       # Environment variables (DO NOT COMMIT)
├── .gitignore                 # Git ignore rules
├── index.js                   # Main application entry point
├── package.json               # Project dependencies
└── README.md                  # This file
```

## ⚠️ Error Handling

All routes use `async/await` with try-catch blocks for graceful error handling:

### Types of Errors Handled

1. **Missing Configuration** (500)
   - Shopify credentials not set in `.env`

2. **GraphQL Errors** (400)
   - Invalid query syntax
   - Insufficient API permissions

3. **Authentication Errors** (401)
   - Invalid access token
   - Expired token

4. **Network Errors** (500)
   - Shopify API unreachable
   - Timeout errors

5. **File System Errors** (404/500)
   - Products file not found
   - Permission issues

### Error Response Format

All errors follow a consistent format:
```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "status": 400
}
```

## 🚦 Rate Limiting

The application implements rate limiting to protect against abuse:

- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Response** (429 - Too Many Requests):
  ```json
  {
    "error": "Too many requests, please try again later."
  }
  ```

Configure in `index.js`:
```javascript
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
```

## 🔧 Development

### Running in Development Mode

```bash
npm run dev
```

Uses `nodemon` for automatic server restart on file changes.

### Running in Production Mode

```bash
npm start
```

## 📝 GraphQL Query Details

The application uses the following GraphQL query to fetch products:

```graphql
{
  products(first: 50) {
    edges {
      node {
        id
        title
        handle
        description
        productType
        vendor
        tags
        createdAt
        updatedAt
        status
        variants(first: 10) {
          edges {
            node {
              id
              title
              price
              sku
              inventoryQuantity
              availableForSale
            }
          }
        }
        images(first: 5) {
          edges {
            node {
              id
              url
              altText
            }
          }
        }
      }
    }
  }
}
```

### Customizing the Query

To fetch more products or different fields, modify `routes/syncProducts.js`:

```javascript
const PRODUCTS_QUERY = `
{
  products(first: 100) {  // Increase from 50 to 100
    edges {
      node {
        // Add or remove fields as needed
      }
    }
  }
}
`;
```

## 🔒 Security Best Practices

1. **Never commit `.env` file** - Contains sensitive credentials
2. **Use environment variables** - Keep secrets out of code
3. **Implement rate limiting** - Prevent abuse
4. **Validate input** - Sanitize user input (if accepting parameters)
5. **Use HTTPS in production** - Encrypt data in transit
6. **Rotate access tokens** - Regularly update Shopify tokens
7. **Monitor logs** - Watch for suspicious activity

## 🐛 Troubleshooting

### Issue: "Shopify configuration is missing"

**Solution**: Ensure `.env` file exists with correct variables.

### Issue: 401 Unauthorized

**Solution**: 
- Verify your access token is correct
- Check if the token has expired
- Ensure required API scopes are granted

### Issue: GraphQL errors

**Solution**:
- Verify API version compatibility
- Check if requested fields exist in your Shopify API version
- Ensure proper API scopes are configured

### Issue: Rate limit exceeded

**Solution**:
- Wait for the rate limit window to reset
- Reduce request frequency
- Adjust rate limit settings if needed

## 📚 Additional Resources

- [Shopify Admin API Documentation](https://shopify.dev/docs/api/admin)
- [Shopify GraphQL Admin API](https://shopify.dev/docs/api/admin-graphql)
- [Shopify App Authentication](https://shopify.dev/docs/apps/auth)
- [Express.js Documentation](https://expressjs.com/)

## 📄 License

ISC

## 👤 Author

Created for Dermatouch Shopify Integration

---

**Last Updated**: November 2024
