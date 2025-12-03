import React from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "./Card";

interface SimpleWeeklyPaginationProps {
  currentWeek: number;
  totalWeeks: number;
  onWeekChange: (week: number) => void;
}

export const SimpleWeeklyPagination: React.FC<SimpleWeeklyPaginationProps> = ({
  currentWeek,
  totalWeeks,
  onWeekChange,
}) => {
  const { t } = useTranslation();

  const handleWeekChange = (week: number) => {
    onWeekChange(week);
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t("trip.weeklyPagination.week")} {currentWeek}{" "}
            {t("trip.weeklyPagination.of")} {totalWeeks}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleWeekChange(currentWeek - 1)}
            disabled={currentWeek === 1}
            className="p-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <div className="flex items-center gap-1 mx-2">
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
                  onClick={() => handleWeekChange(weekToShow)}
                  className={`w-6 h-6 rounded text-xs font-medium transition-all duration-200 ${
                    weekToShow === currentWeek
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {weekToShow}
                </button>
              );
            })}
            {totalWeeks > 5 && currentWeek < totalWeeks - 2 && (
              <>
                <span className="text-gray-400 dark:text-gray-500 px-1 text-xs">
                  ...
                </span>
                <button
                  onClick={() => handleWeekChange(totalWeeks)}
                  className="w-6 h-6 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {totalWeeks}
                </button>
              </>
            )}
          </div>
          <button
            onClick={() => handleWeekChange(currentWeek + 1)}
            disabled={currentWeek === totalWeeks}
            className="p-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </Card>
  );
};
