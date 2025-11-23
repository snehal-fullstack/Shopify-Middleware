const axios = require('axios');

console.log('\n========================================');
console.log('  Testing Shopify Middleware');
console.log('========================================\n');

async function runTests() {
    try {
        // Test 1: Health Check
        console.log('Test 1: Health Check (GET /)');
        const healthResponse = await axios.get('http://localhost:3000');
        console.log('✓ Success:', healthResponse.data);
        console.log('');

        // Test 2: Sync Products
        console.log('Test 2: Sync Products (POST /sync-products)');
        console.log('Fetching products from Shopify...');
        const syncResponse = await axios.post('http://localhost:3000/sync-products');
        console.log('✓ Success!');
        console.log('  Message:', syncResponse.data.message);
        console.log('  Product Count:', syncResponse.data.count);

        if (syncResponse.data.products && syncResponse.data.products.length > 0) {
            console.log('\n  First 5 Products:');
            syncResponse.data.products.slice(0, 5).forEach((product, index) => {
                console.log(`    ${index + 1}. ${product.title}`);
            });
        }
        console.log('');

        // Test 3: Get Stored Products
        console.log('Test 3: Get Stored Products (GET /sync-products)');
        const getResponse = await axios.get('http://localhost:3000/sync-products');
        console.log('✓ Success!');
        console.log('  Stored Product Count:', getResponse.data.count);
        console.log('');

        console.log('========================================');
        console.log('  All Tests Passed! ✓');
        console.log('========================================\n');

    } catch (error) {
        console.error('\n✗ Test Failed!');
        if (error.response) {
            console.error('  Status:', error.response.status);
            console.error('  Error:', error.response.data.error);
            console.error('  Message:', error.response.data.message);
        } else {
            console.error('  Error:', error.message);
        }
        console.log('');
    }
}

runTests();
