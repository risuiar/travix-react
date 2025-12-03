import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "react-i18next";

export const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
      title={isDarkMode ? t("theme.switchToLight") : t("theme.switchToDark")}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );
};
