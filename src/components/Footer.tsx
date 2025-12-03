import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAnalytics } from "../hooks/useAnalytics";
// import { Instagram, Twitter, Facebook, Mail, Globe } from "lucide-react";
import { Mail, Globe } from "lucide-react";
import logoImage from "../assets/images/logo.webp";
// import { FooterBanner } from "./FooterBanner";

const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { trackEvent } = useAnalytics();

  // Use resolvedLanguage which is more stable than language
  // and memoize the URLs to prevent frequent recalculations
  const { termsUrl, privacyUrl } = useMemo(() => {
    const currentLanguage = i18n.resolvedLanguage || i18n.language || 'en';
    
    const getLanguageUrl = (path: string) => {
      if (currentLanguage === 'en') {
        return `https://travix.app${path}`;
      }
      return `https://travix.app/${currentLanguage}${path}`;
    };

    return {
      termsUrl: getLanguageUrl("/terms"),
      privacyUrl: getLanguageUrl("/privacy")
    };
  }, [i18n.resolvedLanguage, i18n.language]);

  return (
    <>
      {/* Banner fijo del footer 
      <FooterBanner />*/}

      <footer className="bg-[#181F2A] text-gray-200 mt-4 pt-4 pb-4 px-4 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Top grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 flex items-center justify-center">
                  <img
                    src={logoImage}
                    alt="Travix Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="font-bold text-lg text-white leading-tight">
                    {t("common.appName")}
                  </div>
                  <div className="text-xs text-gray-400 leading-tight">
                    {t("footer.tagline")}
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4 mt-2">
                {t("footer.description")}
              </p>
              {/* Social Media - Commented out
              <div className="flex gap-3 mt-2">
                <a
                  href="#"
                  className="p-2 rounded-lg bg-[#232B3B] hover:bg-blue-600 transition"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="#"
                  className="p-2 rounded-lg bg-[#232B3B] hover:bg-blue-600 transition"
                >
                  <Twitter size={18} />
                </a>
                <a
                  href="#"
                  className="p-2 rounded-lg bg-[#232B3B] hover:bg-blue-600 transition"
                >
                  <Facebook size={18} />
                </a>
              </div>
              */}
            </div>

            {/* Contact Info */}
            <div>
              <div className="font-bold text-white mb-3">
                {t("footer.stayConnected")}
              </div>
              <ul className="space-y-2 text-sm mb-4">
                <li className="flex items-center gap-2">
                  <Mail size={16} /> hello@travix.app
                </li>
                <li className="flex items-center gap-2">
                  <Globe size={16} /> travix.app
                </li>
              </ul>
            </div>
          </div>
          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row justify-between items-center border-t border-[#232B3B] pt-6 mt-4 text-xs text-gray-500 gap-2">
            <div className="flex items-center gap-1">
              {t("footer.madeWithLove")}
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <a 
                href={termsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition-colors"
              >
                {t("footer.termsOfService")}
              </a>
              <a 
                href={privacyUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition-colors"
              >
                {t("footer.privacyPolicy")}
              </a>
              <a 
                href="/how-works"
                onClick={() => {
                  trackEvent('footer_how_works_clicked', {
                    page: window.location.pathname,
                  });
                }}
                className="hover:text-blue-400 transition-colors"
              >
                {t("footer.howWorks")}
              </a>
            </div>
          </div>
          <div className="text-center text-xs text-gray-500 mt-2">
            {t("footer.allRightsReserved")}
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
