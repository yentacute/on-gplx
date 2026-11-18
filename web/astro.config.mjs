// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Every page is pre-rendered to its own .html file (e.g. dist/cau-hoi/12.html), so the URLs stay
// identical to the Expo web export: /cau-hoi/12, not /cau-hoi/12/.
export default defineConfig({
  site: 'https://ontaplaixe.com',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    // Pin the tsconfig: otherwise Vite walks up to the Expo app's ../tsconfig.json, which extends a
    // package that is only installed in the root node_modules.
    tsconfig: './tsconfig.json',
  },
});
