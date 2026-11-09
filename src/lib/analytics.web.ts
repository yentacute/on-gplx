export const GA_MEASUREMENT_ID = 'G-XCMS02ZVBJ';

type GtagWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

let installed = false;

export const installGoogleAnalytics = () => {
  if (installed) return;
  installed = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  const w = window as GtagWindow;
  w.dataLayer = w.dataLayer || [];
  w.gtag = (...args: unknown[]) => {
    w.dataLayer?.push(args);
  };
  w.gtag('js', new Date());
  w.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
};

export const trackPageView = (path: string, title: string) => {
  (window as GtagWindow).gtag?.('event', 'page_view', {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  });
};
