import { CategoryInfo } from "../types";

export type Category =
  | "food"
  | "transportation"
  | "shopping"
  | "sightseeing"
  | "guided_tours"
  | "cultural"
  | "nature_outdoor"
  | "wellness"
  | "nightlife"
  | "health"
  | "other";

// Unified category system for both activities and expenses
export const CATEGORIES: Record<Category, CategoryInfo> = {
  food: {
    icon: "utensils",
    color: "#FF6B6B",
  },
  transportation: {
    icon: "car",
    color: "#4ECDC4",
  },

  shopping: {
    icon: "shopping-bag",
    color: "#FECA57",
  },
  sightseeing: {
    icon: "map-pin",
    color: "#9B59B6",
  },
  guided_tours: {
    icon: "users",
    color: "#3498DB",
  },
  cultural: {
    icon: "landmark",
    color: "#E67E22",
  },
  nature_outdoor: {
    icon: "tree-pine",
    color: "#27AE60",
  },
  wellness: {
    icon: "heart",
    color: "#E91E63",
  },
  nightlife: {
    icon: "moon",
    color: "#8E44AD",
  },
  health: {
    icon: "stethoscope",
    color: "#E74C3C",
  },
  other: {
    icon: "more-horizontal",
    color: "#95A5A6",
  },
};

/**
 * Get category info by key
 */
export const getCategoryInfo = (key: Category): CategoryInfo => {
  return CATEGORIES[key] || CATEGORIES.other;
};

/**
 * Get all category keys
 */
export const getCategoryKeys = (): Category[] => {
  return Object.keys(CATEGORIES) as Category[];
};

/**
 * Get category name by key (uses translation)
 */
export const getCategoryName = (key: Category): string => {
  // This function should be used with t() from react-i18next
  // Example: t(`categories.${key}`)
  return key;
};

/**
 * Get category icon by key
 */
export const getCategoryIcon = (key: Category): string => {
  return CATEGORIES[key]?.icon || CATEGORIES.other.icon;
};

/**
 * Get category color by key
 */
export const getCategoryColor = (key: Category): string => {
  return CATEGORIES[key]?.color || CATEGORIES.other.color;
};

// Export for backward compatibility
export const EXPENSE_CATEGORIES = CATEGORIES;
export const ACTIVITY_CATEGORIES = CATEGORIES;

/**
 * Common category keys used across modals
 */
export const COMMON_CATEGORY_KEYS = [
  "food",
  "transportation",
  "shopping",
  "sightseeing",
  "guided_tours",
  "cultural",
  "nature_outdoor",
  "wellness",
  "nightlife",
  "health",
  "other",
] as const;

/**
 * Common currencies used across the app
 */
export const COMMON_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CAD",
  "AUD",
  "CHF",
  "CNY",
] as const;
