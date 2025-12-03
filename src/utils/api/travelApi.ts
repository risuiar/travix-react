import { supabase } from "../../supabaseClient";

// Tipos para los datos del header
export interface TravelHeaderData {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  budget: number;
  bbox: number[];
  country_codes: string[];
  created_at: string;
  user_id: string;
  is_closed: boolean;
  total_expenses: number;
  expenses_count: number;
  total_activities: number;
  activities_count: number;
  total_days: number;
  remaining_budget: number;
}

// Tipos para los datos del overview
export interface TravelOverviewData {
  travel_id: number;
  travel_name: string;
  start_date: string;
  end_date: string;
  budget: number;
  upcoming_days: Array<{
    date: string;
    day_number: number;
    activities_count: number;
    total_cost: number;
  }>;
  recent_expenses: Array<{
    id: number;
    title: string;
    category: string;
    location: string;
    cost: number;
    date: string;
  }>;
  total_activities: number;
  total_expenses: number;
  total_spent: number;
  total_activity_costs: number;
}

// Tipos para los datos del daily plan items
export interface DailyPlanItem {
  id: number;
  title: string;
  description: string;
  time: string | null;
  location: string;
  is_done: boolean;
  type: "activity" | "expense";
  source_id: string;
  cost: number;
  category: string;
  priority: string | null;
  itinerary_id: number | null;
  lat: number | null;
  lng: number | null;
  place_id: string | null;
  address: string | null;
  google_category: string | null;
  rating: number | null;
  reviews_count: number | null;
  url: string | null;
}

export interface TravelDailyPlanItems {
  travel_id: number;
  travel_name: string;
  start_date: string;
  end_date: string;
  daily_items: Array<{
    date: string;
    items: DailyPlanItem[];
  }>;
}

// Tipos para los datos de general items
export interface GeneralItem {
  id: number;
  title: string;
  description: string;
  cost: number;
  type: "activity" | "expense";
  source_id: string;
  category: string;
  location: string;
  itinerary_id: number | null;
  lat: number | null;
  lng: number | null;
  place_id: string | null;
  address: string | null;
  paid_by?: string | null;
  currency?: string | null;
  time?: string | null;
  priority?: string | null;
  is_done?: boolean;
  google_category?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
  url?: string | null;
}

export interface TravelGeneralItems {
  travel_id: number;
  travel_name: string;
  general_activities: GeneralItem[];
  general_expenses: GeneralItem[];
}

// Tipos para los datos de expenses
export interface ExpenseItem {
  id: number;
  title: string;
  cost: number;
  date: string;
  location: string;
  notes: string;
  currency: string;
  paid_by: string | null;
  itinerary_id: number | null;
  lat: number | null;
  lng: number | null;
  place_id: string | null;
  address: string | null;
}

export interface ExpenseCategory {
  category: string;
  total: number;
  count: number;
  expenses: ExpenseItem[];
}

// Tipos para crear viajes
export interface TripFormValues {
  name: string;
  start_date: string;
  end_date: string;
  budget: number;
  country_codes: Array<Record<string, string>>; // Compatible con el tipo existente
  bbox?: number[];
}

// Función para crear un viaje (sin depender del contexto)
export const createTrip = async (
  tripData: TripFormValues,
  userId: string
): Promise<TravelHeaderData> => {
  try {
    const insertData = {
      name: tripData.name,
      start_date: tripData.start_date,
      end_date: tripData.end_date,
      budget: tripData.budget,
      bbox: tripData.bbox || [],
      country_codes: tripData.country_codes,
      user_id: userId,
    };

    const { data, error } = await supabase
      .from("travels")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Retornar el viaje creado con datos del header
    const headerData: TravelHeaderData = {
      id: data.id,
      name: data.name,
      start_date: data.start_date,
      end_date: data.end_date,
      budget: data.budget,
      bbox: data.bbox || [],
      country_codes: data.country_codes,
      created_at: data.created_at,
      user_id: data.user_id,
      is_closed: data.is_closed,
      total_expenses: 0,
      expenses_count: 0,
      total_activities: 0,
      activities_count: 0,
      total_days: 0,
      remaining_budget: data.budget,
    };

    return headerData;
  } catch (error) {
    console.error("Error creating trip:", error);
    throw error;
  }
};

