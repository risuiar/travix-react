import { createContext } from "react";

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  isLoading: boolean;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);
