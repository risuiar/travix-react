import { createContext } from "react";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark" | "auto") => void;
  currentTheme: "light" | "dark" | "auto";
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);
