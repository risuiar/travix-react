import React from "react";
import { useTranslation } from "react-i18next";
import { Zap, AlertTriangle, CheckCircle, Crown } from "lucide-react";
import { useAIUsageStatus } from "../utils/api/aiUsageApi";
import { Card } from "./Card";

interface AIUsageIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export const AIUsageIndicator: React.FC<AIUsageIndicatorProps> = ({
  className = "",
  showDetails = false,
}) => {
  const { t } = useTranslation();
  const {
    usageLimit,
    usageStats,
    totalUsage,
    loading,
    canMakeRequest,
    remainingRequests,
    dailyLimit,
    userTier,
  } = useAIUsageStatus();

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {t("aiUsage.loading", "Cargando uso de IA...")}
        </span>
      </div>
    );
  }

  if (!usageLimit) {
    return null;
  }

  const usagePercentage = ((dailyLimit - remainingRequests) / dailyLimit) * 100;
  
  const getStatusColor = () => {
    if (usagePercentage >= 90) return "text-red-500";
    if (usagePercentage >= 70) return "text-yellow-500";
    return "text-green-500";
  };

  const getStatusIcon = () => {
    if (!canMakeRequest) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (usagePercentage >= 70) return <Zap className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getTierIcon = () => {
    switch (userTier) {
      case 'ultimate':
        return <Crown className="w-4 h-4 text-purple-500" />;
      case 'premium':
        return <Crown className="w-4 h-4 text-blue-500" />;
      default:
        return <Zap className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTierName = () => {
    switch (userTier) {
      case 'ultimate':
        return t("aiUsage.tierUltimate", "Ultimate");
      case 'premium':
        return t("aiUsage.tierPremium", "Premium");
      default:
        return t("aiUsage.tierFree", "Gratis");
    }
  };

  if (showDetails) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {t("aiUsage.title", "Uso de IA")}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              {getTierIcon()}
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {getTierName()}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                {dailyLimit - remainingRequests} / {dailyLimit} {t("aiUsage.used", "usadas")}
              </span>
              <span className={`font-medium ${getStatusColor()}`}>
                {remainingRequests} {t("aiUsage.remaining", "restantes")}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  usagePercentage >= 90
                    ? "bg-red-500"
                    : usagePercentage >= 70
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Status message */}
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {!canMakeRequest
                ? t("aiUsage.limitReached", "Límite diario alcanzado")
                : usagePercentage >= 90
                ? t("aiUsage.almostFull", "Casi agotado")
                : usagePercentage >= 70
                ? t("aiUsage.moderate", "Uso moderado")
                : t("aiUsage.good", "Disponible")}
            </span>
          </div>

          {/* Stats today and total */}
          {usageStats && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    {t("aiUsage.today", "Hoy")}:
                  </span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                    {usageStats.requests_today}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Total:
                  </span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                    {totalUsage}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    {t("aiUsage.tokens", "Tokens")}:
                  </span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                    {usageStats.tokens_today.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Compact version
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {getStatusIcon()}
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {remainingRequests}/{dailyLimit} IA
      </span>
      {!canMakeRequest && (
        <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full dark:bg-red-900 dark:text-red-300">
          {t("aiUsage.limitReached", "Límite alcanzado")}
        </span>
      )}
    </div>
  );
};
