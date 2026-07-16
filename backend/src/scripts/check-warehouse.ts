import { createClient } from 'redis';
import { config } from 'dotenv';
config();

async function checkWarehouse() {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const client = createClient({ url });

  await client.connect().catch(err => {
    console.error('Could not connect to Redis:', err);
    process.exit(1);
  });

  console.log('\n══════════════════════════════════════════');
  console.log('         REDIS WAREHOUSE REPORT           ');
  console.log('══════════════════════════════════════════');

  // ── Sync Metrics ──────────────────────────────────────────────────────────
  const metricsStr = await client.get('cj:sync:metrics');
  if (metricsStr) {
    const m = JSON.parse(metricsStr);
    console.log('\n🔄 SYNC STATUS');
    console.log('──────────────────────────────────────────');
    console.log(`  Status:       ${m.status}`);
    console.log(`  Last Sync:    ${m.lastSyncTime ?? 'Never'}`);
    console.log(`  Duration:     ${m.lastSyncDurationMs ? (m.lastSyncDurationMs / 1000).toFixed(1) + 's' : 'N/A'}`);
    console.log(`  API Calls:    ~${m.apiCallsUsed}`);
    console.log(`  Next Sync:    ${m.nextSyncIn}`);
    if (m.error) console.log(`  ⚠️ Error:     ${m.error}`);
  } else {
    console.log('\n🔄 SYNC STATUS: No sync has run yet');
  }

  // ── Warehouse Counts ──────────────────────────────────────────────────────
  const [menStr, womenStr, allStr] = await Promise.all([
    client.get('products:warehouse:men'),
    client.get('products:warehouse:women'),
    client.get('products:warehouse:all'),
  ]);

  const menCount   = menStr   ? JSON.parse(menStr).length   : 0;
  const womenCount = womenStr ? JSON.parse(womenStr).length : 0;
  const allCount   = allStr   ? JSON.parse(allStr).length   : 0;

  console.log('\n📦 WAREHOUSE TOTALS');
  console.log('──────────────────────────────────────────');
  console.log(`  Men:     ${menCount} products`);
  console.log(`  Women:   ${womenCount} products`);
  console.log(`  All:     ${allCount} products`);

  // ── Per-Category Keys ─────────────────────────────────────────────────────
  const catKeys = await client.keys('products:warehouse:*:*');
  // Filter out :next buffer keys and the top-level gender keys
  const currentCatKeys = catKeys.filter(k => !k.includes(':next:') && !['products:warehouse:men', 'products:warehouse:women', 'products:warehouse:all'].includes(k));

  if (currentCatKeys.length > 0) {
    console.log('\n📂 PER-CATEGORY BREAKDOWN');
    console.log('──────────────────────────────────────────');

    const catCounts: { key: string; count: number }[] = [];
    for (const key of currentCatKeys) {
      const val = await client.get(key);
      const count = val ? JSON.parse(val).length : 0;
      catCounts.push({ key, count });
    }

    catCounts.sort((a, b) => {
      // Sort by gender then count
      if (a.key < b.key) return -1;
      if (a.key > b.key) return 1;
      return b.count - a.count;
    });

    for (const { key, count } of catCounts) {
      const label = key.replace('products:warehouse:', '').padEnd(30, '.');
      console.log(`  ${label} ${count} items`);
    }
  } else {
    console.log('\n📂 PER-CATEGORY KEYS: none yet (warehouse is empty or sync has not run)');
  }

  console.log('\n══════════════════════════════════════════\n');

  await client.disconnect();
}

checkWarehouse().catch(err => {
  console.error(err);
  process.exit(1);
});
