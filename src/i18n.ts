import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translations
import es from "./locales/es.json";
import en from "./locales/en.json";
import de from "./locales/de.json";
import it from "./locales/it.json";
import fr from "./locales/fr.json";
import pt from "./locales/pt.json";

const resources = {
  es: {
    translation: es,
  },
  en: {
    translation: en,
  },
  de: {
    translation: de,
  },
  it: {
    translation: it,
  },
  fr: {
    translation: fr,
  },
  pt: {
    translation: pt,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "es",
    supportedLngs: ["es", "en", "de", "it", "fr", "pt"],
    debug: false,

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },

    react: {
      useSuspense: false,
      bindI18n: "languageChanged loaded", // Reduce unnecessary re-renders
      bindI18nStore: false, // Don't bind to store changes
    },

    // Disable automatic language detection after initial load
    load: "languageOnly", // Load only main language, not region variants
    cleanCode: true, // Clean language codes
    nonExplicitSupportedLngs: false, // Don't fallback to non-explicit langs
  });

export default i18n;
