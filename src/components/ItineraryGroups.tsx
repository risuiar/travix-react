import React, { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  ChevronRight,
  MapPin,
  Calendar,
  Activity,
  Receipt,
  Plus,
  Edit,
  Bed,
} from "lucide-react";
import {
  getCategoryIcon,
  getCategoryHexColor,
  categoryColors
} from "./Icons";
import {
  groupDaysByItinerary,
  getItineraryDisplayName,
} from "../utils/dailyPlanUtils";
import { DailyPlan } from "../types";
import { TravelDay } from "./TravelDay";
import { formatCurrency } from "../utils/currency";
import { useCurrency } from "../hooks/useCurrency";
import { SimpleWeeklyPagination } from "./SimpleWeeklyPagination";
import ItineraryMapSection from "./ItineraryMapSection";
import { useLocalizedDates } from "../hooks/useLocalizedDates";

// Función para calcular días restantes hasta una fecha
const getDaysUntil = (targetDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

interface ItineraryGroup {
  name: string | null;
  days: DailyPlan[];
  totalActivities: number;
  totalExpenses: number;
  totalSpent: number;
  startDate: string;
  endDate: string;
}

interface ItineraryGroupsProps {
  dailyPlan: DailyPlan[];
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
  selectedItineraryName?: string | null;
  getItineraryIdByName?: (itineraryName: string) => string | undefined;
  getItineraryCoordinates?: (itineraryName: string) => {
    lat: number;
    lng: number;
  };
  onOpenAIModal?: (date: string, dayNumber: number) => void;
  onAddAccommodationExpense?: (date?: string) => void;

  onOpenAddActivityModal?: (date: string) => void;
  onOpenAddExpenseModal?: (date: string) => void;
  onEditActivity?: (activityId: string) => void;
  onEditExpense?: (expenseId: string) => void;
  travelBudget: number;
  onAddItinerary?: () => void;
  onEditItinerary?: (itineraryName: string) => void;
  onToggleItinerary?: (itineraryName: string | null, expanded: boolean) => void;
  onCloseDay?: () => void;
  // Datos completos del daily plan para pasar a TripDay
  rawDailyPlan?: Array<{
    date: string;
    items: Array<{
      id: number;
      title: string;
      description: string;
      time?: string | null;
      location: string;
      is_done: boolean;
      type: "activity" | "expense";
      source_id: string;
      cost: number;
      category: string;
      priority?: string | null;
      itinerary_id?: number | null;
      lat?: number | null;
      lng?: number | null;
      place_id?: string | null;
      address?: string | null;
      google_category?: string | null;
      rating?: number | null;
      reviews_count?: number | null;
      url?: string | null;
    }>;
  }>;
}

export const ItineraryGroups: React.FC<ItineraryGroupsProps> = ({
  dailyPlan,
  selectedDate,
  setSelectedDate,
  selectedItineraryName,
  getItineraryIdByName,
  getItineraryCoordinates,
  onOpenAIModal,
  onAddAccommodationExpense,

  onOpenAddActivityModal,
  onOpenAddExpenseModal,
  onEditActivity,
  onEditExpense,
  travelBudget,
  onAddItinerary,
  onEditItinerary,
  onToggleItinerary,
  onCloseDay,
  rawDailyPlan = [],
}) => {
  const { t } = useTranslation();
  const { formatDate } = useLocalizedDates();
  const { userCurrency } = useCurrency();

  // Ref para hacer scroll al día seleccionado
  const selectedDayRef = useRef<HTMLDivElement>(null);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Weekly pagination state for each group
  const [groupWeeks, setGroupWeeks] = useState<Record<string, number>>({});

  const itineraryGroups = useMemo(
    () => groupDaysByItinerary(dailyPlan),
    [dailyPlan]
  );

  // Escuchar cambios en los datos del daily plan para actualizar la vista
  useEffect(() => {
    const handleTravelDayDataChanged = (event: CustomEvent) => {
      // Solicitar actualización de los datos cuando cambie algo en un día específico
      if (event.detail?.date) {
        // Forzar re-render del componente
        setGroupWeeks((prev) => ({ ...prev }));
      }
    };

    window.addEventListener(
      "travelDayDataChanged",
      handleTravelDayDataChanged as EventListener
    );
    return () => {
      window.removeEventListener(
        "travelDayDataChanged",
        handleTravelDayDataChanged as EventListener
      );
    };
  }, []);

  useEffect(() => {
    if (selectedDate) {
      // Buscar el grupo que contiene la fecha seleccionada
      const itineraryGroup = itineraryGroups.find((group) =>
        group.days.some((day) => day.day === selectedDate)
      );

      if (itineraryGroup) {
        const groupKey =
          itineraryGroup.name ||
          `sin-itinerarios-${itineraryGroup.days[0]?.day}`;
        setExpandedGroups((prev) => {
          const newExpanded = new Set(prev);
          newExpanded.add(groupKey);
          return newExpanded;
        });
      }
    }
  }, [selectedDate, itineraryGroups]);

  // Expandir automáticamente el grupo cuando venga un itineraryName por URL
  useEffect(() => {
    if (selectedItineraryName) {
      const itineraryGroup = itineraryGroups.find(
        (group) => group.name === selectedItineraryName
      );
      if (itineraryGroup) {
        const groupKey = itineraryGroup.name || `sin-itinerarios-auto`;
        setExpandedGroups((prev) => {
          const next = new Set(prev);
          next.add(groupKey);
          return next;
        });
      }
    }
  }, [selectedItineraryName, itineraryGroups]);

  // Hacer scroll suave al día seleccionado
  useEffect(() => {
    if (selectedDate && selectedDayRef.current) {
      // Pequeño delay para asegurar que el DOM se haya actualizado
      setTimeout(() => {
        // Hacer scroll al día completo para que se vea tanto el card como el contenido
        if (selectedDayRef.current) {
          selectedDayRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start", // Mostrar desde la parte superior del día
            inline: "nearest",
          });
        }
      }, 100);
    }
  }, [selectedDate]);

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
      // Reset to first week when expanding a group
      setGroupWeeks((prev) => ({ ...prev, [groupKey]: 1 }));
    }
    setExpandedGroups(newExpanded);
  };

  const toggleGroupWithNotify = (
    groupKey: string,
    itineraryName: string | null
  ) => {
    const willExpand = !expandedGroups.has(groupKey);
    toggleGroup(groupKey);
    if (onToggleItinerary) {
      onToggleItinerary(itineraryName, willExpand);
    }
  };

  const handleToggleExpand = (date: string) => {
    const willClose = selectedDate === date;
    setSelectedDate(selectedDate === date ? null : date);

    // Si se está cerrando un día, llamar a onCloseDay para actualizar la URL
    if (willClose && onCloseDay) {
      onCloseDay();
    }

    // NO hacer scroll aquí - solo cambiar el estado
  };

  // Map toggle at day level removed; maps shown only at itinerary level

  const getDayNumber = (date: string): number => {
    return dailyPlan.findIndex((day) => day.day === date) + 1;
  };

  const getItineraryNotes = (itineraryName: string | null): string | null => {
    if (!itineraryName) return null;

    const itineraryDay = dailyPlan.find((day) => day.name === itineraryName);
    if (!itineraryDay) return null;

    return itineraryDay.notes || null;
  };

  // Function to get paginated days for a group
  const getPaginatedDaysForGroup = (group: ItineraryGroup) => {
    const totalDays = group.days.length;
    const shouldShowPagination = totalDays > 7;

    if (!shouldShowPagination) {
      return group.days;
    }

    const groupKey = group.name || `sin-itinerarios-${group.days[0]?.day}`;
    const currentWeek = groupWeeks[groupKey] || 1;
    const startIndex = (currentWeek - 1) * 7;
    const endIndex = Math.min(startIndex + 7, totalDays);

    return group.days.slice(startIndex, endIndex);
  };

  // Function to handle week change for a specific group
  const handleWeekChange = (groupKey: string, week: number) => {
    setGroupWeeks((prev) => ({ ...prev, [groupKey]: week }));
    setSelectedDate(null); // Reset selected date when changing weeks
  };

  // Si no hay datos, mostrar mensaje
  if (!dailyPlan || dailyPlan.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
          No hay datos disponibles
        </div>
        <div className="text-gray-400 dark:text-gray-500 text-sm">
          Los días del viaje aparecerán aquí una vez que se actualice la función
          de Supabase
        </div>
      </div>
    );
  }

  return (
    <div className="overview-cards-container flex flex-col">
      {itineraryGroups.map((group, groupIndex) => {
        const groupKey = group.name || `sin-itinerarios-${groupIndex}`;
        const isExpanded =
          expandedGroups.has(groupKey) ||
          (selectedItineraryName && group.name === selectedItineraryName);
  const displayName = group.name ? group.name : t("dailyPlanner.withoutItinerary");

        // Calculate pagination data for this group
        const totalDays = group.days.length;
        const shouldShowPagination = totalDays > 7;
        const currentWeek = groupWeeks[groupKey] || 1;
        const totalWeeks = Math.ceil(totalDays / 7);
        const paginatedDays = getPaginatedDaysForGroup(group);

        return (
          <div
            key={groupKey}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Group Header */}
            {group.name ? (
              <button
                onClick={() => toggleGroupWithNotify(groupKey, group.name)}
                className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex-shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {displayName}
                        </h3>
                        {getItineraryNotes(group.name) && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            • {getItineraryNotes(group.name)}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {group.days.length} {t("dailyPlanner.days")} •{" "}
                        {formatDate(group.startDate)} -{" "}
                        {formatDate(group.endDate)}
                        {(() => {
                          const daysUntil = getDaysUntil(group.startDate);
                          if (daysUntil > 0) {
                            return ` (${daysUntil} ${t("common.daysLeft")})`;
                          }
                          return "";
                        })()}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm">
                        {group.totalActivities > 0 && (
                          <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            {group.totalActivities}{" "}
                            {t("dailyPlanner.activities")}
                          </span>
                        )}
                        {group.totalExpenses > 0 && (
                          <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                            <Receipt className="w-3 h-3" />
                            {group.totalExpenses} {t("dailyPlanner.expenses")}
                          </span>
                        )}
                        {group.totalSpent > 0 && (
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {formatCurrency(
                              group.totalSpent,
                              userCurrency,
                              true
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {onEditItinerary && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditItinerary(group.name || "");
                        }}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                        title={t("common.edit")}
                      >
                        <Edit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>
                </div>
              </button>
            ) : (
              <div className="w-full p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex-shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {displayName}
                      </h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {group.days.length} {t("dailyPlanner.days")}{" "}
                        {t("dailyPlanner.withoutItinerary")}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm">
                        {group.totalActivities > 0 && (
                          <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            {group.totalActivities}{" "}
                            {t("dailyPlanner.activities")}
                          </span>
                        )}
                        {group.totalExpenses > 0 && (
                          <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                            <Receipt className="w-3 h-3" />
                            {group.totalExpenses} {t("dailyPlanner.expenses")}
                          </span>
                        )}
                        {group.totalSpent > 0 && (
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {formatCurrency(
                              group.totalSpent,
                              userCurrency,
                              true
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {onAddItinerary && (
                    <button
                      onClick={onAddItinerary}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Plus size={16} className="mr-2" />
                      {t("itinerary.addItinerary")}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Group Content - Solo para grupos con itinerario */}
            {group.name && isExpanded && (
              <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <div className="p-4 internal-spacing flex flex-col">
                  {/* Map toggle + AI button */}
                  <div className="mb-4">
                    <ItineraryMapSection
                      groupKey={`itinerary_${groupKey}`}
                      itineraryId={
                        group.name && typeof getItineraryIdByName === "function"
                          ? getItineraryIdByName(group.name)
                          : undefined
                      }
                      centerLatLng={(() => {
                        // Primero intentar obtener coordenadas de los días del plan diario
                        const firstWithCoords = group.days.find(
                          (d) => d.lat && d.lng
                        );

                        if (firstWithCoords) {
                          return [
                            firstWithCoords.lat as number,
                            firstWithCoords.lng as number,
                          ] as [number, number];
                        }

                        // Si no hay coordenadas en los días, usar las coordenadas del itinerario
                        if (group.name && getItineraryCoordinates) {
                          try {
                            const itineraryCoords = getItineraryCoordinates(
                              group.name
                            );
                            return [
                              itineraryCoords.lat,
                              itineraryCoords.lng,
                            ] as [number, number];
                          } catch (error) {
                            return undefined;
                          }
                        }

                        return undefined;
                      })()}
                      rightActions={
                        onAddAccommodationExpense ? (
                          <button
                            onClick={() =>
                              onAddAccommodationExpense?.(group.startDate)
                            }
                            className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 text-sm font-medium flex items-center gap-2"
                            title={t("overview.addAccommodation")}
                          >
                            <Bed className="w-4 h-4" />
                            {t("overview.addAccommodation")}
                          </button>
                        ) : undefined
                      }
                    />
                  </div>

                  {shouldShowPagination && (
                    <SimpleWeeklyPagination
                      currentWeek={currentWeek}
                      totalWeeks={totalWeeks}
                      onWeekChange={(week) => handleWeekChange(groupKey, week)}
                    />
                  )}

                  {/* Days for current week */}
                  {paginatedDays.map((day) => {
                    const dayNumber = getDayNumber(day.day);
                    const status =
                      selectedDate === day.day ? "active" : "upcoming";

                    const dayBudget = travelBudget
                      ? travelBudget / dailyPlan.length
                      : 0;

                    return (
                      <div
                        key={day.day}
                        ref={selectedDate === day.day ? selectedDayRef : null}
                      >
                        <TravelDay
                          dayNumber={dayNumber}
                          date={day.day}
                          budget={dayBudget}
                          activitiesCount={day.activities_count}
                          expensesCount={day.expenses_count}
                          totalSpent={day.total_spent}
                          status={status}
                          expanded={selectedDate === day.day}
                          onToggleExpand={() => handleToggleExpand(day.day)}
                          onAddActivity={() =>
                            onOpenAddActivityModal &&
                            onOpenAddActivityModal(day.day)
                          }
                          onAddExpense={() =>
                            onOpenAddExpenseModal &&
                            onOpenAddExpenseModal(day.day)
                          }
                          onEditActivity={onEditActivity || (() => {})}
                          onEditExpense={onEditExpense || (() => {})}
                          onAI={() =>
                            onOpenAIModal && onOpenAIModal(day.day, dayNumber)
                          }
                          isInNoItineraryGroup={group.name === null}
                          dailyItems={(() => {
                            const dayData = rawDailyPlan.find(
                              (d) => d.date === day.day
                            );
                            const items = dayData?.items || [];

                            return items.map(item => ({
                              ...item,
                              completed: typeof item.completed === 'boolean' ? item.completed : !!item.is_done,
                              date: day.day
                            }));
                          })()}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
