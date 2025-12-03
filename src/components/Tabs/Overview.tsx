import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Receipt,
  BarChart3,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { getCategoryIcon, getCategoryHexColor, categoryColors } from "../Icons";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useCallback, memo } from "react";

import { useUserAuthContext } from "../../contexts/useUserAuthContext";
import MainTravelCard from "../MainTravelCard";
import { Travel } from "../../types";
import { formatCurrency } from "../../utils/currency";
import { useLocalizedDates } from "../../hooks/useLocalizedDates";
import { AdBannerResponsive } from "../AdBannerResponsive";
import {
  useOptimizedOverviewData,
  useGeneralActivities,
  useGeneralExpenses,
} from "../../utils/queries";

import { useCurrency } from "../../hooks/useCurrency";
import { getTodayDate, getTravelOverviewDayInfo } from "../../utils/dateUtils";
import { getDayUrl, getDailyPlannerUrl } from "../../utils/navigation";
import { sortActivitiesByTime } from "../../utils/timeUtils";
import { Card } from "../Card";
import { useTravelOverview, useTravelDailyPlanItems } from "../../utils/hooks/useTravelQueries";
import { OverviewSkeleton } from "../Skeleton";

interface OverviewProps {
  travel: Travel;
  onEditTrip: () => void;
  setShowAddExpenseModal?: (show: boolean) => void;
  onNavigateTab?: (tab: string) => void;
}

