import type { ToastProps } from "../components/Toast";

export interface ToastContextType {
  showToast: (toast: Omit<ToastProps, "id" | "onClose">) => void;
  showSuccessToast: (title: string, message?: string) => void;
  showErrorToast: (title: string, message?: string) => void;
  showInfoToast: (title: string, message?: string) => void;
  showWarningToast: (title: string, message?: string) => void;
  // Funciones automáticas para CRUD
  showCreateSuccess: (entity: string, name?: string) => void;
  showUpdateSuccess: (entity: string, name?: string) => void;
  showDeleteSuccess: (entity: string, name?: string) => void;
  showOperationError: (operation: string, error?: string) => void;
}
