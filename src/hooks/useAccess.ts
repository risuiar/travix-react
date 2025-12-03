import { useContext } from "react";
import { AccessContext } from "../contexts/AccessContext";

export const useAccess = () => {
  const context = useContext(AccessContext);
  if (context === undefined) {
    throw new Error("useAccess must be used within an AccessProvider");
  }
  return context;
};
