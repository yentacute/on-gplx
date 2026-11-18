import { usePathname } from 'expo-router';
import Head from 'expo-router/head';
import { pageTitle } from './pages';

/**
 * Keeps the browser tab title in step with client-side navigation. The full set of SEO tags is
 * written into each page's static HTML by the route's `generateMetadata` export.
 */
export const RouteSeo = () => {
  const pathname = usePathname();
  return (
    <Head>
      <title>{pageTitle(pathname)}</title>
    </Head>
  );
};
