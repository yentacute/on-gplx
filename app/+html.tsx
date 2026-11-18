import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import type { PropsWithChildren } from 'react';
import { DEFAULT_SEO, SITE_NAME, SITE_URL } from '@/seo/pages';

// Root HTML for every statically rendered web page. Runs only in Node at build time.
// Per-page title, description and social tags come from <RouteSeo /> in app/_layout.tsx.

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      inLanguage: 'vi-VN',
    },
    {
      '@type': 'WebApplication',
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      description: DEFAULT_SEO.description,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web, Android, iOS',
      inLanguage: 'vi-VN',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'VND' },
    },
  ],
};

const Root = ({ children }: PropsWithChildren) => {
  // headNodes holds the route's generateMetadata tags plus the CSS/JS bundles; bodyNodes the scripts.
  const { htmlAttributes, bodyAttributes, headNodes, bodyNodes } = useServerDocumentContext();
  return (
    <html {...htmlAttributes} lang="vi">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="application-name" content={SITE_NAME} />
        <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
        <meta name="format-detection" content="telephone=no" />
        <meta name="google-site-verification" content="fAPfkbdORdNVDQGY70O1a2b2ctOqiMPkZrCdgVTH_1U" />
        <meta name="google-site-verification" content="hu1bcwgZDTecUm35fkGH6qf9T0YbWfnZzFXVLJq23pU" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }} />
        <ScrollViewStyleReset />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
};

export default Root;
