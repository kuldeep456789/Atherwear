const { createClient } = require('redis');

async function run() {
  const client = createClient();
  client.on('error', err => console.log('Redis Client Error', err));
  await client.connect();
  await client.flushAll();
  console.log('Successfully flushed Redis cache!');
  await client.disconnect();
}

run();
