// Runs after `expo export -p web`: tidies dist/ for hosting and writes sitemap.xml from the pages
// that were actually built, so every indexable page is listed and nothing else is.
import { copyFileSync, existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const SITE_URL = 'https://ontaplaixe.com';
const DIST = 'dist';

// Duplicates of real pages (/(tabs)/exam), the dev route index, and unfilled dynamic-route templates.
const isJunk = (rel) => rel.startsWith('(') || rel === '_sitemap.html' || /\[[^\]]+\]\.html$/.test(rel);

const htmlFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (name === '_expo' || name === 'assets') return [];
    if (statSync(full).isDirectory()) return htmlFiles(full);
    return name.endsWith('.html') ? [full] : [];
  });

for (const file of htmlFiles(DIST)) {
  const rel = relative(DIST, file).split(sep).join('/');
  if (isJunk(rel)) rmSync(rel.startsWith('(') ? join(DIST, rel.split('/')[0]) : file, { recursive: true, force: true });
}

// Cloudflare serves 404.html with a 404 status for unknown paths (not_found_handling in wrangler.jsonc).
if (existsSync(join(DIST, '+not-found.html'))) copyFileSync(join(DIST, '+not-found.html'), join(DIST, '404.html'));

const urls = htmlFiles(DIST)
  .map((file) => ({ file, rel: relative(DIST, file).split(sep).join('/') }))
  .filter(({ rel }) => !rel.startsWith('+') && rel !== '404.html')
  .filter(({ file }) => !/<meta name="robots" content="noindex/.test(readFileSync(file, 'utf8')))
  .map(({ rel }) => (rel === 'index.html' ? '/' : `/${rel.replace(/\.html$/, '')}`))
  .sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b, 'en', { numeric: true })));

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE_URL}${encodeURI(u)}</loc></url>`).join('\n')}
</urlset>
`;
writeFileSync(join(DIST, 'sitemap.xml'), xml);
console.log(`postexport: sitemap.xml with ${urls.length} URLs`);
