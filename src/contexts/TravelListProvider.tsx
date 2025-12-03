import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useUserAuthContext } from "./useUserAuthContext";

import { Travel, TripFormValues } from "../types";
import { useCreateTravel, useDeleteTravel } from "../utils/queries";
import { TravelSummary } from "../lib/travelUtils";
import { TravelListContext } from "./TravelContext";

export const TravelListProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [travels, setTravels] = useState<Travel[]>([]);
  const [loading, setLoading] = useState(true);

  const { userAuthData } = useUserAuthContext();

  // Flag simple para evitar la segunda llamada en desarrollo
  const hasLoaded = useRef(false);

  // React Query mutations
  const createTravelMutation = useCreateTravel();
  const deleteTravelMutation = useDeleteTravel();

  // Helper function para manejar errores de manera consistente
  const handleError = useCallback((error: unknown, operation: string) => {
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
    console.error(`Error in ${operation}:`, errorMsg);
    throw error;
  }, []);

  const fetchTravels = useCallback(async () => {
    if (!userAuthData) {
      setLoading(false);
      return;
    }

    try {
      // Usar la función get_travel_summaries para obtener travels con totales de gastos y actividades
      const { data: travelSummaries, error } = await supabase.rpc(
        "get_travel_summaries"
      );

      if (error) {
        console.error("Error fetching travel summaries:", error);
        setTravels([]);
        return;
      }

      // Transformar los resúmenes de travels con los totales incluidos
      const transformedTravels: Travel[] = (travelSummaries || []).map(
        (summary: TravelSummary) => ({
          id: summary.id.toString(),
          name: summary.name,
          start_date: summary.start_date,
          end_date: summary.end_date,
          budget: summary.budget || 0,
          image: undefined,
          total_expenses: summary.total_expenses || 0,
          expenses_count: summary.expenses_count || 0,
          total_activities: summary.total_activity_costs || 0,
          activities_count: summary.activities_count || 0,
          dailyPlans: [],
          bbox: summary.bbox || [],
          created_at: summary.created_at,
          user_id: summary.user_id,
          is_closed: summary.is_closed,
          is_synced: summary.is_synced,
          country_codes: summary.country_codes || [],
        })
      );

      setTravels(transformedTravels);
    } catch (error) {
      console.error("Error in fetchTravels:", error);
      setTravels([]);
    } finally {
      setLoading(false);
    }
  }, [userAuthData]);

  const createTrip = useCallback(
    async (tripData: TripFormValues): Promise<Travel> => {
      try {
        if (!userAuthData) {
          throw new Error("No user found");
        }

        const insertData = {
          name: tripData.name,
          start_date: tripData.start_date,
          end_date: tripData.end_date,
          budget: tripData.budget,
          bbox: tripData.bbox || [],
          country_codes: tripData.country_codes,
          user_id: userAuthData.id,
        };

        const data = await createTravelMutation.mutateAsync(insertData);

        const newTravel: Travel = {
          ...data,
          country_codes: tripData.country_codes,
          total_expenses: 0,
          expenses_count: 0,
          total_activities: 0,
          activities_count: 0,
          dailyPlans: [],
          bbox: data.bbox || [],
        };

        setTravels((prev) => [...prev, newTravel]);
        return newTravel;
      } catch (error) {
        return handleError(error, "crear viaje");
      }
    },
    [userAuthData, handleError, createTravelMutation]
  );

  const deleteTrip = useCallback(
    async (tripId: string): Promise<void> => {
      try {
        await deleteTravelMutation.mutateAsync(tripId);

        setTravels((prev) => prev.filter((travel) => travel.id !== tripId));
      } catch (error) {
        return handleError(error, "eliminar viaje");
      }
    },
    [handleError, deleteTravelMutation]
  );

  const refreshTravels = useCallback(async () => {
    await fetchTravels();
  }, [fetchTravels]);

  useEffect(() => {
    if (userAuthData && !hasLoaded.current) {
      fetchTravels();
      hasLoaded.current = true;
    } else if (!userAuthData) {
      // Reset hasLoaded when user becomes null
      hasLoaded.current = false;
    }
  }, [fetchTravels, userAuthData]);

  // Listen for data changes from other components
  useEffect(() => {
    const handleDataChanged = () => {
      fetchTravels();
    };

    const handleTravelDataChanged = () => {
      fetchTravels();
    };

    window.addEventListener("dailyDataChanged", handleDataChanged);
    window.addEventListener("travelDataChanged", handleTravelDataChanged);

    return () => {
      window.removeEventListener("dailyDataChanged", handleDataChanged);
      window.removeEventListener("travelDataChanged", handleTravelDataChanged);
    };
  }, [fetchTravels]);

  return (
    <TravelListContext.Provider
      value={{
        travels,
        loading,
        refreshTravels,
        createTrip,
        deleteTrip,
      }}
    >
      {children}
    </TravelListContext.Provider>
  );
};
