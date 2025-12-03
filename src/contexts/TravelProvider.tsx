import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUserAuthContext } from "./useUserAuthContext";

import { Travel, TripFormValues, DailyPlan } from "../types";
import {
  getTravelDailyPlan,
  getUserDailyPlan,
  DailyPlanItem,
  getUserDailyPlanForDateRange,
} from "../utils/dailyPlanApi";
import { useOptimizedTravelSummaries, useUpdateTravel } from "../utils/queries";
import { TravelSummary } from "../lib/travelUtils";
import { TravelContext } from "./TravelContext";

export const TravelProvider = ({
  travelId,
  children,
}: {
  travelId: string;
  children: React.ReactNode;
}) => {
  const [travel, setTravel] = useState<Travel | null>(null);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan[]>([]);
  const [detailedItems, setDetailedItems] = useState<
    Record<string, DailyPlanItem[]>
  >({});
  const [isInitialized, setIsInitialized] = useState(false);

  const { userAuthData } = useUserAuthContext();

  const queryClient = useQueryClient();
  const updateTravelMutation = useUpdateTravel();

  const travelListContextRef = useRef<unknown>(null);

  // Cache key for localStorage
  const localKey = `travel_${travelId}_${userAuthData?.id}`;

  // Usar hooks optimizados para evitar llamadas duplicadas
  const { data: travelSummaries } = useOptimizedTravelSummaries(
    userAuthData?.id || ""
  );

  // Procesar datos cuando estén disponibles
  useEffect(() => {
    if (!travelSummaries) return;

    // Encontrar el viaje específico en los resúmenes
    const travelSummary = travelSummaries.find(
      (summary: TravelSummary) => summary.id.toString() === travelId
    );

    if (!travelSummary) {
      console.error("Travel not found");
      setIsInitialized(true);
      return;
    }

    const freshTravel: Travel = {
      id: travelSummary.id.toString(),
      name: travelSummary.name,
      start_date: travelSummary.start_date,
      end_date: travelSummary.end_date,
      budget: travelSummary.budget || 0,
      image: undefined,
      total_expenses: travelSummary.total_expenses || 0,
      expenses_count: travelSummary.expenses_count || 0,
      total_activities: travelSummary.total_activity_costs || 0,
      activities_count: travelSummary.activities_count || 0,
      dailyPlans: [],
      bbox: travelSummary.bbox || [],
      created_at: new Date().toISOString(),
      user_id: userAuthData?.id || "",
      is_closed: false,
      is_synced: true,
      country_codes: travelSummary.country_codes || [],
    };

    setTravel(freshTravel);

    // Cargar el daily plan usando la función directa
    const loadDailyPlan = async () => {
      try {
        const dailyPlanData = await getTravelDailyPlan(travelId);
        setDailyPlan(dailyPlanData);
        setIsInitialized(true);

        // Cache the fresh data
        localStorage.setItem(
          localKey,
          JSON.stringify({
            travel: freshTravel,
            dailyPlan: dailyPlanData,
          })
        );
      } catch (error) {
        console.error("Error loading daily plan:", error);
        setIsInitialized(true);
      }
    };

    loadDailyPlan();
  }, [travelSummaries, travelId, userAuthData?.id, localKey]);

  // Function to refresh daily plan data
  const refreshDailyPlan = useCallback(async () => {
    if (!travelId || !userAuthData) return;

    try {
      const dailyPlanData = await getTravelDailyPlan(travelId);
      setDailyPlan(dailyPlanData);

      // Always update cache with fresh data
      if (travel) {
        localStorage.setItem(
          localKey,
          JSON.stringify({
            travel,
            dailyPlan: dailyPlanData,
          })
        );
      }
    } catch (error) {
      console.error("Error refreshing daily plan:", error);
    }
  }, [travelId, userAuthData, travel, localKey]);

  // 3. Totales y contadores - calcular desde dailyPlan
  const totalSpent = useMemo(() => {
    // Usar el valor correcto del backend para este viaje específico
    return travel?.total_expenses || 0;
  }, [travel]);

  const countExpenses = useMemo(() => {
    return dailyPlan.reduce((s, day) => s + day.expenses_count, 0);
  }, [dailyPlan]);

  const countActivities = useMemo(() => {
    return dailyPlan.reduce((s, day) => s + day.activities_count, 0);
  }, [dailyPlan]);

  const getDayTotals = (date: string) => {
    const dayData = dailyPlan.find((day) => day.day === date);
    return {
      expenses: dayData?.expenses_count || 0,
      activities: dayData?.activities_count || 0,
      total: dayData?.total_spent || 0,
    };
  };

  // Function to get detailed items for a specific date (cached)
  const getDetailedItems = useCallback(
    (date: string): DailyPlanItem[] => {
      return detailedItems[date] || [];
    },
    [detailedItems]
  );

  // Function to get a specific activity or expense by ID (from cache)
  const getItemById = useCallback(
    (date: string, itemId: string, type: "activity" | "expense") => {
      const items = detailedItems[date] || [];
      return items.find(
        (item) => item.type === type && item.source_id === itemId
      );
    },
    [detailedItems]
  );

  // Optimizar la carga de items detallados - solo cargar cuando sea necesario
  const loadDetailedItems = useCallback(
    async (date: string): Promise<void> => {
      if (!userAuthData || !travelId || detailedItems[date]) return;

      try {
        const items = await getUserDailyPlan(userAuthData.id, travelId, date);
        setDetailedItems((prev) => ({ ...prev, [date]: items }));
      } catch (error) {
        console.error("Error fetching detailed items:", error);
      }
    },
    [userAuthData, travelId, detailedItems]
  );

  // Función optimizada para cargar múltiples días a la vez
  const loadMultipleDays = useCallback(
    async (dates: string[]): Promise<void> => {
      if (!userAuthData || !travelId) return;

      const datesToLoad = dates.filter((date) => !detailedItems[date]);
      if (datesToLoad.length === 0) return;

      try {
        // Usar la función optimizada para cargar múltiples días
        const allItems = await getUserDailyPlanForDateRange(
          userAuthData.id,
          travelId,
          datesToLoad[0], // start date
          datesToLoad[datesToLoad.length - 1] // end date
        );

        // Actualizar el cache con todos los items
        setDetailedItems((prev) => ({ ...prev, ...allItems }));
      } catch (error) {
        console.error("Error fetching multiple days:", error);
      }
    },
    [userAuthData, travelId, detailedItems]
  );

  // Function to invalidate cache for a specific date
  const invalidateDateCache = useCallback((date: string) => {
    setDetailedItems((prev) => {
      const newCache = { ...prev };
      delete newCache[date];
      return newCache;
    });
  }, []);

  const updateTrip = async (tripData: TripFormValues): Promise<Travel> => {
    try {
      if (!travel) {
        throw new Error("No travel found");
      }

      const updates = {
        name: tripData.name,
        start_date: tripData.start_date,
        end_date: tripData.end_date,
        budget: tripData.budget,
        bbox: tripData.bbox || [],
        country_codes: tripData.country_codes,
      };

      const data = await updateTravelMutation.mutateAsync({
        id: travelId,
        updates,
      });

      const updatedTravel: Travel = {
        ...travel,
        ...data,
        country_codes: tripData.country_codes, // Agregar country_codes
        bbox: data.bbox || [],
      };

      setTravel(updatedTravel);

      // Limpiar cache del localStorage para forzar uso de datos frescos
      localStorage.removeItem(localKey);

      // Refrescar daily plan para reflejar los cambios de fechas
      await refreshDailyPlan();

      // Sincronizar con TravelListProvider si está disponible
      if (
        travelListContextRef.current &&
        typeof (travelListContextRef.current as any).refreshTravels ===
          "function"
      ) {
        (travelListContextRef.current as any).refreshTravels();
      }

      return updatedTravel;
    } catch (error) {
      console.error("Error updating trip:", error);
      let errorMsg = "";
      if (error && typeof error === "object") {
        if ("message" in error && typeof error.message === "string") {
          errorMsg = error.message;
        } else if ("details" in error && typeof error.details === "string") {
          errorMsg = error.details;
        } else if ("hint" in error && typeof error.hint === "string") {
          errorMsg = error.hint;
        } else {
          errorMsg = JSON.stringify(error);
        }
      } else {
        errorMsg = String(error);
      }
      console.error("Error updating trip:", errorMsg);
      throw error;
    }
  };

  // Cache management functions
  const clearAllTravelCache = useCallback(() => {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("travel_")) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  const invalidateCache = useCallback(() => {
    localStorage.removeItem(localKey);
  }, [localKey]);

  useEffect(() => {
    // Listen for data changes from other components
    const handleDataChanged = (event: Event) => {
      // Trigger a refetch of the optimized queries instead of reloading
      queryClient.invalidateQueries({ queryKey: ["optimizedTravelSummaries"] });
      queryClient.invalidateQueries({ queryKey: ["optimizedDailyPlan"] });
      queryClient.invalidateQueries({ queryKey: ["optimizedOverviewData"] });

      // If we have specific activity data, update it optimistically
      const customEvent = event as CustomEvent;
      if (
        customEvent.detail &&
        customEvent.detail.activityId &&
        typeof customEvent.detail.completed === "boolean"
      ) {
        setDetailedItems((prev) => {
          const newCache = { ...prev };

          // Find and update the specific activity in all cached dates
          Object.keys(newCache).forEach((date) => {
            if (newCache[date]) {
              newCache[date] = newCache[date].map((item) =>
                item.source_id === customEvent.detail.activityId &&
                item.type === "activity"
                  ? { ...item, is_done: customEvent.detail.completed }
                  : item
              );
            }
          });

          return newCache;
        });
      } else {
        // Fallback: trigger a background refresh for general updates
        const refreshCache = async () => {
          if (!userAuthData || !travelId) return;

          try {
            // Get all dates that are currently cached
            const cachedDates = Object.keys(detailedItems);
            if (cachedDates.length === 0) return;

            // Refresh all cached dates in the background
            const allItems = await getUserDailyPlanForDateRange(
              userAuthData.id,
              travelId,
              cachedDates[0],
              cachedDates[cachedDates.length - 1]
            );

            // Update cache with fresh data
            setDetailedItems((prev) => ({ ...prev, ...allItems }));
          } catch (error) {
            console.error("Error refreshing cache:", error);
          }
        };

        // Refresh in the background without blocking the UI
        refreshCache();
      }
    };

    const handleTravelDataChanged = () => {
      // Trigger a refetch of the optimized queries instead of reloading
      queryClient.invalidateQueries({ queryKey: ["optimizedTravelSummaries"] });
      queryClient.invalidateQueries({ queryKey: ["optimizedDailyPlan"] });
      queryClient.invalidateQueries({ queryKey: ["optimizedOverviewData"] });
    };

    window.addEventListener("dailyDataChanged", handleDataChanged);
    window.addEventListener("travelDataChanged", handleTravelDataChanged);

    return () => {
      window.removeEventListener("dailyDataChanged", handleDataChanged);
      window.removeEventListener("travelDataChanged", handleTravelDataChanged);
    };
  }, [queryClient, detailedItems, travelId, userAuthData]);

  return (
    <TravelContext.Provider
      value={{
        travel,
        dailyPlan,
        totalSpent,
        countActivities,
        countExpenses,
        isInitialized,
        updateTrip,
        refreshData: refreshDailyPlan,
        getDayTotals,
        getDetailedItems,
        getItemById,
        loadDetailedItems,
        loadMultipleDays,
        invalidateDateCache,
        clearAllTravelCache,
        invalidateCache,
      }}
    >
      {children}
    </TravelContext.Provider>
  );
};
