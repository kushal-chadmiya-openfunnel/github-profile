import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Optional: load .env if present (for local dev). Vercel provides env vars directly.
try {
  // eslint-disable-next-line n/global-require, n/no-extraneous-require
  const dotenv = await import('dotenv');
  dotenv.config();
} catch {
  // If dotenv is not installed, ignore – Vercel doesn't need it.
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const token = process.env.NG_APP_GITHUB_TOKEN;

if (!token) {
  console.log('[inject-env] NG_APP_GITHUB_TOKEN not set; leaving placeholder in environment files.');
  process.exit(0);
}

const files = [
  path.join(rootDir, 'src/environments/environment.ts'),
  path.join(rootDir, 'src/environments/environment.prod.ts'),
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('YOUR_GITHUB_TOKEN_HERE')) {
    console.log(`[inject-env] No placeholder found in ${file}, skipping.`);
    continue;
  }
  const updated = content.replace(/'YOUR_GITHUB_TOKEN_HERE'/g, `'${token}'`);
  fs.writeFileSync(file, updated, 'utf8');
  console.log(`[inject-env] Injected token into ${file}`);
}

