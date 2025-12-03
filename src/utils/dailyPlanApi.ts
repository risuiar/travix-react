import { supabase } from "../supabaseClient";
import { DailyPlan } from "../types";

export interface DailyPlanItem {
  date: string;
  title: string;
  description: string;
  time: string;
  location: string;
  is_done: boolean;
  type: "activity" | "expense";
  source_id: string; // Mantener para compatibilidad
  travel_id: number;
  user_id: string;
  city_id: number | null;
  day_id: number | null;
  cost: number | null;
  category: string | null;
  priority: "high" | "medium" | "low" | null;
  generated_by_ai?: boolean;
  rating?: number;
  reviews_count?: string;
  address?: string;
  google_category?: string;
}

export const getTravelDailyPlan = async (
  travelId: string
): Promise<DailyPlan[]> => {
  const { data, error } = await supabase.rpc("get_travel_daily_plan", {
    _travel_id: parseInt(travelId),
  });

  if (error) {
    throw new Error(`Error fetching daily plan: ${error.message}`);
  }

  return data || [];
};

export const getUserDailyPlan = async (
  userId: string,
  travelId: string,
  date: string
): Promise<DailyPlanItem[]> => {
  try {
    // Use the Supabase function to get all data
    const { data: functionData, error: functionError } = await supabase.rpc(
      "get_user_daily_plan",
      {
        uid: userId,
        trip_id: parseInt(travelId),
        day: date,
      }
    );

    if (functionError) {
      console.error("Error fetching daily plan:", functionError);
      throw new Error(`Error fetching daily plan: ${functionError.message}`);
    }

    return functionData || [];
  } catch (error) {
    console.error("Error in getUserDailyPlan:", error);
    throw error;
  }
};

// Reemplazo: obtener todos los items del viaje (con y sin fecha)
export const getUserDailyPlanForDateRange = async (
  _userId: string, // ya no se usa
  travelId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _startDate: string, // ya no se usa
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _endDate: string // ya no se usa
): Promise<Record<string, DailyPlanItem[]>> => {
  try {
    const { data, error } = await supabase.rpc("get_travel_all_items", {
      trip_id: parseInt(travelId),
    });

    if (error) {
      console.error("❌ Error calling get_travel_all_items:", error);
      throw error;
    }

    // Agrupar por fecha
    const dataByDate: Record<string, DailyPlanItem[]> = {};
    if (data) {
      data.forEach((item: any) => {
        const date = item.date || "general";
        if (!dataByDate[date]) dataByDate[date] = [];

        const mappedItem = {
          date: item.date,
          title: item.title,
          description: item.description,
          time: item.time,
          location: item.location,
          is_done: item.completed, // La función SQL devuelve 'completed', no 'is_done'
          type: item.type,
          source_id: item.id, // La API devuelve 'id', no 'source_id'
          travel_id: parseInt(travelId),
          user_id: "", // RLS
          city_id: null,
          day_id: null,
          cost: item.cost,
          category: item.category,
          priority: item.category === "accommodation" ? null : item.priority,
          generated_by_ai: item.generated_by_ai,
        };

        // Debug logs removed to reduce console noise

        dataByDate[date].push(mappedItem);
      });
    }

    return dataByDate;
  } catch (error) {
    console.error("Error in getUserDailyPlanForDateRange (all items):", error);
    throw error;
  }
};
