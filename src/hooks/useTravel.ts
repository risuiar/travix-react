import { useContext } from "react";
import { TravelContext } from "../contexts/TravelContext";

export const useTravel = () => {
  const context = useContext(TravelContext);
  if (context === undefined) {
    throw new Error("useTravel must be used within a TravelProvider");
  }
  return context;
};
