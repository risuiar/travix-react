import { createContext } from "react";
import type { ToastContextType } from "../lib/toastUtils";

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);
