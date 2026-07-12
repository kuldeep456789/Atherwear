import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadEnvFile } from 'node:process';

const envPath = join(process.cwd(), '.env');

if (existsSync(envPath)) {
  loadEnvFile(envPath);
}

// Dynamic import (unlike a top-level `import`) isn't hoisted above the
// loadEnvFile() call above, so AppModule and everything it pulls in only
// gets required once process.env is populated from .env.
void import('./bootstrap.js').then((mod) => mod.bootstrap());
