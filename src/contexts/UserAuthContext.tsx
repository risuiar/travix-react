import { createContext } from "react";
import type { UserAuthData } from "../utils/api/travelApi";

interface UserAuthContextType {
  userAuthData: UserAuthData | null | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const UserAuthContext = createContext<UserAuthContextType | undefined>(
  undefined
);
