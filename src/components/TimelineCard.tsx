import React, { useState } from "react";
import { Clock, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../hooks/useCurrency";
import { CategoryBadge } from "./CategoryBadge";

interface TimelineItem {
  time: string;
  activity: string;
  type: string;
  location?: string;
  cost?: number;
  generated_by_ai?: boolean;
}

interface TimelineCardProps {
  title?: string;
  items: TimelineItem[];
  showAIIndicator?: boolean;
  className?: string;
}

export const TimelineCard: React.FC<TimelineCardProps> = ({
  items,
  className = "",
}) => {
  const { t } = useTranslation();
  const { userCurrency } = useCurrency();
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);

  if (items.length === 0) {
    return (
      <div
        className={`max-w-md bg-[#f8fafc] dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden ${className}`}
      >
        <div className="p-6 bg-white dark:bg-gray-800 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t("dailyPlanner.timeline.noActivitiesPlanned") as string}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`max-w-md bg-[#f8fafc] dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 ${className}`}
    >
      {/* Timeline items */}
      <div className="p-6 bg-white dark:bg-gray-800">
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex items-start gap-4 group">
              {/* Timeline dot y línea */}
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-200"></div>
                {index < items.length - 1 && (
                  <div className="w-0.5 h-8 bg-gradient-to-b from-blue-200 to-purple-200 mt-2"></div>
                )}
              </div>

              {/* Contenido del item */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-semibold">{item.time}</span>
                  </div>
                  <CategoryBadge category={item.type} />
                </div>
                <p className="text-gray-900 dark:text-gray-100 font-medium text-sm leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                  {item.activity}
                </p>
                {item.location && (
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                    📍 {item.location}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {item.cost !== undefined &&
                    item.cost !== null &&
                    item.cost > 0 && (
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        💰 {item.cost} {userCurrency}
                      </span>
                    )}
                  {item.generated_by_ai && (
                    <div className="relative">
                      <div
                        className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700 cursor-help"
                        onMouseEnter={() => setTooltipIndex(index)}
                        onMouseLeave={() => setTooltipIndex(null)}
                      >
                        <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                      </div>
                      {tooltipIndex === index && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 dark:bg-gray-900 text-white dark:text-gray-100 text-xs rounded shadow-lg z-10 whitespace-nowrap">
                          Generado por IA
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 dark:border-t-gray-900"></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer con gradiente IA */}
      <div className="h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400"></div>
    </div>
  );
};
