import { useEffect } from 'react';
import { favicons } from '../assets/favicons';

export const FaviconUpdater = () => {
  useEffect(() => {
    // Función para actualizar favicons dinámicamente
    const updateFavicons = () => {
      // Limpiar favicons existentes
      const existingFavicons = document.querySelectorAll('link[rel*="icon"], link[rel="manifest"], link[rel="apple-touch-icon"]');
      existingFavicons.forEach(link => link.remove());

      const head = document.head;

      // Favicon PNG 96x96 (principal)
      const favicon96Link = document.createElement('link');
      favicon96Link.rel = 'icon';
      favicon96Link.type = 'image/png';
      favicon96Link.href = favicons.favicon96;
      favicon96Link.sizes = '96x96';
      head.appendChild(favicon96Link);

      // Favicon SVG
      const faviconSvgLink = document.createElement('link');
      faviconSvgLink.rel = 'icon';
      faviconSvgLink.type = 'image/svg+xml';
      faviconSvgLink.href = favicons.svg;
      head.appendChild(faviconSvgLink);

      // Shortcut icon (ICO)
      const shortcutLink = document.createElement('link');
      shortcutLink.rel = 'shortcut icon';
      shortcutLink.href = favicons.ico;
      head.appendChild(shortcutLink);

      // Apple Touch Icon
      const appleTouchLink = document.createElement('link');
      appleTouchLink.rel = 'apple-touch-icon';
      appleTouchLink.sizes = '180x180';
      appleTouchLink.href = favicons.appleTouchIcon;
      head.appendChild(appleTouchLink);

      // Web App Manifest
      const manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = favicons.manifest;
      head.appendChild(manifestLink);

      // Actualizar meta tag de apple-mobile-web-app-title
      let appTitleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
      if (appTitleMeta) {
        appTitleMeta.setAttribute('content', 'Travix');
      } else {
        appTitleMeta = document.createElement('meta');
        appTitleMeta.setAttribute('name', 'apple-mobile-web-app-title');
        appTitleMeta.setAttribute('content', 'Travix');
        head.appendChild(appTitleMeta);
      }

    };

    updateFavicons();
  }, []);

  return null; // Este componente no renderiza nada
};
