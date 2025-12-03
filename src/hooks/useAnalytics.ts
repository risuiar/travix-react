export const useAnalytics = () => {
  const isProd = import.meta.env.MODE === "production";

  const trackPageView = (path: string) => {
    if (!isProd || typeof window === "undefined" || !window.gtag) return;
    window.gtag("event", "page_view", {
      page_path: path,
    });
  };

  const trackEvent = (
    name: string,
    params: Record<string, string | number | boolean> = {}
  ) => {
    if (!isProd || typeof window === "undefined" || !window.gtag) return;
    window.gtag("event", name, params);
  };

  return {
    trackPageView,
    trackEvent,
  };
};
