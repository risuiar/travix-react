import { supabase } from "../supabaseClient";

export interface GeneralItem {
  id: number;
  title: string;
  description: string;
  cost: number;
  type: "activity" | "expense";
  category: string;
  travel_id: number;
  user_id: string;
  start_date?: string;
  end_date?: string;
}

export const getGeneralItems = async (
  travelId: number
): Promise<GeneralItem[]> => {
  try {
    // Obtener actividades generales (sin fecha)
    const { data: activities, error: activitiesError } = await supabase
      .from("travel_activities")
      .select("*")
      .eq("travel_id", travelId)
      .is("date", null);

    if (activitiesError) {
      console.error("Error fetching general activities:", activitiesError);
      throw activitiesError;
    }

    // Obtener gastos generales (sin fecha) pero EXCLUIR accommodation
    const { data: expenses, error: expensesError } = await supabase
      .from("travel_expenses")
      .select("*")
      .eq("travel_id", travelId)
      .is("date", null)
      .neq("category", "accommodation"); // Excluir accommodation

    if (expensesError) {
      console.error("Error fetching general expenses:", expensesError);
      throw expensesError;
    }

    // Combinar y transformar los datos
    const generalItems: GeneralItem[] = [
      ...(activities || []).map((activity) => ({
        id: activity.id,
        title: activity.title,
        description: activity.description || "",
        cost: activity.cost || 0,
        type: "activity" as const,
        category: activity.category || "other",
        travel_id: activity.travel_id,
        user_id: activity.user_id,
      })),
      ...(expenses || []).map((expense) => ({
        id: expense.id,
        title: expense.title,
        description: expense.description || "",
        cost: expense.cost || 0,
        type: "expense" as const,
        category: expense.category || "other",
        travel_id: expense.travel_id,
        user_id: expense.user_id,
        start_date: expense.start_date,
        end_date: expense.end_date,
      })),
    ];

    return generalItems;
  } catch (error) {
    console.error("Error in getGeneralItems:", error);
    throw error;
  }
};
