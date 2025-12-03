import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  AlertCircle,
  Trash2,
  Save,
  Download,
  Share2,
} from "lucide-react";
import { ModalHeader } from "./ModalHeader";

export type ConfirmType = "danger" | "success" | "warning" | "info";
export type ConfirmAction = "delete" | "save" | "export" | "share" | "custom";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: ConfirmType;
  action?: ConfirmAction;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  isAlert?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "info",
  action = "custom",
  confirmText,
  cancelText = "Cancel",
  isLoading = false,
  isAlert = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getTypeConfig = () => {
    switch (type) {
      case "danger":
        return {
          icon: AlertTriangle,
          confirmBg: "bg-red-500 hover:bg-red-600",
          borderColor: "border-red-200",
          headerType: "danger" as const,
        };
      case "success":
        return {
          icon: CheckCircle2,
          confirmBg: "bg-green-500 hover:bg-green-600",
          borderColor: "border-green-200",
          headerType: "success" as const,
        };
      case "warning":
        return {
          icon: AlertCircle,
          confirmBg: "bg-amber-500 hover:bg-amber-600",
          borderColor: "border-amber-200",
          headerType: "warning" as const,
        };
      case "info":
        return {
          icon: Info,
          confirmBg: "bg-blue-500 hover:bg-blue-600",
          borderColor: "border-blue-200",
          headerType: "info" as const,
        };
    }
  };

  const getActionIcon = () => {
    switch (action) {
      case "delete":
        return Trash2;
      case "save":
        return Save;
      case "export":
        return Download;
      case "share":
        return Share2;
      default:
        return null;
    }
  };

  const getDefaultConfirmText = () => {
    if (confirmText) return confirmText;

    switch (action) {
      case "delete":
        return "Delete";
      case "save":
        return "Save";
      case "export":
        return "Export";
      case "share":
        return "Share";
      default:
        return "Confirm";
    }
  };

  const config = getTypeConfig();
  const ActionIcon = getActionIcon();

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader
          title={title}
          subtitle="Please confirm your action"
          type={config.headerType}
          icon={config.icon}
          onClose={onClose}
          isLoading={isLoading}
        />

        {/* Content */}
        <div className="p-6">
          {/* Message */}
          <div
            className={`bg-gray-50 rounded-xl p-4 mb-6 border-2 border-dashed ${config.borderColor}`}
          >
            <p className="text-gray-700 leading-relaxed text-center">
              {message}
            </p>
          </div>

          {/* Action Buttons */}
          {isAlert ? (
            // Alert mode - solo botón OK
            <div className="flex justify-center">
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`px-8 py-3 ${config.confirmBg} text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  "OK"
                )}
              </button>
            </div>
          ) : (
            // Confirm mode - botones Cancel y Confirm
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 ${config.confirmBg} text-white py-3 px-6 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {ActionIcon && <ActionIcon className="w-4 h-4" />}
                    {getDefaultConfirmText()}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Additional Info */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <span>Press ESC to {isAlert ? "close" : "cancel"}</span>
              <span>•</span>
              <span>Click outside to close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
