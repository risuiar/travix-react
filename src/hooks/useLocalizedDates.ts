import { useMemo } from "react";
import { useLanguage } from "./useLanguage";
import {
  formatDateForDisplay,
  formatDateRangeForDisplay,
  getDayName,
  getShortDayName,
  formatDateForForm,
  parseDateString,
  isValidDateString,
} from "../utils/dateUtils";

/**
 * Hook that provides localized date formatting functions
 * Uses the current language from LanguageContext
 */
export const useLocalizedDates = () => {
  const { currentLanguage } = useLanguage();

  // Map language codes to locale strings for better date formatting
  const getLocaleFromLanguage = (language: string): string => {
    const localeMap: Record<string, string> = {
      es: "es-ES",
      en: "en-US",
      fr: "fr-FR",
      de: "de-DE",
      it: "it-IT",
      pt: "pt", // Simple Portuguese locale - works for all Portuguese variants
    };
    return localeMap[language] || language;
  };

  const locale = getLocaleFromLanguage(currentLanguage);

  return useMemo(
    () => ({
      /**
       * Format a date string for display using current locale
       */
      formatDate: (dateString: string, options?: Intl.DateTimeFormatOptions) =>
        formatDateForDisplay(dateString, locale, options),

      /**
       * Format a date range for display using current locale
       */
      formatDateRange: (
        startDate: string,
        endDate: string,
        options?: Intl.DateTimeFormatOptions
      ) => formatDateRangeForDisplay(startDate, endDate, locale, options),

      /**
       * Get the full day name for a date using current locale
       */
      getDayName: (dateString: string, options?: Intl.DateTimeFormatOptions) =>
        getDayName(dateString, locale, options),

      /**
       * Get the short day name for a date using current locale
       */
      getShortDayName: (dateString: string) =>
        getShortDayName(dateString, locale),

      /**
       * Format a date for form input (YYYY-MM-DD)
       */
      formatDateForForm,

      /**
       * Parse a date string to Date object
       */
      parseDateString,

      /**
       * Validate a date string
       */
      isValidDateString,

      /**
       * Current locale being used
       */
      locale,

      /**
       * Current language code
       */
      currentLanguage,
    }),
    [locale, currentLanguage]
  );
};
