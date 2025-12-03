import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Activity as ActivityIcon,
  Receipt,
  Plus,
  DollarSign,
  Clock,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocalizedDates } from "../hooks/useLocalizedDates";

import { useUserAuthContext } from "../contexts/useUserAuthContext";

import { formatCurrency } from "../utils/currency";
import { useCurrency } from "../hooks/useCurrency";

import { AdBannerResponsive } from "./AdBannerResponsive";
import { DayTravelCard } from "./DayTravelCard";
import { TimelineCard } from "./TimelineCard";
import { useToggleActivityCompleted } from "../utils/queries";
import { useLanguage } from "../hooks/useLanguage";
import { sortActivitiesByTime, formatTimeForDisplay } from "../utils/timeUtils";
import {
  getUserDailyPlanForDateRange,
  DailyPlanItem as ApiDailyPlanItem,
} from "../utils/dailyPlanApi";

// Tipo para los items del daily plan (unificado con la API)
type DailyPlanItem = {
  id: number;
  title: string;
  description: string;
  time?: string | null;
  location: string;
  completed: boolean;
  type: "activity" | "expense";
  date: string;
  cost: number;
  category: string;
  priority?: string | null;
};

interface TravelDayProps {
  dayNumber: number;
  date: string;
  budget: number;
  activitiesCount: number;
  expensesCount: number;
  totalSpent: number;
  status: string;
  expanded: boolean;
  onToggleExpand: () => void;
  onAddActivity: () => void;
  onAddExpense: () => void;
  onEditActivity: (
    activityId: string,
    item?: DailyPlanItem | ApiDailyPlanItem
  ) => void;
  onEditExpense: (
    expenseId: string,
    item?: DailyPlanItem | ApiDailyPlanItem,
    type?: string
  ) => void;
  onAI: () => void;
  isInNoItineraryGroup?: boolean;
  // Datos del daily plan para este día específico
  dailyItems?: DailyPlanItem[];
}

