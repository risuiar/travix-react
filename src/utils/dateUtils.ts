/**
 * Utility functions for date handling
 */

/**
 * Get today's date as YYYY-MM-DD format
 */
export const getTodayDate = (): string => {
  const now = new Date();
  // Usar UTC para evitar desfases de zona horaria
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
};

/**
 * Get a date 7 days from today as YYYY-MM-DD format
 */
export const getNextWeekDate = (): string => {
  const now = new Date();
  const nextWeekUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 7);
  const nextWeek = new Date(nextWeekUTC);
  return `${nextWeek.getUTCFullYear()}-${String(nextWeek.getUTCMonth() + 1).padStart(2, '0')}-${String(nextWeek.getUTCDate()).padStart(2, '0')}`;
};

/**
 * Format a date string (YYYY-MM-DD) to a localized display format
 * @param dateString - Date in YYYY-MM-DD format
 * @param locale - Locale string (e.g., 'es', 'en', 'fr', 'de', 'it', 'pt')
 * @param options - Intl.DateTimeFormatOptions for custom formatting
 * @returns Formatted date string
 */
/**
 * Format a date string (YYYY-MM-DD) to a localized display format using manual UTC formatting
 * to avoid timezone issues
 */
export const formatDateForDisplay = (
  dateString: string,
  locale: string = "es"
): string => {
  try {
    const [year, month, day] = dateString.split("-").map(Number);
    // Crear fecha en UTC
    const date = new Date(Date.UTC(year, month - 1, day));
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    // Usar formateo manual para evitar problemas de zona horaria
    // Mapeo de meses en diferentes idiomas
    const monthNames: Record<string, string[]> = {
      "es": ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
      "es-ES": ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
      "en": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      "en-US": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      "de": ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
      "de-DE": ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
      "fr": ["janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"],
      "fr-FR": ["janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"],
      "it": ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"],
      "it-IT": ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"],
      "pt": ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"],
    };
    
    const utcDay = date.getUTCDate();
    const utcMonth = date.getUTCMonth();
    const utcYear = date.getUTCFullYear();
    
    const months = monthNames[locale] || monthNames["en"];
    const monthName = months[utcMonth];
    
    // Formato básico: "día mes año" (ej: "7 oct 2025" o "7. Okt. 2025")
    if (locale.startsWith("de")) {
      return `${utcDay}. ${monthName}. ${utcYear}`;
    } else if (locale.startsWith("en")) {
      return `${monthName} ${utcDay}, ${utcYear}`;
    } else {
      return `${utcDay} ${monthName} ${utcYear}`;
    }
  } catch {
    return dateString;
  }
};

/**
 * Format a date range for display to the user
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @param locale - Locale string
 * @returns Formatted date range string
 */
export const formatDateRangeForDisplay = (
  startDate: string,
  endDate: string,
  locale: string = "es"
): string => {
  try {
    const start = formatDateForDisplay(startDate, locale);
    const end = formatDateForDisplay(endDate, locale);

    // For same year, we might want to show a more compact format
    const [startYear] = startDate.split("-");
    const [endYear] = endDate.split("-");

    if (startYear === endYear) {
      // Same year - show more compact format without year repetition
      // Just use the regular format and remove year from first date
      const startWithoutYear = start.replace(startYear, "").trim().replace(/,$/, "");
      return `${startWithoutYear} - ${end}`;
    }

    return `${start} - ${end}`;
  } catch {
    return `${startDate} - ${endDate}`; // Return original strings if formatting fails
  }
};

/**
 * Get the day name for a given date
 * @param dateString - Date in YYYY-MM-DD format
 * @param locale - Locale string
 * @param options - Intl.DateTimeFormatOptions for day name formatting
 * @returns Day name string
 */
/**
 * Get the day name for a given date using manual UTC formatting
 */
export const getDayName = (
  dateString: string,
  locale: string = "es"
): string => {
  try {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (isNaN(date.getTime())) return dateString;
    
    // Mapeo de días de la semana en diferentes idiomas
    const dayNames: Record<string, string[]> = {
      "es": ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
      "es-ES": ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
      "en": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "en-US": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "de": ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
      "de-DE": ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
      "fr": ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
      "fr-FR": ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
      "it": ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"],
      "it-IT": ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"],
      "pt": ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"],
    };
    
    const utcDay = date.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.
    const days = dayNames[locale] || dayNames["en"];
    return days[utcDay];
  } catch {
    return dateString;
  }
};

