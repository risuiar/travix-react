import React from "react";

export interface AuthButtonProps {
  onLoginSuccess?: () => void;
  onLoginError?: (error: Error | string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  title?: string;
}

export const AuthButtonBase: React.FC<AuthButtonProps> = ({
  isLoading = false,
  disabled = false,
  variant = "primary",
  children,
  onClick,
  className = "",
  title,
}) => {
  const getButtonClasses = () => {
    const baseClasses =
      "flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm w-full";

    if (disabled) {
      return `${baseClasses} bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed`;
    }

    if (variant === "secondary") {
      return `${baseClasses} bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed ${className}`;
    }

    return `${baseClasses} bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed ${className}`;
  };

  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className={getButtonClasses()}
      title={title}
    >
      {children}
    </button>
  );
};
