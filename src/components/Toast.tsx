import React, { useEffect, useState, useCallback } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  AlertTriangle,
} from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  }, [id, onClose]);

  useEffect(() => {
    // Entrada animada
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  const getToastConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: CheckCircle2,
          bgColor: "bg-gradient-to-r from-green-500 to-emerald-500",
          borderColor: "border-green-200",
          iconBg: "bg-green-100",
          iconColor: "text-green-600",
          progressColor: "bg-green-300",
        };
      case "error":
        return {
          icon: AlertCircle,
          bgColor: "bg-gradient-to-r from-red-500 to-pink-500",
          borderColor: "border-red-200",
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          progressColor: "bg-red-300",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          bgColor: "bg-gradient-to-r from-amber-500 to-orange-500",
          borderColor: "border-amber-200",
          iconBg: "bg-amber-100",
          iconColor: "text-amber-600",
          progressColor: "bg-amber-300",
        };
      case "info":
        return {
          icon: Info,
          bgColor: "bg-gradient-to-r from-blue-500 to-purple-500",
          borderColor: "border-blue-200",
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
          progressColor: "bg-blue-300",
        };
    }
  };

  const config = getToastConfig();
  const Icon = config.icon;

  return (
    <div
      className={`
        relative bg-white rounded-2xl shadow-2xl border ${config.borderColor}
        transform transition-all duration-300 ease-out overflow-hidden
        ${
          isVisible && !isLeaving
            ? "translate-x-0 opacity-100 scale-100"
            : "translate-x-full opacity-0 scale-95"
        }
        hover:scale-105 hover:shadow-3xl
        max-w-sm w-full
      `}
    >
      {/* Gradient Header */}
      <div className={`${config.bgColor} p-3 relative`}>
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 ${config.iconBg} rounded-xl flex items-center justify-center shadow-sm`}
          >
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white text-sm truncate">
              {title}
            </h4>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors duration-200"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -right-2 -top-2 w-16 h-16 bg-white/10 rounded-full"></div>
        <div className="absolute -left-4 -bottom-4 w-12 h-12 bg-white/5 rounded-full"></div>
      </div>

      {/* Content */}
      {message && (
        <div className="p-3">
          <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
        </div>
      )}

      {/* Progress Bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
          <div
            className={`h-full ${config.progressColor} transition-all duration-100 ease-linear`}
            style={{
              animation: `shrink ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