/**
 * Get a short day name for a given date
 * @param dateString - Date in YYYY-MM-DD format
 * @param locale - Locale string
 * @returns Short day name string
 */
export const getShortDayName = (
  dateString: string,
  locale: string = "es"
): string => {
  try {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (isNaN(date.getTime())) return dateString;
    
    // Mapeo de días cortos en diferentes idiomas
    const shortDayNames: Record<string, string[]> = {
      "es": ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
      "es-ES": ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
      "en": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      "en-US": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      "de": ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
      "de-DE": ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
      "fr": ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"],
      "fr-FR": ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"],
      "it": ["dom", "lun", "mar", "mer", "gio", "ven", "sab"],
      "it-IT": ["dom", "lun", "mar", "mer", "gio", "ven", "sab"],
      "pt": ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"],
    };
    
    const utcDay = date.getUTCDay();
    const days = shortDayNames[locale] || shortDayNames["en"];
    return days[utcDay];
  } catch {
    return dateString;
  }
};

/**
 * Format a date for use in forms (YYYY-MM-DD)
 * @param date - Date object or date string
 * @returns Date in YYYY-MM-DD format
 */
export const formatDateForForm = (date: Date | string): string => {
  if (typeof date === "string") {
    return date;
  }
  // Usar UTC para formato consistente
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
};

/**
 * Parse a date string and return a Date object
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Date object
 */
export const parseDateString = (dateString: string): Date => {
  try {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
    return date;
  } catch {
    return new Date(NaN);
  }
};

/**
 * Check if a date string is valid
 * @param dateString - Date string to validate
 * @returns boolean indicating if the date is valid
 */
export const isValidDateString = (dateString: string): boolean => {
  try {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return false;
    }
    const [year, month, day] = dateString.split("-").map(Number);
    if (month < 1 || month > 12) {
      return false;
    }
    // Validar día usando UTC
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    if (day < 1 || day > daysInMonth) {
      return false;
    }
    const date = parseDateString(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};

/**
 * Calculate the trip day number based on start date and current/target date
 * @param startDate - Trip start date in YYYY-MM-DD format
 * @param targetDate - Target date in YYYY-MM-DD format (defaults to today)
 * @returns Trip day number (1-based)
 */
export const getTripDayNumber = (startDate: string, targetDate?: string): number => {
  try {
    const tripStart = parseDateString(startDate);
    const target = targetDate ? parseDateString(targetDate) : new Date();
    if (isNaN(tripStart.getTime()) || isNaN(target.getTime())) return 1;
    // Normalizar ambos a UTC 00:00
    const tripStartUTC = Date.UTC(tripStart.getUTCFullYear(), tripStart.getUTCMonth(), tripStart.getUTCDate());
    const targetUTC = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
    if (targetUTC < tripStartUTC) {
      return 1;
    }
    const daysDiff = Math.floor((targetUTC - tripStartUTC) / (1000 * 60 * 60 * 24));
    return daysDiff + 1;
  } catch {
    return 1;
  }
};

/**
 * Get the correct date and day info for trip overview
 * @param startDate - Trip start date in YYYY-MM-DD format
 * @param endDate - Trip end date in YYYY-MM-DD format
 * @returns Object with display date, day number, and status
 */
export const getTravelOverviewDayInfo = (startDate: string, endDate?: string) => {
  const today = getTodayDate();
  const tripStart = parseDateString(startDate);
  const currentDate = new Date();
  // Normalizar a UTC 00:00
  currentDate.setUTCHours(0, 0, 0, 0);
  tripStart.setUTCHours(0, 0, 0, 0);
  const isFutureTrip = currentDate < tripStart;
  const isTripActive = !isFutureTrip && (!endDate || currentDate <= parseDateString(endDate));
  if (isFutureTrip) {
    return {
      displayDate: startDate,
      dayNumber: 1,
      isToday: false,
      isFutureTrip: true,
      isTripActive: false
    };
  } else if (isTripActive) {
    const dayNumber = getTripDayNumber(startDate, today);
    return {
      displayDate: today,
      dayNumber,
      isToday: true,
      isFutureTrip: false,
      isTripActive: true
    };
  } else {
    const dayNumber = getTripDayNumber(startDate, today);
    return {
      displayDate: today,
      dayNumber,
      isToday: true,
      isFutureTrip: false,
      isTripActive: false
    };
  }
};
