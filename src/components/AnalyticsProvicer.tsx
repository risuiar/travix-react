import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const GA_MEASUREMENT_ID = "G-N08YZT54PF";

// Componente para tracking global de navegación
const GlobalPageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.MODE !== "production" || !window.gtag) return;

    // Track page view on every route change
    window.gtag("event", "page_view", {
      page_path: location.pathname,
      page_title: document.title,
      page_location: window.location.href,
    });
  }, [location.pathname]);

  return null;
};

export const AnalyticsProvider = () => {
  useEffect(() => {
    if (import.meta.env.MODE !== "production") return;

    // 1. Insert Consent Mode before Google Analytics tag
    const consentScript = document.createElement("script");
    consentScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }

      // Consent Mode v2: estado inicial (antes de cargar gtag)
      gtag('consent', 'default', {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        functionality_storage: 'denied',
        personalization_storage: 'denied',
        security_storage: 'granted' // este puede quedar granted por defecto
      });
    `;
    document.head.appendChild(consentScript);

    // 2. Load Google Analytics script
    const script1 = document.createElement("script");
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script1.async = true;
    document.head.appendChild(script1);

    // 3. Initialize Google Analytics
    const script2 = document.createElement("script");
    script2.innerHTML = `
      gtag('js', new Date());
      gtag('config', '${GA_MEASUREMENT_ID}', {
        send_page_view: true,
        page_title: document.title,
        page_location: window.location.href
      });
    `;
    document.head.appendChild(script2);

    // Cleanup function
    return () => {
      document.head.removeChild(consentScript);
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, []);

  return <GlobalPageTracker />;
};
