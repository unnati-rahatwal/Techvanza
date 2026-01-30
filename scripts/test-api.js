// scripts/test-api.js
const BASE_URL = 'http://localhost:3000/api/auth';

async function testAuth() {
    console.log('Starting API Tests...');

    // Mock Data
    const timestamp = Date.now();
    const supplierUser = {
        email: `supplier_${timestamp}@test.com`,
        password: 'password123',
        role: 'supplier',
        location: 'Pune',
        establishmentYear: '2020',
        wasteTypes: ['Plastic', 'Paper']
    };

    const buyerUser = {
        email: `buyer_${timestamp}@test.com`,
        password: 'password123',
        role: 'buyer',
        location: 'Mumbai',
        establishmentYear: '2019',
        interestTypes: ['Plastic']
    };

    try {
        // 1. Register Supplier
        console.log('\n1. Testing Registration (Supplier)...');
        const regRes1 = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(supplierUser)
        });
        const regData1 = await regRes1.json();
        console.log(`Status: ${regRes1.status}`);
        console.log('Response:', regData1);

        if (regRes1.status === 201) {
            console.log('✅ Supplier Registration Passed');
        } else {
            console.error('❌ Supplier Registration Failed');
        }

        // 2. Register Buyer
        console.log('\n2. Testing Registration (Buyer)...');
        const regRes2 = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buyerUser)
        });
        const regData2 = await regRes2.json();
        console.log(`Status: ${regRes2.status}`);

        if (regRes2.status === 201) {
            console.log('✅ Buyer Registration Passed');
        } else {
            console.error('❌ Buyer Registration Failed');
        }

        // 3. Login Supplier
        console.log('\n3. Testing Login (Supplier)...');
        const loginRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: supplierUser.email, password: supplierUser.password })
        });
        const loginData = await loginRes.json();
        console.log(`Status: ${loginRes.status}`);
        console.log('Response:', loginData);

        if (loginRes.status === 200 && loginData.user.email === supplierUser.email) {
            console.log('✅ Login Passed');
        } else {
            console.error('❌ Login Failed');
        }

    } catch (error) {
        console.error('Test failed with error:', error);
    }
}

// Check if server is running
fetch('http://localhost:3000').then(() => {
    testAuth();
}).catch(() => {
    console.log('❌ Server is not running. Please run `npm run dev` in another terminal first.');
});
