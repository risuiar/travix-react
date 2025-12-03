import { supabase } from "../../supabaseClient";
import { Expense, ExpenseCategory } from "../../types";

// Función para obtener todos los gastos (excluyendo accommodations)
export const fetchTravelExpenses = async (
  travelId: number,
  userId: string
): Promise<Expense[]> => {
  try {
    const { data, error } = await supabase
      .from("travel_expenses")
      .select("*")
      .eq("travel_id", travelId)
      .eq("user_id", userId)
      .neq("category", "accommodation") // Excluir accommodations
      .order("date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching travel expenses:", error);
      throw error;
    }

    // Transformar los datos al formato Expense
    return (data || []).map((item): Expense => ({
      id: item.id.toString(),
      title: item.title,
      cost: item.cost || 0,
      currency: item.currency || "USD",
      category: (item.category as ExpenseCategory) || "other",
      date: item.date,
      location: item.location,
      notes: item.notes,
    }));
  } catch (error) {
    console.error("Error in fetchTravelExpenses:", error);
    throw error;
  }
};

// Función para obtener solo las accommodations
export const fetchTravelAccommodations = async (
  travelId: number,
  userId: string
): Promise<Expense[]> => {
  try {
    const { data, error } = await supabase
      .from("travel_expenses")
      .select("*")
      .eq("travel_id", travelId)
      .eq("user_id", userId)
      .eq("category", "accommodation") // Solo accommodations
      .order("start_date", { ascending: true, nullsFirst: false })
      .order("date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching travel accommodations:", error);
      throw error;
    }

    // Transformar los datos al formato Expense
    // Para accommodations, NO distribuir por días, mantener como un solo item
    const accommodations: Expense[] = [];
    
    (data || []).forEach((item) => {
      // Accommodation - mantener como un solo item con rango de fechas
      accommodations.push({
        id: item.id.toString(),
        title: item.title,
        cost: item.cost || 0,
        currency: item.currency || "USD",
        category: "accommodation" as ExpenseCategory,
        date: item.date, // Puede ser null para accommodations con rango
        location: item.location,
        notes: item.notes,
        // Agregar información de rango para accommodations
        startDate: item.start_date,
        endDate: item.end_date,
      });
    });

    return accommodations;
  } catch (error) {
    console.error("Error in fetchTravelAccommodations:", error);
    throw error;
  }
};

// Función para obtener el total gastado en expenses (sin accommodations)
export const fetchExpensesTotal = async (
  travelId: number,
  userId: string
): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from("travel_expenses")
      .select("cost")
      .eq("travel_id", travelId)
      .eq("user_id", userId)
      .neq("category", "accommodation");

    if (error) {
      console.error("Error fetching expenses total:", error);
      return 0;
    }

    return (data || []).reduce((total, item) => total + (item.cost || 0), 0);
  } catch (error) {
    console.error("Error in fetchExpensesTotal:", error);
    return 0;
  }
};

// Función para obtener el total gastado en accommodations
export const fetchAccommodationsTotal = async (
  travelId: number,
  userId: string
): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from("travel_expenses")
      .select("cost")
      .eq("travel_id", travelId)
      .eq("user_id", userId)
      .eq("category", "accommodation");

    if (error) {
      console.error("Error fetching accommodations total:", error);
      return 0;
    }

    return (data || []).reduce((total, item) => total + (item.cost || 0), 0);
  } catch (error) {
    console.error("Error in fetchAccommodationsTotal:", error);
    return 0;
  }
};

// Función para obtener el conteo de actividades (sin usar views)
export const fetchActivitiesCount = async (
  travelId: number,
  userId: string
): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from("travel_activities")
      .select("*", { count: "exact", head: true })
      .eq("travel_id", travelId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching activities count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error in fetchActivitiesCount:", error);
    return 0;
  }
};
