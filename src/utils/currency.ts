import type { Travel } from "../types";

// Cache para formateadores de moneda
const formatterCache = new Map<string, Intl.NumberFormat>();

const getCachedFormatter = (
  currency: string,
  showCents: boolean
): Intl.NumberFormat => {
  const cacheKey = `${currency}-${showCents}`;

  if (!formatterCache.has(cacheKey)) {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: showCents ? 2 : 0,
      maximumFractionDigits: showCents ? 2 : 0,
    });
    formatterCache.set(cacheKey, formatter);
  }

  return formatterCache.get(cacheKey) ?? new Intl.NumberFormat("en-US");
};

export const CURRENCIES = {
  EUR: { symbol: "€", name: "Euro", rate: 1 },
  USD: { symbol: "$", name: "US Dollar", rate: 1.1 },
  JPY: { symbol: "¥", name: "Japanese Yen", rate: 130 },
  GBP: { symbol: "£", name: "British Pound", rate: 0.85 },
  CAD: { symbol: "C$", name: "Canadian Dollar", rate: 1.5 },
  AUD: { symbol: "A$", name: "Australian Dollar", rate: 1.65 },
  CHF: { symbol: "CHF", name: "Swiss Franc", rate: 0.95 },
  CNY: { symbol: "¥", name: "Chinese Yuan", rate: 7.8 },
  INR: { symbol: "₹", name: "Indian Rupee", rate: 90 },
  BRL: { symbol: "R$", name: "Brazilian Real", rate: 5.5 },
  MXN: { symbol: "$", name: "Mexican Peso", rate: 18 },
  ARS: { symbol: "$", name: "Argentine Peso", rate: 350 },
  CLP: { symbol: "$", name: "Chilean Peso", rate: 950 },
  COP: { symbol: "$", name: "Colombian Peso", rate: 4200 },
  PEN: { symbol: "S/", name: "Peruvian Sol", rate: 3.7 },
  UYU: { symbol: "$", name: "Uruguayan Peso", rate: 38 },
  VEF: { symbol: "Bs", name: "Venezuelan Bolivar", rate: 35 },
};

export const formatCurrency = (
  amount: number,
  currencyOrTravel: string | Travel,
  showCents: boolean = false,
  userCurrency?: string
): string => {
  // Si el monto es null, undefined, 0 o NaN, mostrar "-"
  if (!amount || amount === 0 || isNaN(amount)) {
    return "-";
  }

  let currency: string;

  if (typeof currencyOrTravel === "string") {
    currency = currencyOrTravel;
  } else {
    // Si es un objeto Travel, usar la moneda del contexto si está disponible
    currency = userCurrency || getDefaultCurrency();
  }

  const formatter = getCachedFormatter(currency, showCents);
  const result = formatter.format(amount);

  return result;
};

export const getCurrencyDisplay = (currencyCode: string): string => {
  const currency = CURRENCIES[currencyCode as keyof typeof CURRENCIES];
  if (!currency) return currencyCode;
  return `${currency.symbol} ${currency.name}`;
};

export const getCurrencySymbol = (currencyCode: string): string => {
  const currency = CURRENCIES[currencyCode as keyof typeof CURRENCIES];
  return currency?.symbol || currencyCode;
};

export const getCurrencyName = (currencyCode: string): string => {
  const currency = CURRENCIES[currencyCode as keyof typeof CURRENCIES];
  return currency?.name || currencyCode;
};

// Función para obtener la moneda por defecto
export const getDefaultCurrency = (): string => {
  const defaultCurrency = localStorage.getItem("defaultCurrency") || "EUR";
  return defaultCurrency;
};
