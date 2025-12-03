import { createContext } from "react";

interface AccessContextType {
  hasAccess: boolean | null;
  accessChecked: boolean;
  checkingAccess: boolean;
  accessError: string | null;
  checkAccess: () => Promise<void>;
}

export const AccessContext = createContext<AccessContextType | undefined>(
  undefined
);
