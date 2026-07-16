import { config } from 'dotenv';
config();
import axios from 'axios';

async function testCJ() {
  const apiKey = process.env.CJ_API_KEY;
  const email = process.env.CJ_EMAIL;
  console.log(`Testing with Email: ${email}`);

  try {
    // 1. Get Access Token
    console.log('\n--- 1. Testing Authentication ---');
    const authRes = await axios.post('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
      apiKey
    });
    console.log('Auth Response Status:', authRes.status);
    const token = authRes.data.data?.accessToken;
    if (!token) {
      console.error('Failed to get token:', authRes.data);
      return;
    }
    console.log('Successfully retrieved Access Token (truncated):', token.slice(0, 10) + '...');

    const headers = {
      'CJ-Access-Token': token,
      'Content-Type': 'application/json'
    };

    // 2. Get Categories
    console.log('\n--- 2. Testing Categories ---');
    const catRes = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/getCategory', { headers });
    console.log('Categories Response Status:', catRes.status);
    console.log('Categories count:', catRes.data?.data?.length || 0);

    // 3. Get Products
    console.log('\n--- 3. Testing Products List ---');
    const prodRes = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list?pageNum=1&pageSize=20', { headers });
    console.log('Products Response Status:', prodRes.status);
    console.log('Total Products returned from CJ:', prodRes.data?.data?.list?.length || 0);
    
    // Summary
    console.log('\n✅ All APIs are working properly with the new credentials!');

  } catch (error: any) {
    console.error('\n❌ Error occurred:');
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else {
      console.error(error.message);
    }
  }
}

testCJ();
