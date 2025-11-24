const express = require('express');
const axios = require('axios');
const https = require('https');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// GraphQL Query to fetch products
const PRODUCTS_QUERY = `
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
`;

// POST /sync-products - Fetch and store products
router.post('/sync', async (req, res) => {
  try {
    const { shopName, accessToken, apiVersion } = req.shopifyConfig;

    // Construct Shopify GraphQL endpoint
    const shopifyUrl = `https://${shopName}.myshopify.com/admin/api/${apiVersion}/graphql.json`;

    console.log(`Fetching products from: ${shopifyUrl}`);

    // Make GraphQL request to Shopify with HTTPS agent to handle SSL
    const response = await axios.post(
      shopifyUrl,
      { query: PRODUCTS_QUERY },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false // Bypass SSL certificate validation (development only)
        })
      }
    );

    // Check for GraphQL errors
    if (response.data.errors) {
      console.error('GraphQL Errors:', response.data.errors);
      return res.status(400).json({
        error: 'GraphQL Error',
        details: response.data.errors
      });
    }

    const products = response.data.data.products.edges.map(edge => edge.node);

    // Save to JSON file
    const dataPath = path.join(__dirname, '../data/products.json');
    await fs.writeFile(dataPath, JSON.stringify(products, null, 2));

    console.log(`Successfully synced ${products.length} products`);

    res.json({
      success: true,
      message: `Synced ${products.length} products`,
      count: products.length,
      products: products
    });

  } catch (error) {
    console.error('Error syncing products:', error.message);

    if (error.response) {
      // Shopify API error
      return res.status(error.response.status).json({
        error: 'Shopify API Error',
        message: error.response.data.errors || error.message,
        status: error.response.status
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// GET /sync-products - Retrieve stored products
router.get('/products', async (req, res) => {
  try {
    const dataPath = path.join(__dirname, '../data/products.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    const products = JSON.parse(data);

    res.json({
      success: true,
      count: products.length,
      products: products
    });

  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({
        error: 'No products found',
        message: 'Please sync products first by making a POST request to /sync-products'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

module.exports = router;
