import { createContext } from "react";
import type { UserContextType } from "../lib/userUtils";

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);
