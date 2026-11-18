// Copies the data and images shared with the mobile app into public/, so the web build serves them as
// plain static files: /img/q/q227.jpg, /img/signs/signP101.webp, /icon-192.png ...
import { cpSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..');
const repo = join(web, '..');

const copies = [
  // The question bank, copied rather than imported from ../src so Vite never reads the Expo tsconfig.
  ['src/data', 'src/shared-data'],
  ['assets/questions', 'public/img/q'],
  ['assets/traffic-signs', 'public/img/signs'],
  ['assets/signs', 'public/img/signs'],
  ['public/icon-192.png', 'public/icon-192.png'],
  ['public/icon-512.png', 'public/icon-512.png'],
  ['public/apple-touch-icon.png', 'public/apple-touch-icon.png'],
  ['public/og-image.png', 'public/og-image.png'],
];

for (const [from, to] of copies) {
  mkdirSync(dirname(join(web, to)), { recursive: true });
  // Only data files from src/data: its .ts helpers belong to the Expo app.
  cpSync(join(repo, from), join(web, to), { recursive: true, filter: (src) => !src.endsWith('.ts') });
}
console.log(`sync-assets: copied ${copies.length} paths`);
