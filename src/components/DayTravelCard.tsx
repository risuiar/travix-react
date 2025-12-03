import React, { useState } from "react";
import { Clock, MapPin, Sparkles, Star, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../utils/currency";
import { useCurrency } from "../hooks/useCurrency";
import { CategoryBadge } from "./CategoryBadge";
// Helper function for priority colors
const getPriorityColor = (priority: string | null) => {
  switch (priority) {
    case "high":
      return {
        bg: "bg-red-100 dark:bg-red-900/20",
        text: "text-red-700 dark:text-red-300",
        dot: "bg-red-500",
      };
    case "medium":
      return {
        bg: "bg-yellow-100 dark:bg-yellow-900/20",
        text: "text-yellow-700 dark:text-yellow-300",
        dot: "bg-yellow-500",
      };
    case "low":
      return {
        bg: "bg-green-100 dark:bg-green-900/20",
        text: "text-green-700 dark:text-green-300",
        dot: "bg-green-500",
      };
    default:
      return {
        bg: "bg-gray-100 dark:bg-gray-900/20",
        text: "text-gray-700",
        dot: "bg-gray-400",
      };
  }
};

interface DayTravelCardProps {
  item: {
    title: string;
    description?: string;
    time?: string;
    location?: string;
    cost?: number;
    category?: string;
    priority?: string;
    generated_by_ai?: boolean;
    type: "activity" | "expense";
    is_done?: boolean;
    rating?: number;
    reviews_count?: string;
    address?: string;
  };
  onClick: () => void;
  onToggleCompleted?: (e: React.MouseEvent) => void;
  isCompleted?: boolean;
}

export const DayTravelCard: React.FC<DayTravelCardProps> = ({
  item,
  onClick,
  onToggleCompleted,
  isCompleted = false,
}) => {
  const { t } = useTranslation();
  const { userCurrency } = useCurrency();
  const [showTooltip, setShowTooltip] = useState(false);

  const isActivity = item.type === "activity";
  const isExpense = item.type === "expense";
  const isAccommodation = isExpense && item.category === "accommodation";

  // Determinar el color del borde y fondo según el tipo
  const getCardStyle = () => {
    if (isAccommodation) {
      return "border border-gray-100 dark:border-gray-700 bg-[#f8fafc] hover:border-green-200";
    }
    if (isActivity) {
      return "border border-gray-100 dark:border-gray-700 bg-[#f8fafc] hover:border-blue-200";
    }
    return "border border-gray-100 dark:border-gray-700 bg-[#f8fafc] hover:border-orange-200";
  };

  // Determinar el color del header según el tipo
  const getHeaderStyle = () => {
    if (isAccommodation) {
      return "bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 dark:bg-none dark:bg-gray-800 dark:border-gray-700";
    }
    if (isActivity) {
      return "bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 dark:bg-none dark:bg-gray-800 dark:border-gray-700";
    }
    return "bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 dark:bg-none dark:bg-gray-800 dark:border-gray-700";
  };

  // Determinar el color del borde inferior según el tipo
  const getBottomBorderStyle = () => {
    if (isAccommodation) {
      return "h-1 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400";
    }
    if (isActivity) {
      return "h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400";
    }
    return "h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400";
  };

  return (
    <div
      className={`max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer ${getCardStyle()}`}
      onClick={onClick}
    >
      {/* Header con hora, tipo y precio */}
      <div
        className={`flex items-center justify-between p-2 ${getHeaderStyle()}`}
      >
        <div className="flex items-center gap-3">
          {isActivity && item.time && (
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{item.time}</span>
            </div>
          )}
          {item.category && <CategoryBadge category={item.category} />}
        </div>
        <div className="flex items-center gap-2">
          {isActivity && onToggleCompleted && (
            <button
              onClick={onToggleCompleted}
              className={`flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors ${
                isCompleted
                  ? "bg-green-500 border-green-500 text-white"
                  : "border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-500"
              }`}
              title={isCompleted ? "Mark as incomplete" : "Mark as complete"}
            >
              {isCompleted && <Check className="w-2.5 h-2.5" />}
            </button>
          )}
          {item.cost !== undefined && (
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {formatCurrency(item.cost, userCurrency)}
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-4 bg-white dark:bg-gray-800 dark:border-t dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
          {item.title}
        </h3>

        {item.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
            {item.description}
          </p>
        )}

        {/* Ubicación */}
        {item.location && (
          <div className="flex items-center gap-1 mb-3 text-gray-500 dark:text-gray-400">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{item.location}</span>
          </div>
        )}

        {/* Footer con prioridad, rating e indicador de IA */}
        <div className="flex items-center justify-between">
          {/* Prioridad para actividades */}
          {isActivity &&
            item.priority &&
            ["high", "medium", "low"].includes(item.priority) && (
              <span
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                  getPriorityColor(item.priority as "high" | "medium" | "low")
                    .text
                } ${
                  getPriorityColor(item.priority as "high" | "medium" | "low")
                    .bg
                }`}
              >
                {t(`priorities.${item.priority}`)}
              </span>
            )}

          {/* Rating y reviews */}
          {item.rating && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">
                {item.rating}
              </span>
              {item.reviews_count && (
                <span className="text-xs text-yellow-600 dark:text-yellow-400">
                  ({item.reviews_count})
                </span>
              )}
            </div>
          )}

          {/* Indicador de IA */}
          {Boolean(item.generated_by_ai) && (
            <div className="relative">
              <div
                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700 shadow-sm cursor-help"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <div className="relative">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 tracking-wide">
                  IA
                </span>
              </div>
              {showTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 dark:bg-gray-900 text-white dark:text-gray-100 text-xs rounded shadow-lg z-10 whitespace-nowrap">
                  Generado por IA
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 dark:border-t-gray-900"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Borde inferior con gradiente */}
      <div className={getBottomBorderStyle()}></div>
    </div>
  );
};
