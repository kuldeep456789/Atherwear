import { createClient } from 'redis';
import { config } from 'dotenv';
config();

async function testRedis() {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  console.log(`Connecting to Redis at ${url}...`);
  
  const client = createClient({ url });

  client.on('error', (err) => {
    console.error('Redis Client Error:', err);
    process.exit(1);
  });

  try {
    await client.connect();
    console.log('✅ Successfully connected to Redis!');
    
    // Quick test
    await client.set('test-key', 'working');
    const val = await client.get('test-key');
    console.log(`Test key returned: ${val}`);
    await client.del('test-key');
    
    await client.quit();
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
  }
}

testRedis();
