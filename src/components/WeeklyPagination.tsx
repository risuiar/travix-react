import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Activity,
  Receipt,
  Euro,
} from "lucide-react";
import { useLocalizedDates } from "../hooks/useLocalizedDates";
import { formatCurrency } from "../utils/currency";
import { useCurrency } from "../contexts/CurrencyContext";
import { useTranslation } from "react-i18next";

interface WeekData {
  weekNumber: number;
  startDate: string;
  endDate: string;
  days: string[];
  totalActivities: number;
  totalExpenses: number;
  totalCost: number;
  totalBudget: number;
}

interface WeeklyPaginationProps {
  currentWeek: number;
  totalWeeks: number;
  weeksData: WeekData[];
  onWeekChange: (week: number) => void;
}

export function WeeklyPagination({
  currentWeek,
  totalWeeks,
  weeksData,
  onWeekChange,
}: WeeklyPaginationProps) {
  const { formatDateRange } = useLocalizedDates();
  const { userCurrency } = useCurrency();
  const { t } = useTranslation();
  const currentWeekData = weeksData[currentWeek - 1];
  const progressPercentage = currentWeekData
    ? (currentWeekData.totalCost / currentWeekData.totalBudget) * 100
    : 0;

  const goToPreviousWeek = () => {
    if (currentWeek > 1) {
      onWeekChange(currentWeek - 1);
    }
  };

  const goToNextWeek = () => {
    if (currentWeek < totalWeeks) {
      onWeekChange(currentWeek + 1);
    }
  };

  const goToWeek = (week: number) => {
    onWeekChange(week);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 sm:p-3 md:p-4 mb-4 sm:mb-6">
      {/* Week Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
              {t("overview.weekOfTotal", "Week {{current}} of {{total}}", { current: currentWeek, total: totalWeeks })}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              {currentWeekData
                ? formatDateRange(
                    currentWeekData.startDate,
                    currentWeekData.endDate
                  )
                : ""}
            </p>
          </div>
        </div>
        {/* Navigation Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={goToPreviousWeek}
            disabled={currentWeek === 1}
            className="p-1 sm:p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <div className="flex items-center gap-0.5 sm:gap-1 mx-1 sm:mx-2">
            {Array.from({ length: Math.min(totalWeeks, 5) }, (_, i) => {
              let weekToShow;
              if (totalWeeks <= 5) {
                weekToShow = i + 1;
              } else if (currentWeek <= 3) {
                weekToShow = i + 1;
              } else if (currentWeek >= totalWeeks - 2) {
                weekToShow = totalWeeks - 4 + i;
              } else {
                weekToShow = currentWeek - 2 + i;
              }

              return (
                <button
                  key={weekToShow}
                  onClick={() => goToWeek(weekToShow)}
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    weekToShow === currentWeek
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {weekToShow}
                </button>
              );
            })}
            {totalWeeks > 5 && currentWeek < totalWeeks - 2 && (
              <>
                <span className="text-gray-400 px-0.5 sm:px-1 text-xs sm:text-sm">
                  ...
                </span>
                <button
                  onClick={() => goToWeek(totalWeeks)}
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg text-xs sm:text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  {totalWeeks}
                </button>
              </>
            )}
          </div>
          <button
            onClick={goToNextWeek}
            disabled={currentWeek === totalWeeks}
            className="p-1 sm:p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
      {/* Week Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-3 sm:mb-4">
        <div className="bg-purple-50 rounded-lg p-1 sm:p-1.5 md:p-2 text-center border border-purple-200">
          <div className="flex items-center justify-center mb-1">
            <Activity className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-purple-600" />
          </div>
          <div className="text-sm sm:text-base md:text-lg font-bold text-purple-900">
            {currentWeekData?.totalActivities || 0}
          </div>
          <div className="text-xs text-purple-700">{t("overview.activities", "Activities")}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-1 sm:p-1.5 md:p-2 text-center border border-green-200">
          <div className="flex items-center justify-center mb-1">
            <Receipt className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-green-600" />
          </div>
          <div className="text-sm sm:text-base md:text-lg font-bold text-green-900">
            {currentWeekData?.totalExpenses || 0}
          </div>
          <div className="text-xs text-green-700">{t("overview.expenses", "Expenses")}</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-1 sm:p-1.5 md:p-2 text-center border border-orange-200">
          <div className="flex items-center justify-center mb-1">
            <Euro className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-orange-600" />
          </div>
          <div className="text-sm sm:text-base md:text-lg font-bold text-orange-900">
            {formatCurrency(currentWeekData?.totalCost || 0, userCurrency)}
          </div>
          <div className="text-xs text-orange-700">{t("overview.totalCost", "Total Cost")}</div>
        </div>
      </div>
      {/* Week Progress */}
      <div className="space-y-1 sm:space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{t("overview.weekBudgetProgress", "Week Budget Progress")}</span>
          <span className="font-medium text-gray-900 text-xs sm:text-sm">
            {formatCurrency(currentWeekData?.totalCost || 0, userCurrency)} /{" "}
            {formatCurrency(currentWeekData?.totalBudget || 0, userCurrency)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
          <div
            className={`h-1.5 sm:h-2 rounded-full transition-all duration-500 ${
              progressPercentage > 100
                ? "bg-red-500"
                : "bg-gradient-to-r from-green-500 to-blue-500"
            }`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span className="text-xs">{progressPercentage.toFixed(1)}% {t("overview.used", "used")}</span>
          <span
            className={
              progressPercentage > 100
                ? "text-red-600 font-medium"
                : "text-green-600"
            }
          >
            {progressPercentage > 100 ? t("overview.overBudget", "Over budget") : t("overview.onTrack", "On track")}
          </span>
        </div>
      </div>
      {/* Quick Week Navigation */}
      <div className="mt-2 sm:mt-3 md:mt-4 pt-2 sm:pt-3 md:pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 text-xs sm:text-sm">{t("overview.quickJump", "Quick Jump")}:</span>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => goToWeek(1)}
              className="px-2 py-0.5 sm:px-3 sm:py-1 text-xs bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
            >
              <span className="hidden sm:inline">{t("overview.firstWeek", "First Week")}</span>
              <span className="sm:hidden">{t("overview.first", "First")}</span>
            </button>
            <button
              onClick={() => goToWeek(Math.ceil(totalWeeks / 2))}
              className="px-2 py-0.5 sm:px-3 sm:py-1 text-xs bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
            >
              <span className="hidden sm:inline">{t("overview.middle", "Middle")}</span>
              <span className="sm:hidden">{t("overview.mid", "Mid")}</span>
            </button>
            <button
              onClick={() => goToWeek(totalWeeks)}
              className="px-2 py-0.5 sm:px-3 sm:py-1 text-xs bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
            >
              <span className="hidden sm:inline">{t("overview.lastWeek", "Last Week")}</span>
              <span className="sm:hidden">{t("overview.last", "Last")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
