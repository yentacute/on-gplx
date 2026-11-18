import { QUESTIONS } from '../../lib/data';

// The question bank for the interactive quiz and exam screens, fetched once and cached by the browser.
export const GET = () =>
  new Response(JSON.stringify(QUESTIONS), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
