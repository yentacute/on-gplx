import type { APIRoute } from 'astro';
import { CHAPTERS, LANDING_CLASSES, QUESTIONS, SIGNS, paths } from '../lib/data';

// Indexable pages only: the quiz and exam screens are noindex and left out.
export const GET: APIRoute = ({ site }) => {
  const urls = [
    '/',
    '/on-tap',
    '/thi-thu',
    '/bien-bao',
    '/meo-ghi-nho',
    paths.allQuestions,
    paths.critical,
    ...LANDING_CLASSES.map((c) => paths.licenseClass(c.id)),
    ...CHAPTERS.map((c) => paths.chapter(c)),
    ...QUESTIONS.map((q) => paths.question(q.id)),
    ...SIGNS.map((s) => paths.sign(s)),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${site!.origin}${encodeURI(u)}</loc></url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
