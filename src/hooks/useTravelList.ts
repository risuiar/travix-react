import { useContext } from "react";
import { TravelListContext } from "../contexts/TravelContext";

export const useTravelList = () => {
  const context = useContext(TravelListContext);
  if (context === undefined) {
    throw new Error("useTravelList must be used within a TravelListProvider");
  }
  return context;
};
