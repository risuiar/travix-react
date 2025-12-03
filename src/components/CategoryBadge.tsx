import React from "react";
import { useTranslation } from "react-i18next";

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  className = "",
}) => {
  const { t } = useTranslation();

  const getCategoryStyle = (category: string) => {
    const colors: Record<string, string> = {
      outdoor:
        "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700",
      cultural:
        "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700",
      food: "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700",
      sightseeing:
        "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700",
      nature:
        "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700",
      nature_outdoor:
        "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700",
      transport:
        "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700",
      shopping:
        "bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-700",
      entertainment:
        "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700",
      relaxation:
        "bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-700",
      adventure:
        "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700",
      accommodation:
        "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700",
    };

    return (
      colors[category.toLowerCase()] ||
      "bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
    );
  };

  const getCategoryLabel = (category: string): string => {
    const normalizedCategory = category.toLowerCase();
    const translationKey = `categories.${normalizedCategory}`;
    const translated = t(translationKey) as string;

    if (translated !== translationKey) return translated;

    // Fallback legible si no hay traducción
    return category.replace(/_/g, " ");
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full border ${getCategoryStyle(
        category
      )} ${className}`}
    >
      {getCategoryLabel(category)}
    </span>
  );
};
