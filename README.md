# Shopify Middleware – Product Sync

A lightweight **Node.js Express** middleware that syncs Shopify products to a local JSON file.

## 📦 Prerequisites
- Node.js (v14+)
- npm (or yarn)
- A Shopify **Custom App** with `read_products` scope and an **Admin API access token**.

## ⚙️ Configuration
Create a `.env` file in the project root:

```env
PORT=3000
# Optional: Set a custom host URL for deployment (e.g., http://my-server.com)
# HOST=http://localhost:3000

SHOPIFY_SHOP_NAME=your-shop-name   # e.g. my-store
SHOPIFY_ADMIN_API_ACCESS_TOKEN=shpat_XXXXXXXXXXXXXXXXXXXX
SHOPIFY_API_VERSION=2024-01
```

> **Never** commit the `.env` file to version control.

## 🚀 Running the Application
```bash
npm install          # install dependencies
npm run dev          # start in development mode (nodemon)
# or
npm start            # start in production mode
```
The server will listen on `http://localhost:3000` (or the port defined in `.env`).

## 📡 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| **POST** | `/sync-products` <br> `/sync-product` | Fetches all products from Shopify via GraphQL, stores them in `data/products.json`, and returns the synced data as JSON. Both endpoints do the same thing. |
| **GET**  | `/products` | Reads the locally stored `data/products.json` and returns its contents. No external API call is made. |

### Example cURL requests

#### Sync products (POST)
```bash
# Using the plural endpoint
curl -X POST http://localhost:3000/sync-products

# OR using the singular alias
curl -X POST http://localhost:3000/sync-product
```

#### Retrieve stored products (GET)
```bash
curl http://localhost:3000/products
```

## 📂 Project Structure
```
Shopify Middleware/
├── data/                 # Stores products.json (generated)
├── middleware/           # Shopify authentication & logging middleware
├── routes/               # API routes (syncProducts.js)
├── .env                  # Environment variables (not committed)
├── .gitignore
├── index.js              # Application entry point
├── package.json
└── README.md
```

## 🛡️ Error Handling
- **500** – Missing configuration or internal errors.
- **401** – Invalid Shopify credentials.
- **404** – `products.json` not found (run the POST endpoint first).
- **429** – Rate‑limit exceeded (handled by Express rate‑limiter).


