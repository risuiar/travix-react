import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  shadow?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  border?: "none" | "default" | "yellow";
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  hover?: boolean;
  onClick?: () => void;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  padding = "md",
  shadow = "sm",
  border = "default",
  rounded = "lg",
  hover = true,
  onClick,
}) => {
  const getPaddingClasses = () => {
    switch (padding) {
      case "none":
        return "";
      case "sm":
        return "p-2";
      case "md":
        return "p-3";
      case "lg":
        return "p-4";
      case "xl":
        return "p-6";
      default:
        return "p-3";
    }
  };

  const getShadowClasses = () => {
    switch (shadow) {
      case "none":
        return "";
      case "sm":
        return "shadow-sm";
      case "md":
        return "shadow-md";
      case "lg":
        return "shadow-lg";
      case "xl":
        return "shadow-xl";
      case "2xl":
        return "shadow-2xl";
      default:
        return "shadow-sm";
    }
  };

  const getBorderClasses = () => {
    switch (border) {
      case "none":
        return "";
      case "default":
        return "border border-gray-200 dark:border-gray-700";
      case "yellow":
        return "border border-yellow-300 dark:border-yellow-600";
      default:
        return "border border-gray-200 dark:border-gray-700";
    }
  };

  const getRoundedClasses = () => {
    switch (rounded) {
      case "none":
        return "";
      case "sm":
        return "rounded-sm";
      case "md":
        return "rounded-md";
      case "lg":
        return "rounded-lg";
      case "xl":
        return "rounded-xl";
      case "2xl":
        return "rounded-2xl";
      case "full":
        return "rounded-full";
      default:
        return "rounded-lg";
    }
  };

  const baseClasses = "bg-white dark:bg-gray-800";
  const paddingClasses = getPaddingClasses();
  const shadowClasses = getShadowClasses();
  const borderClasses = getBorderClasses();
  const roundedClasses = getRoundedClasses();
  const hoverClasses = hover
    ? "hover:shadow-md transition-all duration-300"
    : "";
  const cursorClasses = onClick ? "cursor-pointer" : "";

  const combinedClasses = [
    baseClasses,
    paddingClasses,
    shadowClasses,
    borderClasses,
    roundedClasses,
    hoverClasses,
    cursorClasses,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={combinedClasses} onClick={onClick}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = "",
  padding = "md",
}) => {
  const getPaddingClasses = () => {
    switch (padding) {
      case "none":
        return "";
      case "sm":
        return "p-2";
      case "md":
        return "p-3";
      case "lg":
        return "p-4";
      default:
        return "p-3";
    }
  };

  const baseClasses = "border-b border-gray-200 dark:border-gray-600";
  const paddingClasses = getPaddingClasses();

  return (
    <div className={`${baseClasses} ${paddingClasses} ${className}`}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = "",
  padding = "md",
}) => {
  const getPaddingClasses = () => {
    switch (padding) {
      case "none":
        return "";
      case "sm":
        return "p-2";
      case "md":
        return "p-3";
      case "lg":
        return "p-4";
      default:
        return "p-3";
    }
  };

  const paddingClasses = getPaddingClasses();

  return <div className={`${paddingClasses} ${className}`}>{children}</div>;
};
