const axios = require('axios');
const https = require('https');
require('dotenv').config();

async function testShopifyConnection() {
    console.log('\n========================================');
    console.log('  Detailed Shopify API Test');
    console.log('========================================\n');

    const shopName = process.env.SHOPIFY_SHOP_NAME;
    const accessToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
    const apiVersion = process.env.SHOPIFY_API_VERSION;

    console.log('Configuration:');
    console.log('  Shop:', shopName);
    console.log('  Token:', accessToken.substring(0, 10) + '...');
    console.log('  API Version:', apiVersion);
    console.log('');

    // Test with different API versions
    const versionsToTest = ['2024-01', '2024-04', '2024-07', '2024-10', apiVersion];

    for (const version of versionsToTest) {
        const url = `https://${shopName}.myshopify.com/admin/api/${version}/graphql.json`;

        console.log(`Testing API version: ${version}`);
        console.log(`  URL: ${url}`);

        try {
            const response = await axios.post(
                url,
                {
                    query: `{
                        shop {
                            name
                            email
                        }
                    }`
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Shopify-Access-Token': accessToken
                    },
                    httpsAgent: new https.Agent({
                        rejectUnauthorized: false
                    }),
                    timeout: 10000
                }
            );

            if (response.data.errors) {
                console.log('  ✗ GraphQL Errors:', response.data.errors[0].message);
            } else if (response.data.data) {
                console.log('  ✓ SUCCESS! Shop:', response.data.data.shop.name);
                console.log('  ✓ This API version works!\n');

                // Now try to fetch products
                console.log('Attempting to fetch products...');
                const productsResponse = await axios.post(
                    url,
                    {
                        query: `{
                            products(first: 5) {
                                edges {
                                    node {
                                        id
                                        title
                                    }
                                }
                            }
                        }`
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Shopify-Access-Token': accessToken
                        },
                        httpsAgent: new https.Agent({
                            rejectUnauthorized: false
                        })
                    }
                );

                if (productsResponse.data.errors) {
                    console.log('  ✗ Products Error:', productsResponse.data.errors[0].message);
                } else {
                    const products = productsResponse.data.data.products.edges;
                    console.log(`  ✓ Found ${products.length} products!`);
                    products.forEach((p, i) => {
                        console.log(`    ${i + 1}. ${p.node.title}`);
                    });
                }

                break; // Stop testing other versions if this one works
            }
        } catch (error) {
            if (error.response) {
                console.log(`  ✗ HTTP ${error.response.status}: ${error.response.statusText}`);
                if (error.response.data) {
                    console.log('  Response:', JSON.stringify(error.response.data).substring(0, 200));
                }
            } else {
                console.log('  ✗ Error:', error.message);
            }
        }
        console.log('');
    }

    console.log('========================================\n');
}

testShopifyConnection();
