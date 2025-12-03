import React from "react";
import {
  Edit,
  Calendar,
  MapPin,
  DollarSign,
  TrendingUp,
  Activity as ActivityIcon,
  Target,
  ArrowLeft,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../utils/currency";
import { useLocalizedDates } from "../hooks/useLocalizedDates";
import { useCurrency } from "../hooks/useCurrency";

interface MainTravelCardProps {
  name: string;
  startDate: string;
  endDate: string;
  country_codes?: Array<Record<string, string>>;
  budget: number;
  spent: number;
  activities: number;
  expenses?: number;
  onEdit: () => void;
  onBack?: () => void;
}

export const MainTravelCard: React.FC<MainTravelCardProps> = ({
  name,
  startDate,
  endDate,
  country_codes = [],
  budget,
  spent,
  activities,
  expenses = 0,
  onEdit,
  onBack,
}) => {
  const { t } = useTranslation();
  const { formatDateRange } = useLocalizedDates();
  const { userCurrency } = useCurrency();

  const { percentUsed, percentLeft, overBudget } = React.useMemo(() => {
    const percentUsed = budget > 0 ? (spent / budget) * 100 : 0;
    const percentLeft = 100 - percentUsed;
    const overBudget = percentUsed > 100;
    return { percentUsed, percentLeft, overBudget };
  }, [budget, spent]);

  const countriesDisplay = React.useMemo(() => {
    if (!country_codes || country_codes.length === 0) {
      return t("common.noDestinations");
    }

    return country_codes
      .map((countryObj, index) => {
        const [, name] = Object.entries(countryObj)[0];
        return index === 0 ? name : `, ${name}`;
      })
      .join("");
  }, [country_codes, t]);

  return (
    <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-purple-500 to-blue-500 p-4 shadow-lg flex flex-col gap-3 relative">
      {/* Header más compacto */}
      <div className="flex items-center justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition hover:bg-white/20 bg-transparent"
            aria-label={t("common.back")}
          >
            <ArrowLeft size={16} className="sm:w-5 sm:h-5" color="white" />
          </button>
        )}
        <div className="flex-1">
          <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">{name}</h2>
          <div className="flex items-center gap-1 sm:gap-2 text-white/90 text-xs font-medium mt-1">
            <Calendar size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <span className="truncate">{formatDateRange(startDate, endDate)}</span>
            <span className="hidden sm:inline">·</span>
            <MapPin size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <span className="truncate">{countriesDisplay}</span>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
          aria-label={t("common.edit")}
        >
          <Edit size={16} className="sm:w-4.5 sm:h-4.5" />
        </button>
      </div>

      {/* KPIs responsivos - 2x2 en mobile, 4x1 en desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {/* Budget */}
        <div className="flex flex-col items-center justify-center bg-white/10 rounded-lg py-3 min-h-[80px] sm:min-h-[90px]">
          <DollarSign size={16} className="sm:w-5 sm:h-5 text-white mb-1" />
          <p className="text-sm sm:text-lg font-bold text-white leading-tight">
            {formatCurrency(budget, userCurrency, false, userCurrency)}
          </p>
          <p className="text-white/80 text-xs leading-tight">{t("common.budget")}</p>
        </div>

        {/* Spent */}
        <div className="flex flex-col items-center justify-center bg-white/10 rounded-lg py-3 min-h-[80px] sm:min-h-[90px]">
          <TrendingUp
            size={16}
            className={`sm:w-5 sm:h-5 mb-1 ${overBudget ? "text-red-400" : "text-white"}`}
          />
          <p
            className={`text-sm sm:text-lg font-bold leading-tight ${
              overBudget ? "text-red-400" : "text-white"
            }`}
          >
            {formatCurrency(spent, userCurrency, false, userCurrency)}
          </p>
          <p
            className={`text-xs leading-tight ${
              overBudget ? "text-red-200" : "text-white/80"
            }`}
          >
            {t("common.spent")}
          </p>
        </div>
        
        {/* Activities & Expenses */}
        <div className="flex flex-col items-center justify-center bg-white/10 rounded-lg py-3 min-h-[80px] sm:min-h-[90px]">
          <ActivityIcon size={16} className="sm:w-5 sm:h-5 text-white mb-1" />
          <div className="flex items-center gap-1 text-center">
            <div>
              <p className="text-sm sm:text-lg font-bold text-white leading-tight">{activities}</p>
              <p className="text-white/80 text-xs leading-tight">{t("common.activities")}</p>
            </div>
            <span className="text-white/60 mx-1">·</span>
            <div>
              <p className="text-sm sm:text-lg font-bold text-white leading-tight">{expenses || 0}</p>
              <p className="text-white/80 text-xs leading-tight">{t("common.expenses")}</p>
            </div>
          </div>
        </div>
        
        {/* Budget Left */}
        <div className="flex flex-col items-center justify-center bg-white/10 rounded-lg py-3 min-h-[80px] sm:min-h-[90px]">
          <Target
            size={16}
            className={`sm:w-5 sm:h-5 mb-1 ${overBudget ? "text-red-400" : "text-white"}`}
          />
          <p
            className={`text-sm sm:text-lg font-bold leading-tight ${
              overBudget ? "text-red-400" : "text-white"
            }`}
          >
            {percentLeft.toFixed(1)}%
          </p>
          <p
            className={`text-xs leading-tight ${
              overBudget ? "text-red-200" : "text-white/80"
            }`}
          >
            {t("common.remaining")}
          </p>
        </div>
      </div>
      {/* Barra de progreso más compacta */}
      <div className="flex items-center justify-between mt-1 sm:mt-2">
        <div className="flex-1 mr-2">
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                overBudget
                  ? "bg-gradient-to-r from-red-400 to-red-500"
                  : "bg-gradient-to-r from-green-400 via-blue-400 to-purple-400"
              }`}
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            ></div>
          </div>
        </div>
        <span
          className={`text-xs font-medium ${
            overBudget ? "text-red-200" : "text-white/80"
          }`}
        >
          {percentUsed.toFixed(1)}% {t("common.spent")}
        </span>
      </div>
    </div>
  );
};

export default MainTravelCard;
