import { useContext } from "react";
import { UserAuthContext } from "./UserAuthContext";

export const useUserAuthContext = () => {
  const context = useContext(UserAuthContext);
  if (context === undefined) {
    throw new Error(
      "useUserAuthContext must be used within a UserAuthProvider"
    );
  }
  return context;
};
