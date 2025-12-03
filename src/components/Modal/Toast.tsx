import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  visible: boolean;
  onClose: () => void;
  duration?: number; // ms
}

const typeStyles = {
  success: "bg-green-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-blue-600 text-white",
};

export const Toast: React.FC<ToastProps> = ({
  message,
  type = "info",
  visible,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!visible) return null;

  return (
    <div
      className={`fixed z-50 left-1/2 top-8 transform -translate-x-1/2 transition-all duration-300 ${
        visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      } shadow-lg rounded-lg px-6 py-3 flex items-center gap-3 ${
        typeStyles[type] || typeStyles.info
      }`}
      role="alert"
    >
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-3 text-white/80 hover:text-white text-lg font-bold focus:outline-none"
        aria-label="Close"
        type="button"
      >
        ×
      </button>
    </div>
  );
};
