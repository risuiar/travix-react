import React from "react";
import { X, DivideIcon as LucideIcon } from "lucide-react";
import { AdBannerResponsive } from "../AdBannerResponsive";

export type ModalHeaderType =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  type?: ModalHeaderType;
  icon?: LucideIcon;
  onClose: () => void;
  isLoading?: boolean;
}

export function ModalHeader({
  title,
  subtitle,
  type = "primary",
  icon: Icon,
  onClose,
  isLoading = false,
}: ModalHeaderProps) {
  const getTypeConfig = () => {
    switch (type) {
      case "success":
        return {
          gradient: "from-green-500 to-emerald-500",
          iconBg: "bg-white/20",
          iconColor: "text-white",
        };
      case "warning":
        return {
          gradient: "from-amber-500 to-orange-500",
          iconBg: "bg-white/20",
          iconColor: "text-white",
        };
      case "danger":
        return {
          gradient: "from-red-500 to-pink-500",
          iconBg: "bg-white/20",
          iconColor: "text-white",
        };
      case "info":
        return {
          gradient: "from-blue-500 to-cyan-500",
          iconBg: "bg-white/20",
          iconColor: "text-white",
        };
      case "primary":
      default:
        return {
          gradient: "from-blue-500 via-purple-600 to-indigo-700",
          iconBg: "bg-white/20",
          iconColor: "text-white",
        };
    }
  };

  const config = getTypeConfig();

  return (
    <>
      <div
        className={`bg-gradient-to-r ${config.gradient} p-6 text-white relative overflow-hidden`}
      >
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            {Icon && (
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 ${config.iconBg} rounded-xl flex items-center justify-center`}
              >
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${config.iconColor}`} />
              </div>
            )}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
              {subtitle && <p className="text-white/80 text-sm">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -right-4 -top-4 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-white/10 rounded-full"></div>
        <div className="absolute -left-8 -bottom-8 w-20 h-20 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-white/5 rounded-full"></div>
      </div>
      {/* Ad Banner */}
      <AdBannerResponsive area="small" provider="custom" className="mb-2" />
    </>
  );
}