// Función para obtener datos del header de un viaje
export const fetchTravelHeaderData = async (
  travelId: number
): Promise<TravelHeaderData | null> => {
  try {
    const { data, error } = await supabase
      .from("travel_header_data")
      .select("*")
      .eq("id", travelId)
      .single();

    if (error) {
      console.error("Error fetching travel header data:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in fetchTravelHeaderData:", error);
    return null;
  }
};

// Función para obtener datos del overview de un viaje
export const fetchTravelOverviewData = async (
  travelId: number
): Promise<TravelOverviewData | null> => {
  try {
    const { data, error } = await supabase
      .from("travel_overview_data")
      .select("*")
      .eq("travel_id", travelId)
      .single();

    if (error) {
      console.error("Error fetching travel overview data:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in fetchTravelOverviewData:", error);
    return null;
  }
};

// Función para obtener datos del daily plan items de un viaje
export const fetchTravelDailyPlanItems = async (
  travelId: number
): Promise<TravelDailyPlanItems | null> => {
  try {
    const { data, error } = await supabase
      .from("travel_daily_plan_items")
      .select("*")
      .eq("travel_id", travelId)
      .single();

    if (error) {
      console.error("Error fetching travel daily plan items:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in fetchTravelDailyPlanItems:", error);
    return null;
  }
};

// Función para obtener datos de general items de un viaje
export const fetchTravelGeneralItems = async (
  travelId: number
): Promise<TravelGeneralItems | null> => {
  try {
    const { data, error } = await supabase
      .from("travel_general_items")
      .select("*")
      .eq("travel_id", travelId)
      .single();

    if (error) {
      console.error("Error fetching travel general items:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in fetchTravelGeneralItems:", error);
    return null;
  }
};

// Función para obtener todos los headers de viajes del usuario
export const fetchAllTravelHeaders = async (): Promise<TravelHeaderData[]> => {
  try {
    // Obtener el usuario autenticado actual
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Error getting authenticated user:", authError);
      return [];
    }

    const { data, error } = await supabase
      .from("travel_header_data")
      .select(
        `
        id,
        name,
        start_date,
        end_date,
        budget,
        bbox,
        country_codes,
        created_at,
        user_id,
        is_closed,
        total_expenses,
        expenses_count,
        total_activities,
        activities_count,
        total_days,
        remaining_budget
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching all travel headers:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchAllTravelHeaders:", error);
    return [];
  }
};

// Función para actualizar un viaje
export const updateTrip = async (
  travelId: number,
  tripData: TripFormValues
): Promise<TravelHeaderData> => {
  try {
    const updates = {
      name: tripData.name,
      start_date: tripData.start_date,
      end_date: tripData.end_date,
      budget: tripData.budget,
      bbox: tripData.bbox || [],
      country_codes: tripData.country_codes,
    };

    const { data, error } = await supabase
      .from("travels")
      .update(updates)
      .eq("id", travelId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Retornar el viaje actualizado con datos del header
    const headerData: TravelHeaderData = {
      id: data.id,
      name: data.name,
      start_date: data.start_date,
      end_date: data.end_date,
      budget: data.budget,
      bbox: data.bbox || [],
      country_codes: data.country_codes,
      created_at: data.created_at,
      user_id: data.user_id,
      is_closed: data.is_closed,
      total_expenses: 0, // Estos valores se calculan en la vista
      expenses_count: 0,
      total_activities: 0,
      activities_count: 0,
      total_days: 0,
      remaining_budget: data.budget,
    };

    return headerData;
  } catch (error) {
    console.error("Error updating trip:", error);
    throw error;
  }
};
