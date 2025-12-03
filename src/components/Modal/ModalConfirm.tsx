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
import ModalClean from "./ModalClean";
import { ModalHeader } from "./ModalHeader";
import { useTranslation } from "react-i18next";

export type ConfirmType = "danger" | "success" | "warning" | "info";
export type ConfirmAction = "delete" | "save" | "export" | "share" | "custom";

interface ModalConfirmProps {
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

export function ModalConfirm({
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
}: ModalConfirmProps) {
  const { t } = useTranslation();
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
        return t("common.delete");
      case "save":
        return t("common.save");
      case "export":
        return t("common.exportData");
      case "share":
        return t("common.shareTrip");
      default:
        return t("common.confirm");
    }
  };

  const config = getTypeConfig();
  const ActionIcon = getActionIcon();

  return (
    <ModalClean isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-gray-800">
        <ModalHeader
          title={title}
          subtitle={
            isAlert ? t("common.information") : t("common.pleaseConfirm")
          }
          type={config.headerType}
          icon={config.icon}
          onClose={onClose}
          isLoading={isLoading}
        />

        {/* Content */}
        <div className="p-6">
          {/* Message */}
          <div
            className={`bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6 border-2 border-dashed ${config.borderColor} dark:border-gray-600`}
          >
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-center">
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
                  t("common.ok")
                )}
              </button>
            </div>
          ) : (
            // Confirm mode - botones Cancel y Confirm
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText || t("common.cancel")}
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
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span>
                {isAlert
                  ? t("common.pressEscToClose")
                  : t("common.pressEscToCancel")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </ModalClean>
  );
}