export const TravelDay = React.memo(function TravelDay({
  dayNumber,
  date,
  budget,
  activitiesCount,
  expensesCount,
  totalSpent,
  status,
  expanded,
  onToggleExpand,
  onAddActivity,
  onAddExpense,
  onEditActivity,
  onEditExpense,
  onAI,
  isInNoItineraryGroup = false,
  dailyItems = [],
}: TravelDayProps) {
  const { t } = useTranslation();
  const { formatDate, getDayName } = useLocalizedDates();
  const { userAuthData } = useUserAuthContext();
  const { userCurrency } = useCurrency();
  const { currentLanguage } = useLanguage();
  const toggleActivityCompleted = useToggleActivityCompleted();

  const [isLoading, setIsLoading] = useState(false);
  const [enhancedDailyItems, setEnhancedDailyItems] = useState<
    ApiDailyPlanItem[]
  >([]);

  const isLoadingRef = useRef(false); // Ref para evitar re-ejecuciones

  // totalDayCost ahora incluye tanto gastos como costos de actividades
  const totalDayCost = totalSpent;

  // Load enhanced data from new SQL function when expanded
  useEffect(() => {
    const loadEnhancedData = async () => {
      if (expanded && userAuthData && !isLoadingRef.current) {
        isLoadingRef.current = true;
        try {
          // Get travel ID from the current URL or context
          const travelId = window.location.pathname.split("/")[3]; // /travels/travel/{id}/...
          if (travelId) {
            const enhancedData = await getUserDailyPlanForDateRange(
              userAuthData.id,
              travelId,
              "",
              ""
            );

            // Find data for this specific date
            const dateData = enhancedData[date] || [];

            setEnhancedDailyItems(dateData);
          }
        } catch (error) {
          console.error("Error loading enhanced data:", error);
        } finally {
          isLoadingRef.current = false;
        }
      }
    };

    loadEnhancedData();
  }, [expanded, date, userAuthData]); // Removido isLoadingEnhancedData de las dependencias

  // Escuchar cambios en los datos del daily plan para actualizar la vista
  useEffect(() => {
    const handleDailyDataChanged = () => {
      // Forzar re-render del componente cuando cambien los datos
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 100);

      // Recargar los datos mejorados si el componente está expandido
      if (expanded && userAuthData && !isLoadingRef.current) {
        const loadEnhancedData = async () => {
          try {
            isLoadingRef.current = true;
            const travelId = window.location.pathname.split("/")[3];
            if (travelId) {
              const enhancedData = await getUserDailyPlanForDateRange(
                userAuthData.id,
                travelId,
                "",
                ""
              );
              const dateData = enhancedData[date] || [];
              setEnhancedDailyItems(dateData);
            }
          } catch (error) {
            console.error("Error reloading enhanced data:", error);
          } finally {
            isLoadingRef.current = false;
          }
        };
        loadEnhancedData();
      }

      // Disparar evento para que el componente padre actualice los datos
      window.dispatchEvent(
        new CustomEvent("tripDayDataChanged", {
          detail: { date },
        })
      );
    };

    window.addEventListener("dailyDataChanged", handleDailyDataChanged);
    return () => {
      window.removeEventListener("dailyDataChanged", handleDailyDataChanged);
    };
  }, [date, expanded, userAuthData]); // Removido isLoadingEnhancedData de las dependencias

  // Combinar datos mejorados con datos originales para mantener toda la información
  const getCombinedItems = (): any[] => {
    if (enhancedDailyItems.length === 0) return dailyItems;

    // Crear un mapa de enhancedDailyItems por source_id para búsqueda rápida
    const enhancedMap = new Map<string, any>();
    enhancedDailyItems.forEach((item: any) => {
      enhancedMap.set(String(item.source_id), item);
    });

    // Índice rápido de dailyItems por source_id
    const dailyIds = new Set<string>(
      dailyItems.map((di: any) => String(di.source_id))
    );

    // 1) Combinar: overlay de enhanced sobre dailyItems existentes
    const merged = dailyItems.map((dailyItem: any) => {
      const enhancedItem = enhancedMap.get(String(dailyItem.source_id));
      if (enhancedItem) {
        return {
          ...dailyItem,
          ...enhancedItem,
          rating: enhancedItem.rating ?? dailyItem.rating,
          reviews_count: enhancedItem.reviews_count ?? dailyItem.reviews_count,
          generated_by_ai:
            enhancedItem.generated_by_ai ?? dailyItem.generated_by_ai ?? false,
        };
      }
      return dailyItem;
    });

    // 2) Agregar items que sólo existen en enhanced (ej. accommodation expandido por rango)
    const extras = enhancedDailyItems.filter(
      (ei: any) => !dailyIds.has(String(ei.source_id))
    );

    return [...merged, ...extras];
  };

  const itemsToDisplay: any[] = getCombinedItems();

  // Fallback extendido: intentar por source_id y por clave compuesta (title+time+date)
  const getAiFlagForItem = (item: any): boolean => {
    if (item && (item as any).generated_by_ai != null) {
      return Boolean((item as any).generated_by_ai);
    }
    if (item?.source_id) {
      const bySource = enhancedDailyItems.find(
        (e) =>
          String(e.source_id) === String(item.source_id) &&
          e.type === "activity"
      );
      if (bySource && (bySource as any).generated_by_ai != null) {
        return Boolean((bySource as any).generated_by_ai);
      }
    }
    const byComposite = enhancedDailyItems.find(
      (e) =>
        e.type === "activity" &&
        e.title === item?.title &&
        (e as any).time === (item as any).time &&
        String((e as any).date) === String((item as any).date)
    );
    return Boolean((byComposite as any)?.generated_by_ai);
  };

  // Function to handle activity card click
  const handleActivityClick = (activityId: string) => {
    // Find the complete item data using the same composite ID
    const item = itemsToDisplay.find(
      (item) => `${item.title}-${item.time}-${item.date}` === activityId
    );

    if (item) {
      // Pass the source_id real en lugar del ID compuesto
      onEditActivity(item.source_id, item);
    } else {
      console.error("🎯 TripDay item not found for ID:", activityId);
    }
  };

  const handleExpenseClick = (expenseId: string) => {
    // Find the complete item data using the same composite ID
    const item = itemsToDisplay.find(
      (item) => `${item.title}-${item.time}-${item.date}` === expenseId
    );

    if (item) {
      // Pass the source_id real en lugar del ID compuesto
      onEditExpense(item.source_id, item);
    } else {
      console.error("🎯 TripDay item not found for ID:", expenseId);
    }
  };

  // Function to handle activity completion toggle
  const handleToggleActivityCompleted = async (
    e: React.MouseEvent,
    activityId: string,
    currentCompleted: boolean
  ) => {
    e.stopPropagation(); // Prevent card click when clicking checkbox

    try {
      // Actualizar el estado local inmediatamente para una respuesta visual instantánea
      setEnhancedDailyItems((prev) => {
        const updated = prev.map((item) =>
          item.source_id === activityId
            ? { ...item, is_done: !currentCompleted }
            : item
        );
        return updated;
      });

      await toggleActivityCompleted.mutateAsync({
        id: activityId,
        completed: !currentCompleted,
      });

      // Invalidar el cache de React Query para forzar el re-render
      window.dispatchEvent(new CustomEvent("dailyDataChanged"));
    } catch (error) {
      console.error("❌ Error toggling activity completed:", error);
      // Revertir el cambio si hay error
      setEnhancedDailyItems((prev) =>
        prev.map((item) =>
          item.source_id === activityId
            ? { ...item, is_done: currentCompleted }
            : item
        )
      );
    }
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
      data-date={date}
    >
      {/* Day Header */}
      <button
        onClick={onToggleExpand}
        className="w-full p-3 sm:p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t("common.day")}
              </div>
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg flex-shrink-0 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
              >
                {dayNumber}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatDate(date)} - {getDayName(date)}
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 text-sm">
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  {t("dailyPlanner.budget")}:{" "}
                  {formatCurrency(budget || 0, userCurrency)}
                </span>
                {totalDayCost > 0 && (
                  <span
                    className={`font-medium ${
                      totalDayCost > budget
                        ? "text-red-600 dark:text-red-400"
                        : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {t("dailyPlanner.spent")}:{" "}
                    {formatCurrency(totalDayCost, userCurrency)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-4 text-sm">
              {activitiesCount > 0 && (
                <div className="flex items-center gap-1">
                  <ActivityIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {activitiesCount} {t("dailyPlanner.activities")}
                  </span>
                </div>
              )}
              {expensesCount > 0 && (
                <div className="flex items-center gap-1">
                  <Receipt className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {expensesCount} {t("dailyPlanner.expenses")}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center">
              {expanded ? (
                <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              )}
            </div>
          </div>
        </div>
        {/* Barra de progreso del presupuesto - SIEMPRE visible */}
        <div>
          <div className="flex justify-end mb-1">
            {budget > 0 ? (
              totalDayCost > 0 ? (
                totalDayCost > budget ? (
                  <span className="text-xs font-medium text-red-600 dark:text-red-400">
                    {t("dailyPlanner.overBudget")} ·{" "}
                    {((totalDayCost / budget) * 100).toFixed(1)}%{" "}
                    {t("dailyPlanner.used")}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {((totalDayCost / budget) * 100).toFixed(1)}%{" "}
                    {t("dailyPlanner.used")}
                  </span>
                )
              ) : (
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  0% {t("dailyPlanner.used")} · {t("dailyPlanner.noExpenses")}
                </span>
              )
            ) : (
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {totalDayCost > 0 ? (
                  <>
                    {formatCurrency(totalDayCost, userCurrency)}{" "}
                    {t("dailyPlanner.spent")}
                  </>
                ) : (
                  t("dailyPlanner.noExpenses")
                )}
              </span>
            )}
          </div>
          {/* Barra de progreso - siempre visible */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                budget > 0
                  ? totalDayCost > budget
                    ? "bg-red-500"
                    : totalDayCost > 0
                    ? "bg-gradient-to-r from-green-500 to-blue-500"
                    : "bg-gray-400 dark:bg-gray-500"
                  : totalDayCost > 0
                  ? "bg-blue-500"
                  : "bg-gray-400 dark:bg-gray-500"
              }`}
              style={{
                width:
                  budget > 0
                    ? `${Math.min((totalDayCost / budget) * 100, 100)}%`
                    : totalDayCost > 0
                    ? "100%"
                    : "0%",
              }}
            />
          </div>
        </div>
      </button>
      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="p-2 sm:p-4 bg-white dark:bg-gray-800">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Timeline - Vista moderna con TimelineCard */}
              <div className="lg:col-span-1">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Timeline
                </h4>
                {isLoading ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                    {t("common.loading")}
                  </div>
                ) : (
                  <TimelineCard
                    title="Timeline"
                    items={(() => {
                      const activities = itemsToDisplay.filter(
                        (item) => item.type === "activity"
                      );

                      // Solo mostrar actividades con tiempo en el timeline
                      const activitiesWithTime = activities.filter(
                        (item) => item.time && item.time.trim() !== ""
                      );

                      // Sort activities with time by time
                      const sortedActivitiesWithTime =
                        sortActivitiesByTime(activitiesWithTime);

                      // Convertir a formato TimelineItem
                      return sortedActivitiesWithTime.map((item) => {
                        return {
                          time: formatTimeForDisplay(
                            item.time || "",
                            currentLanguage
                          ),
                          activity: item.title,
                          type: item.category,
                          location: item.location,
                          cost: item.cost,
                          generated_by_ai: getAiFlagForItem(item),
                        };
                      });
                    })()}
                    showAIIndicator={false}
                    className="max-w-full"
                  />
                )}
              </div>

              {/* Activities - Lista completa */}
              <div className="lg:col-span-1">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <ActivityIcon className="w-5 h-5" />
                    {t("common.activities")}
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={onAI}
                      disabled={isInNoItineraryGroup}
                      className={`px-3 py-1 rounded-lg transition-colors text-sm font-medium flex items-center gap-1 ${
                        isInNoItineraryGroup
                          ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          : "bg-purple-500 text-white hover:bg-purple-600"
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      AI
                    </button>
                    <button
                      onClick={onAddActivity}
                      disabled={isInNoItineraryGroup}
                      className={`px-3 py-1 rounded-lg transition-colors text-sm font-medium flex items-center gap-1 ${
                        isInNoItineraryGroup
                          ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      {t("common.add")}
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                      {t("common.loading")}
                    </div>
                  ) : itemsToDisplay.filter((item) => item.type === "activity")
                      .length > 0 ? (
                    (() => {
                      const activities = itemsToDisplay.filter(
                        (item) => item.type === "activity"
                      );

                      // Separate activities with time and without time
                      const activitiesWithTime = activities.filter(
                        (item) => item.time && item.time.trim() !== ""
                      );
                      const activitiesWithoutTime = activities.filter(
                        (item) => !item.time || item.time.trim() === ""
                      );

                      // Sort activities with time by time
                      const sortedActivitiesWithTime =
                        sortActivitiesByTime(activitiesWithTime);

                      return (
                        <>
                          {/* Activities with time */}
                          {sortedActivitiesWithTime.map((item) => (
                            <DayTravelCard
                              key={`${item.title}-${item.time}-${item.date}`}
                              item={{
                                title: item.title,
                                description: item.description,
                                time: item.time,
                                location: item.location,
                                cost: item.cost,
                                category: item.category,
                                priority: item.priority,
                                generated_by_ai: getAiFlagForItem(item),
                                type: item.type,
                                is_done: item.is_done,
                                rating: item.rating,
                                reviews_count: item.reviews_count,
                                address: item.address,
                              }}
                              onClick={() => {
                                const uniqueId = `${item.title}-${item.time}-${item.date}`;
                                handleActivityClick(uniqueId);
                              }}
                              onToggleCompleted={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                handleToggleActivityCompleted(
                                  e,
                                  item.source_id,
                                  item.is_done || false
                                );
                              }}
                              isCompleted={item.is_done || false}
                            />
                          ))}

                          {/* Activities without time */}
                          {activitiesWithoutTime.length > 0 && (
                            <>
                              {sortedActivitiesWithTime.length > 0 && (
                                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                              )}
                              {activitiesWithoutTime.map((item) => (
                                <DayTravelCard
                                  key={`${item.title}-${item.time}-${item.date}`}
                                  item={{
                                    title: item.title,
                                    description: item.description,
                                    time: item.time,
                                    location: item.location,
                                    cost: item.cost,
                                    category: item.category,
                                    priority: item.priority,
                                    generated_by_ai: getAiFlagForItem(item),
                                    type: item.type,
                                    is_done: item.is_done,
                                    rating: item.rating,
                                    reviews_count: item.reviews_count,
                                    address: item.address,
                                  }}
                                  onClick={() =>
                                    handleActivityClick(
                                      `${item.title}-${item.time}-${item.date}`
                                    )
                                  }
                                  onToggleCompleted={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    handleToggleActivityCompleted(
                                      e,
                                      item.source_id,
                                      item.is_done || false
                                    );
                                  }}
                                  isCompleted={item.is_done || false}
                                />
                              ))}
                            </>
                          )}
                        </>
                      );
                    })()
                  ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                      <Calendar className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {t("overview.noPlannedActivities")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {/* Expenses */}
              <div className="lg:col-span-1">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Expenses
                  </h4>
                  <button
                    onClick={onAddExpense}
                    disabled={isInNoItineraryGroup}
                    className={`px-3 py-1 rounded-lg transition-colors text-sm font-medium flex items-center gap-1 ${
                      isInNoItineraryGroup
                        ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                </div>
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                      Loading expenses...
                    </div>
                  ) : itemsToDisplay.filter((item) => item.type === "expense")
                      .length > 0 ? (
                    (() => {
                      // Ordenar expenses: estadías primero, luego por costo descendente
                      const sortedExpenses = itemsToDisplay
                        .filter((item) => item.type === "expense")
                        .sort((a, b) => {
                          // Las estadías (accommodation) van primero
                          const aIsAccommodation =
                            a.category === "accommodation";
                          const bIsAccommodation =
                            b.category === "accommodation";

                          if (aIsAccommodation && !bIsAccommodation) return -1;
                          if (!aIsAccommodation && bIsAccommodation) return 1;

                          // Si ambos son del mismo tipo, ordenar por costo descendente
                          return (b.cost || 0) - (a.cost || 0);
                        });

                      return sortedExpenses.map((item) => (
                        <DayTravelCard
                          key={`${item.title}-${item.time}-${item.date}`}
                          item={{
                            title: item.title,
                            description: item.description,
                            time: item.time,
                            location: item.location,
                            cost: item.cost,
                            category: item.category,
                            priority: item.priority,
                            generated_by_ai: item.generated_by_ai,
                            type: item.type,
                            is_done: item.is_done,
                            rating: item.rating,
                            reviews_count: item.reviews_count,
                            address: item.address,
                          }}
                          onClick={() => {
                            const uniqueId = `${item.title}-${item.time}-${item.date}`;
                            handleExpenseClick(uniqueId);
                          }}
                        />
                      ));
                    })()
                  ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                      <DollarSign className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No expenses recorded
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Ad Banner */}
            <AdBannerResponsive
              area="daily-planner-row"
              provider="custom"
              className="mb-4"
            />
          </div>
        </div>
      )}
    </div>
  );
});
