import { createContext } from "react";
import { TravelContextType, TravelListContextType } from "../lib/travelUtils";

export const TravelListContext = createContext<
  TravelListContextType | undefined
>(undefined);

export const TravelContext = createContext<TravelContextType | undefined>(
  undefined
);
