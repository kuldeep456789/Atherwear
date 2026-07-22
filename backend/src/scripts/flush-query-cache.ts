import { createClient } from 'redis';
import { config } from 'dotenv';
config();

async function flushQueryCache() {
  const url = process.env.REDIS_URL || 'redis://localhost:16379';
  const client = createClient({ url });

  await client.connect();

  const keys = await client.keys('cj:products:list:*');
  console.log(`Found ${keys.length} query cache keys to clear.`);

  for (const k of keys) {
    await client.del(k);
    console.log(`Cleared query cache key: ${k}`);
  }

  console.log('Query cache cleared successfully.');
  await client.disconnect();
}

flushQueryCache().catch(console.error);
