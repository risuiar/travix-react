import React from "react";
import { useUserAuthContext } from "../contexts/useUserAuthContext";
import type { UserTier } from "../lib/userUtils";

interface UserTierBadgeProps {
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

export const UserTierBadge: React.FC<UserTierBadgeProps> = ({
  size = "md",
  showIcon = true,
  className = "",
}) => {
  const { userAuthData } = useUserAuthContext();

  const getTierConfig = (tier: UserTier) => {
    switch (tier) {
      case "free":
        return {
          label: "Free",
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
          icon: "🌟",
        };
      case "premium":
        return {
          label: "Premium",
          bgColor: "bg-purple-100",
          textColor: "text-purple-700",
          borderColor: "border-purple-200",
          icon: "💎",
        };
      case "ultimate":
        return {
          label: "Ultimate",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-700",
          borderColor: "border-yellow-200",
          icon: "👑",
        };
      default:
        return {
          label: "Free",
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
          icon: "🌟",
        };
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case "sm":
        return "px-2 py-1 text-xs";
      case "lg":
        return "px-3 py-2 text-sm";
      default:
        return "px-2.5 py-1.5 text-xs";
    }
  };

  const config = getTierConfig(userAuthData?.premium_status || "free");
  const sizeClasses = getSizeClasses(size);

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses} font-medium ${className}`}
    >
      {showIcon && <span className="text-sm">{config.icon}</span>}
      <span>{config.label}</span>
    </div>
  );
};
