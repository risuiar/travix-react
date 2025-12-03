import { createContext } from "react";

interface CurrencyContextType {
  userCurrency: string;
  setUserCurrency: (currency: string) => void;
  isLoading: boolean;
}

export const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);
