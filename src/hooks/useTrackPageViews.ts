import { usePathname } from 'expo-router';
import { useEffect } from 'react';
import { installGoogleAnalytics, trackPageView } from '@/lib/analytics';

export const useTrackPageViews = () => {
  const pathname = usePathname();

  useEffect(() => {
    installGoogleAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(pathname, typeof document === 'undefined' ? '' : document.title);
  }, [pathname]);
};
