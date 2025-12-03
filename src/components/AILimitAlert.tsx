import React from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Crown, Zap } from "lucide-react";
import { useAIUsageStatus } from "../utils/api/aiUsageApi";

interface AILimitAlertProps {
  onUpgrade?: () => void;
  className?: string;
}

export const AILimitAlert: React.FC<AILimitAlertProps> = ({
  onUpgrade,
  className = "",
}) => {
  const { t } = useTranslation();
  const {
    usageLimit,
    loading,
    canMakeRequest,
    remainingRequests,
    dailyLimit,
    userTier,
  } = useAIUsageStatus();

  if (loading || !usageLimit) {
    return null;
  }

  const usagePercentage = ((dailyLimit - remainingRequests) / dailyLimit) * 100;

  // No mostrar alerta si hay muchas consultas disponibles
  if (usagePercentage < 70) {
    return null;
  }

  const getAlertType = () => {
    if (!canMakeRequest) return "error";
    if (usagePercentage >= 90) return "warning";
    return "info";
  };

  const getAlertColors = () => {
    switch (getAlertType()) {
      case "error":
        return "bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200";
    }
  };

  const getIcon = () => {
    if (!canMakeRequest) {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
    return <Zap className="w-5 h-5 text-yellow-500" />;
  };

  const getMessage = () => {
    if (!canMakeRequest) {
      return t("aiUsage.dailyLimitExceeded", "Has alcanzado tu límite diario de consultas de IA");
    }
    
    if (usagePercentage >= 90) {
      return t(
        "aiUsage.almostExhausted",
        `Quedan solo ${remainingRequests} consultas de IA hoy`
      );
    }
    
    return t(
      "aiUsage.approaching",
      `Has usado ${dailyLimit - remainingRequests} de ${dailyLimit} consultas de IA hoy`
    );
  };

  const getUpgradeMessage = () => {
    if (userTier === "free") {
      return t("aiUsage.upgradeFromFree", "Mejora a Premium (30/día) o Ultimate (100/día)");
    }
    if (userTier === "premium") {
      return t("aiUsage.upgradeFromPremium", "Mejora a Ultimate para 100 consultas diarias");
    }
    return null;
  };

  return (
    <div className={`rounded-lg border p-4 ${getAlertColors()} ${className}`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold mb-1">
            {!canMakeRequest
              ? t("aiUsage.limitReached", "Límite alcanzado")
              : t("aiUsage.approaching", "Aproximándose al límite")}
          </h3>
          
          <p className="text-sm mb-3">
            {getMessage()}
          </p>

          {/* Progress bar */}
          <div className="w-full bg-white/50 rounded-full h-2 mb-3">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                !canMakeRequest
                  ? "bg-red-500"
                  : usagePercentage >= 90
                  ? "bg-yellow-500"
                  : "bg-blue-500"
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>

          {/* Upgrade message and button */}
          {(userTier === "free" || userTier === "premium") && (
            <div className="flex items-center justify-between">
              <p className="text-xs opacity-90">
                {getUpgradeMessage()}
              </p>
              
              {onUpgrade && (
                <button
                  onClick={onUpgrade}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <Crown className="w-3 h-3" />
                  {t("aiUsage.upgrade", "Mejorar")}
                </button>
              )}
            </div>
          )}

          {/* Reset time info */}
          <p className="text-xs opacity-75 mt-2">
            {t("aiUsage.resetDaily", "El límite se restablece cada día a las 00:00")}
          </p>
        </div>
      </div>
    </div>
  );
};
