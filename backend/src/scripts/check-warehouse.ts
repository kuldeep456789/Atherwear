import { createClient } from 'redis';
import { config } from 'dotenv';
config();

async function checkWarehouse() {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const client = createClient({ url });
  
  await client.connect().catch(console.error);
  
  const menStr = await client.get('products:warehouse:men');
  const womenStr = await client.get('products:warehouse:women');
  const allStr = await client.get('products:warehouse:all');
  
  const menCount = menStr ? JSON.parse(menStr).length : 0;
  const womenCount = womenStr ? JSON.parse(womenStr).length : 0;
  const allCount = allStr ? JSON.parse(allStr).length : 0;
  
  console.log('\n==================================');
  console.log('       REDIS WAREHOUSE STATS       ');
  console.log('==================================');
  console.log(`🧍 Men's Products:   ${menCount}`);
  console.log(`👩 Women's Products: ${womenCount}`);
  console.log(`📦 Total Products:   ${allCount}`);
  console.log('----------------------------------');
  
  const allProducts = allStr ? JSON.parse(allStr) : [];
  const categories: Record<string, number> = {};
  
  for (const p of allProducts) {
    const cat = p._category || p.category || 'Unknown';
    categories[cat] = (categories[cat] || 0) + 1;
  }
  
  console.log('\n--- CATEGORIES STORED ---');
  if (Object.keys(categories).length === 0) {
    console.log('No categories stored yet (Warehouse is empty).');
  } else {
    for (const [cat, count] of Object.entries(categories)) {
      console.log(`- ${cat}: ${count} items`);
    }
  }
  
  console.log('\n==================================\n');
  
  await client.disconnect();
}

checkWarehouse().catch(console.error);