const Overview = memo(function Overview({
  travel,
  onEditTrip,
  onNavigateTab,
}: OverviewProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userAuthData } = useUserAuthContext();
  const { formatDate } = useLocalizedDates();
  // Calcular totales desde los datos del overview (se obtienen más abajo)
  let totalSpent = 0; // Se calculará desde overviewData
  let countActivities = 0; // Se calculará desde overviewData
  const { userCurrency } = useCurrency();

  const handleBack = useCallback(() => {
    navigate("/travels");
  }, [navigate]);

  // Memoizar los cálculos de fecha para evitar re-renders
  const dayInfo = useMemo(() => {
    const startDate = travel?.start_date || getTodayDate();
    
    // Calcular la información correcta del día del viaje
    return getTravelOverviewDayInfo(startDate, travel?.end_date);
  }, [travel?.start_date, travel?.end_date]);

  // Función para navegar al día específico
  const handleNavigateToToday = useCallback(() => {
    const targetUrl = getDayUrl(travel.id, dayInfo.displayDate);
    navigate(targetUrl);
  }, [navigate, travel.id, dayInfo.displayDate]);

  // Usar hook optimizado para datos de overview
  const {
    todayActivities,
    todayExpenses: oldTodayExpenses,
    upcomingDays: oldUpcomingDays,
    recentExpenses: oldRecentExpenses,
    refetch: oldRefetch,
  } = useOptimizedOverviewData(
    userAuthData?.id || "",
    travel?.id || "",
    dayInfo.displayDate,
    travel?.start_date || dayInfo.displayDate
  );

  // Hook para datos del overview
  const { data: overviewData, refetch: newRefetch, isLoading: overviewLoading } = useTravelOverview(
    parseInt(travel?.id || "0")
  );

  // Hook para datos detallados del daily plan
  const { data: dailyPlanData } = useTravelDailyPlanItems(
    parseInt(travel?.id || "0")
  );

  // Calcular totales desde los datos del overview
  totalSpent = overviewData?.total_spent || 0;
  countActivities = overviewData?.total_activities || 0;

  // Usar datos del overview para mostrar, mantener funciones CRUD del hook optimizado
  const todayExpenses =
    overviewData?.recent_expenses?.filter(
      (expense) => expense.date === dayInfo.displayDate
    ) || oldTodayExpenses;

  // Para upcoming days, combinar datos: conteos del overview + actividades detalladas del daily plan
  const upcomingDays = useMemo(() => {
    const baseUpcomingDays = oldUpcomingDays?.length > 0 ? oldUpcomingDays : (overviewData?.upcoming_days || []);
    
    if (!dailyPlanData?.daily_items || baseUpcomingDays.length === 0) {
      return baseUpcomingDays;
    }

    // Enriquecer los datos base con actividades detalladas del daily plan
    return baseUpcomingDays.map(day => {
      const dayData = dailyPlanData.daily_items.find(item => item.date === day.date);
      const activities = dayData?.items?.filter(item => item.type === 'activity') || [];
      
      // Ordenar actividades por horario antes de tomar las primeras 2
      const sortedActivities = sortActivitiesByTime(activities);
      
      return {
        ...day,
        activities: sortedActivities.slice(0, 2).map(activity => ({
          name: activity.title,
          cost: activity.cost || 0,
          time: activity.time,
          location: activity.location || '',
          category: activity.category || 'general'
        })),
        moreActivities: Math.max(0, sortedActivities.length - 2)
      };
    });
  }, [oldUpcomingDays, overviewData, dailyPlanData]);

  const recentExpenses = overviewData?.recent_expenses || oldRecentExpenses;

  const refetch = useCallback(() => {
    newRefetch();
    oldRefetch();
  }, [newRefetch, oldRefetch]);

  // Obtener actividades y gastos generales
  const { data: generalActivities, isLoading: loadingGeneralActivities } =
    useGeneralActivities(travel?.id || "");

  const { data: generalExpenses, isLoading: loadingGeneralExpenses } =
    useGeneralExpenses(travel?.id || "");

  // Listen for daily data changes to force refetch
  useEffect(() => {
    const handleDataChanged = () => {
      refetch();
    };

    window.addEventListener("dailyDataChanged", handleDataChanged);

    return () => {
      window.removeEventListener("dailyDataChanged", handleDataChanged);
    };
  }, [refetch]);

  // Calcular distribución de gastos por categoría
  const { expenseDistribution, totalExpenses } = useMemo(() => {
    const categoryTotals: Record<string, number> = {};

    // Usar recentExpenses del overview hook
    recentExpenses.forEach((expense) => {
      const category = expense.category || "other";
      categoryTotals[category] = (categoryTotals[category] || 0) + expense.cost;
    });

    const expenseDistribution = Object.entries(categoryTotals)
      .map(([category, cost]) => ({
        category,
        cost,
        color: categoryColors[category] || categoryColors.other,
      }))
      .sort((a, b) => b.cost - a.cost); // Ordenar por monto descendente

    const totalExpenses = Object.values(categoryTotals).reduce(
      (sum, cost) => sum + cost,
      0
    );

    return { expenseDistribution, totalExpenses };
  }, [recentExpenses]);

  // Funciones para obtener icono y color por categoría

  // Show skeleton while loading
  if (overviewLoading || loadingGeneralActivities || loadingGeneralExpenses) {
    return <OverviewSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto pt-0 pb-6 px-0 sm:px-0">
      {/* MainTripCard */}
      <MainTravelCard
        name={travel?.name}
        startDate={travel?.start_date || ""}
        endDate={travel?.end_date || ""}
        country_codes={travel?.country_codes}
        budget={travel?.budget || 0}
        spent={totalSpent}
        activities={countActivities}
        expenses={overviewData?.total_expenses || 0}
        onEdit={onEditTrip}
        onBack={handleBack}
      />
      {/* Ad Banner */}
      <AdBannerResponsive area="large" provider="custom" className="mb-4" />

      <div className="overview-cards-container flex flex-col gap-3 pt-4">
        {/* Today Section */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 bg-green-100 dark:bg-green-900/20 rounded-md flex items-center justify-center">
              <Clock className="w-3 h-3 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {dayInfo.isFutureTrip 
                ? t("overview.day1")
                : dayInfo.isToday 
                ? t("overview.today")
                : `Día ${dayInfo.dayNumber}`}{" "}
              - {formatDate(dayInfo.displayDate)}
              {dayInfo.isFutureTrip && " (Future Trip)"}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Daily Activities */}
            <div className="text-center">
              <h3 className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1">
                {t("overview.dailyActivities")}
              </h3>
              {todayActivities.length === 0 ? (
                <div className="py-1">
                  <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/20 rounded flex items-center justify-center mx-auto mb-1">
                    <Calendar className="w-2 h-2 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1 text-xs">
                    {t("overview.noPlannedActivitiesToday")}
                  </p>
                  <button
                    onClick={handleNavigateToToday}
                    className="text-blue-600 dark:text-blue-400 text-xs hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    {t("overview.addActivity")}
                  </button>
                </div>
              ) : (
                <ul className="space-y-1">
                  {todayActivities.map(
                    (a: { id: string; title: string; cost: number }) => (
                      <li
                        key={a.id}
                        className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded px-2 py-1 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        onClick={handleNavigateToToday}
                      >
                        <span className="text-gray-900 dark:text-gray-100 text-xs font-medium">
                          {a.title}
                        </span>
                        <span className="text-gray-900 dark:text-gray-100 text-xs font-bold">
                          {formatCurrency(a.cost, userCurrency, true)}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              )}
            </div>

            {/* Daily Expenses */}
            <div className="text-center">
              <h3 className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1">
                {t("overview.dailyExpenses")}
              </h3>
              {todayExpenses.length === 0 ? (
                <div className="py-1">
                  <div className="w-4 h-4 bg-green-100 dark:bg-green-900/20 rounded flex items-center justify-center mx-auto mb-1">
                    <Receipt className="w-2 h-2 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1 text-xs">
                    {t("overview.noExpensesToday")}
                  </p>
                  <button
                    onClick={handleNavigateToToday}
                    className="text-green-600 dark:text-green-400 text-xs hover:text-green-800 dark:hover:text-green-300"
                  >
                    {t("overview.addExpense")}
                  </button>
                </div>
              ) : (
                <ul className="space-y-1">
                  {todayExpenses.map(
                    (e: { id: string; title: string; cost: number }) => (
                      <li
                        key={e.id}
                        className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 rounded px-2 py-1 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                        onClick={handleNavigateToToday}
                      >
                        <span className="text-gray-900 dark:text-gray-100 text-xs font-medium">
                          {e.title}
                        </span>
                        <span className="text-gray-900 dark:text-gray-100 text-xs font-bold">
                          {formatCurrency(e.cost, userCurrency, true)}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              )}
            </div>
          </div>
        </Card>

        {/* Upcoming Days - ULTRA COMPACT */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/20 rounded-md flex items-center justify-center">
                <Calendar className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {t("overview.upcomingDays")}
              </h2>
            </div>
            <button 
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium flex items-center gap-1 text-xs"
              onClick={() => {
                const dailyPlannerUrl = getDailyPlannerUrl(travel.id);
                navigate(dailyPlannerUrl);
              }}
            >
              {t("overview.viewAll")}
              <ArrowLeft className="w-3 h-3 rotate-180" />
            </button>
          </div>
          
          <div className="space-y-2">
            {upcomingDays.length === 0 ? (
              <div className="text-gray-400 dark:text-gray-500 text-center py-4">
                {t("overview.noUpcomingDays")}
              </div>
            ) : (
              upcomingDays
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .filter((day: any) => {
                  // Usar la propiedad correcta según la estructura de datos
                  return (day.activities_count || day.totalActivities || 0) > 0;
                })
                .slice(0, 2) // Mostrar solo los primeros 2 días
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((day: any) => (
                  <div 
                    key={day.date} 
                    className="border-l-2 border-purple-500 pl-2 py-1 bg-gradient-to-r from-purple-50 dark:from-purple-900/20 to-transparent rounded-r-md cursor-pointer hover:from-purple-100 dark:hover:from-purple-900/30 hover:to-purple-50 dark:hover:to-purple-900/10 transition-all duration-200"
                    onClick={() => {
                      const dayUrl = getDayUrl(travel.id, day.date);
                      navigate(dayUrl);
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                        {formatDate(day.date)}
                      </h3>
                      <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-full text-xs font-medium">
                        {day.activities_count || day.totalActivities || 0} {t("overview.activities")}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      {day.activities && day.activities.length > 0 ? (
                        <>
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {day.activities.map((activity: any, actIndex: number) => (
                            <div key={actIndex} className="flex items-center justify-between py-1 px-2 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-gray-100 dark:border-gray-600">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {activity.time && (
                                  <span className="text-gray-500 dark:text-gray-400 text-xs font-mono shrink-0">
                                    {activity.time.slice(0, 5)}
                                  </span>
                                )}
                                <span className="text-gray-700 dark:text-gray-300 font-medium text-xs truncate">
                                  {activity.name}
                                </span>
                              </div>
                              {activity.cost > 0 && (
                                <span className="text-gray-900 dark:text-gray-100 font-bold text-xs ml-2 shrink-0">
                                  {formatCurrency(activity.cost, userCurrency, true)}
                                </span>
                              )}
                            </div>
                          ))}
                          {day.moreActivities > 0 && (
                            <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium text-xs pl-2">
                              +{day.moreActivities} {t("overview.moreActivities")}
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="py-2 px-2 text-center">
                          <span className="text-gray-500 dark:text-gray-400 text-xs italic">
                            {t("overview.clickToViewActivities")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
        {/* Ad Banner
        <AdBannerResponsive
          area="xl-large"
          provider="custom"
          className="mb-4"
        /> */}

        {/* Expense Distribution - ULTRA COMPACT */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-orange-100 dark:bg-orange-900/20 rounded-md flex items-center justify-center">
              <BarChart3 className="w-3 h-3 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t("overview.expenseDistribution")}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <div className="relative w-16 h-16">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {expenseDistribution.map((item, index) => {
                    const percentage = totalExpenses > 0 ? (item.cost / totalExpenses) * 100 : 0;
                    const circumference = 2 * Math.PI * 40; // r=40, circumference = 251.2
                    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                    
                    // Calcular el offset acumulado
                    let offset = 0;
                    for (let i = 0; i < index; i++) {
                      const prevPercentage = totalExpenses > 0 ? (expenseDistribution[i].cost / totalExpenses) * 100 : 0;
                      offset += (prevPercentage / 100) * circumference;
                    }

                    return (
                      <circle
                        key={index}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={item.color}
                        strokeWidth="10"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={`-${offset}`}
                      />
                    );
                  })}
                </svg>
              </div>
            </div>

            <div className="flex-1 space-y-1">
              {expenseDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-1.5 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <div className="flex items-center gap-1.5">
                    <div 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-xs">
                      {t(`categories.${item.category}`)}
                    </span>
                  </div>
                  <span className="text-gray-900 dark:text-gray-100 font-bold text-xs">
                    {formatCurrency(item.cost, userCurrency, true)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Expenses - ULTRA COMPACT */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-100 dark:bg-red-900/20 rounded-md flex items-center justify-center">
                <Receipt className="w-3 h-3 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {t("overview.recentExpenses")}
              </h2>
            </div>
            <button 
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium flex items-center gap-1 text-xs"
              onClick={() => {
                if (onNavigateTab) {
                  onNavigateTab('expenses');
                }
              }}
            >
              {t("overview.viewAll")}
              <ArrowLeft className="w-3 h-3 rotate-180" />
            </button>
          </div>
          
          <div className="space-y-1.5">
            {recentExpenses.length === 0 ? (
              <div className="text-gray-400 dark:text-gray-500 text-center py-4">
                {t("overview.noRecentExpenses")}
              </div>
            ) : (
              recentExpenses.map((expense) => (
                <div 
                  key={expense.id} 
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-all duration-200"
                >
                  <div 
                    className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: getCategoryHexColor(expense.category) }}
                  >
                    <span className="text-sm">{getCategoryIcon(expense.category)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-xs">
                      {expense.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {t(`categories.${expense.category}`)}
                    </p>
                    {expense.location && (
                      <div className="flex items-center gap-0.5 text-xs text-gray-500 dark:text-gray-400">
                        <MapPin className="w-2 h-2" />
                        <span className="truncate">{expense.location}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(expense.cost, userCurrency)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ad Banner
        <AdBannerResponsive area="large" provider="custom" className="mb-4" /> */}

        {/* Actividades generales */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/20 rounded-md flex items-center justify-center">
              <Calendar className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t("overview.generalActivities")}
            </h3>
          </div>

          {loadingGeneralActivities ? (
            <div className="text-gray-400 dark:text-gray-500 text-center py-4">
              {t("common.loading")}
            </div>
          ) : generalActivities && generalActivities.length > 0 ? (
            <div className="space-y-1">
              {generalActivities.map((activity, index) => (
                <div
                  key={activity.id || index}
                  className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded flex items-center justify-center"
                      style={{ backgroundColor: getCategoryHexColor(activity.category || 'other') }}
                    >
                      <span className="text-xs">{getCategoryIcon(activity.category || 'other')}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-700 dark:text-gray-300 font-medium text-xs truncate">
                        {activity.title}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        {t(`categories.${activity.category || 'other'}`)}
                      </span>
                    </div>
                  </div>
                  <span className="text-gray-900 dark:text-gray-100 font-bold text-xs">
                    {formatCurrency(activity.cost || 0, userCurrency, true)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 dark:text-gray-500 text-center py-4">
              {t("overview.noGeneralActivities")}
            </div>
          )}
        </div>

        {/* Gastos generales */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-green-100 dark:bg-green-900/20 rounded-md flex items-center justify-center">
              <Receipt className="w-3 h-3 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t("overview.generalExpenses")}
            </h3>
          </div>

          {loadingGeneralExpenses ? (
            <div className="text-gray-400 dark:text-gray-500 text-center py-4">
              {t("common.loading")}
            </div>
          ) : generalExpenses && generalExpenses.length > 0 ? (
            <div className="space-y-1">
              {generalExpenses.map((expense, index) => (
                <div
                  key={expense.id || index}
                  className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded flex items-center justify-center"
                      style={{ backgroundColor: getCategoryHexColor(expense.category || 'other') }}
                    >
                      <span className="text-xs">{getCategoryIcon(expense.category || 'other')}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-700 dark:text-gray-300 font-medium text-xs truncate">
                        {expense.title}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        {t(`categories.${expense.category || 'other'}`)}
                      </span>
                    </div>
                  </div>
                  <span className="text-gray-900 dark:text-gray-100 font-bold text-xs">
                    {formatCurrency(expense.cost || 0, userCurrency, true)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 dark:text-gray-500 text-center py-4">
              {t("overview.noGeneralExpenses")}
            </div>
          )}
        </div>
      </div>
      {/* Ad Banner */}
      <AdBannerResponsive area="large" provider="custom" className="mb-4" />
    </div>
  );
});

export default Overview;
