import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabaseClient";
import { useToast } from "../hooks/useToast";
import {
  createItinerary,
  updateItinerary,
  deleteItinerary,
  getItinerariesByTravelId,
} from "./itineraryApi";

import { useEffect } from "react";

// Tipos para el Overview
interface UpcomingDay {
  date: string;
  dayNumber: number;
  activities: Array<{ name: string; cost: number }>;
  moreActivities: number;
  totalActivities: number;
}

interface RecentExpense {
  id: string;
  title: string;
  category: string;
  location: string;
  description: string;
  cost: number;
  icon: string;
  color: string;
}

// Query keys
export const queryKeys = {
  dailyPlan: (userId: string, travelId: string, date: string) => [
    "dailyPlan",
    userId,
    travelId,
    date,
  ],
  travel: (travelId: string) => ["travel", travelId],
  activities: (travelId: string) => ["activities", travelId],
  expenses: (travelId: string) => ["expenses", travelId],
  generalItems: (travelId: string) => ["generalItems", travelId],
};

// Hook optimizado para obtener datos del overview usando React Query
export const useOptimizedOverviewData = (
  userId: string,
  travelId: string,
  today: string,
  travelStartDate: string
) => {
  // Calcular el rango de fechas (30 días atrás + hoy + 7 días futuros)
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 30);
  const startDateString = startDate.toISOString().split("T")[0];

  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 7);
  const endDateString = endDate.toISOString().split("T")[0];

  // Query principal para obtener todos los datos del overview
  const {
    data: allData,
    isLoading,
    error,
    refetch,
  } = useMutation({
    queryKey: [
      "optimizedOverviewData",
      userId,
      travelId,
      startDateString,
      endDateString,
    ],
    queryFn: async () => {
      const result = await supabase.rpc("get_user_daily_plan_for_date_range", {
        params: {
          user_id: userId,
          travel_id: travelId,
          start_date: startDateString,
          end_date: endDateString,
        },
      });
      return result;
    },
    enabled: !!userId && !!travelId && !!today,
    staleTime: 10 * 1000, // 10 segundos - tiempo muy corto para actualizaciones inmediatas
    gcTime: 2 * 60 * 1000, // 2 minutos - mantener en cache menos tiempo
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
    retryDelay: 2000,
  });

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

  // Procesar los datos
  const todayData = allData?.[today] || [];

  // Si no hay datos del travel, usar estructura básica
  const enhancedData = allData || {};

  const futureData = Object.entries(enhancedData)
    .filter(([date]) => date !== today && date > today)
    .map(([date, data]) => ({
      date,
      data,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  // Extraer actividades del día actual
  const todayActivities = todayData
    .filter((item: any) => item.type === "activity")
    .map((item: any) => ({
      id: item.source_id,
      title: item.title,
      description: item.description,
      date: item.date,
      time: item.time,
      cost: item.cost || 0,
      category: item.category || "other",
      priority: item.priority || "medium",
      completed: item.is_done,
      location: item.location,
    }));

  // Extraer gastos del día actual
  const todayExpenses = todayData
    .filter((item: any) => item.type === "expense")
    .map((item: any) => ({
      id: item.source_id,
      title: item.title,
      cost: item.cost || 0,
      currency: "EUR",
      category: item.category || "other",
      date: item.date,
      location: item.location,
      notes: item.description,
    }));

  // Procesar datos de próximos días
  const upcomingDaysData: UpcomingDay[] = [];
  const allRecentExpenses: RecentExpense[] = [];

  // Incluir gastos del día actual
  todayData
    .filter((item: any) => item.type === "expense")
    .forEach((item: any) => {
      allRecentExpenses.push({
        id: item.source_id,
        title: item.title,
        category: item.category || "other",
        location: item.location,
        description: item.description,
        cost: item.cost || 0,
        icon: getCategoryIcon(item.category || "other"),
        color: getCategoryColor(item.category || "other"),
      });
    });

  futureData.forEach(({ date, data }) => {
    const activities = data.filter(
      (item: any) => item.type === "activity" && item.date
    );

    if (activities.length > 0) {
      const startDate = new Date(travelStartDate);
      const currentDate = new Date(date);
      const dayNumber =
        Math.floor(
          (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;

      upcomingDaysData.push({
        date,
        dayNumber,
        activities: activities.slice(0, 2).map((item: any) => ({
          name: item.title,
          cost: item.cost || 0,
        })),
        moreActivities: Math.max(0, activities.length - 2),
        totalActivities: activities.length,
      });
    }

    // Recolectar gastos recientes
    const expenses = data.filter((item: any) => item.type === "expense");
    allRecentExpenses.push(
      ...expenses.map((item: any) => ({
        id: item.source_id,
        title: item.title,
        category: item.category || "other",
        location: item.location,
        description: item.description,
        cost: item.cost || 0,
        icon: getCategoryIcon(item.category || "other"),
        color: getCategoryColor(item.category || "other"),
      }))
    );
  });

  return {
    todayActivities,
    todayExpenses,
    upcomingDays: upcomingDaysData,
    recentExpenses: allRecentExpenses.slice(0, 5),
    allExpenses: allRecentExpenses,
    isLoading,
    error,
    refetch,
  };
};

// Hook optimizado para obtener travel summaries usando React Query
export const useOptimizedTravelSummaries = (userId: string) => {
  return useMutation({
    mutationKey: ["optimizedTravelSummaries", userId],
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("get_travel_summaries");
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
    retryDelay: 2000,
  });
};

// Hook optimizado para obtener daily plan usando React Query
export const useOptimizedDailyPlan = (travelId: string) => {
  return useMutation({
    mutationKey: ["optimizedDailyPlan", travelId],
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("get_travel_daily_plan", {
        travel_id: travelId,
      });
      if (error) throw error;
      return data;
    },
    retry: 1,
    retryDelay: 2000,
  });
};

// Mutations para actividades
export const useCreateActivity = () => {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToast();

  return useMutation({
    mutationFn: async (
      activityData: Omit<any, "id" | "completed"> & {
        travel_id: string;
        user_id: string;
        itinerary_id?: string;
      }
    ) => {
      const { data, error } = await supabase
        .from("travel_activities")
        .insert([activityData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidar todas las queries del viaje usando las nuevas query keys
      if (data?.travel_id) {
        queryClient.invalidateQueries({
          queryKey: ["travel", parseInt(data.travel_id)],
          exact: false, // Importante: invalidar todas las sub-queries
        });

        // Evitar refetch duplicados; confiar en invalidateQueries
      }

      // Dispatch custom event to notify components that daily data has changed
      window.dispatchEvent(new CustomEvent("dailyDataChanged"));

      // Mostrar toast de éxito
      showSuccessToast("Success", "Activity created successfully");
    },
    onError: (error) => {
      console.error("Error creating activity:", error);
      showErrorToast("Error", "Failed to create activity");
    },
  });
};

export const useUpdateActivity = () => {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      travelId,
      ...activityData
    }: { id: string; travelId: string } & Omit<any, "id" | "completed">) => {
      const { data, error } = await supabase
        .from("travel_activities")
        .update({
          ...activityData,
          travel_id: travelId,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidar todas las queries del viaje usando las nuevas query keys
      queryClient.invalidateQueries({
        queryKey: ["travel", parseInt(variables.travelId)],
        exact: false, // Importante: invalidar todas las sub-queries
      });

      // Evitar refetch duplicados; confiar en invalidateQueries

      // Dispatch custom event to notify components that daily data has changed
      window.dispatchEvent(new CustomEvent("dailyDataChanged"));

      // Mostrar toast de éxito
      showSuccessToast("Success", "Activity updated successfully");
    },
    onError: (error) => {
      console.error("Error updating activity:", error);
      showErrorToast("Error", "Failed to update activity");
    },
  });
};

export const useDeleteActivity = () => {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      travelId,
    }: {
      id: string;
      travelId: string;
      date?: string;
    }) => {
      const { error } = await supabase
        .from("travel_activities")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, travelId };
    },
    onSuccess: (data, variables) => {
      // Invalidar todas las queries del viaje usando las nuevas query keys
      queryClient.invalidateQueries({
        queryKey: ["travel", parseInt(variables.travelId)],
        exact: false, // Importante: invalidar todas las sub-queries
      });

      // Evitar refetch duplicados; confiar en invalidateQueries

      // Dispatch custom event to notify components que daily data has changed
      window.dispatchEvent(new CustomEvent("dailyDataChanged"));

      // Mostrar toast de éxito
      showSuccessToast("Success", "Activity deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting activity:", error);
      showErrorToast("Error", "Failed to delete activity");
    },
  });
};

// Mutations para gastos
export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToast();

  return useMutation({
    mutationFn: async (
      expenseData: Omit<any, "id"> & {
        travel_id: string;
        user_id: string;
        itinerary_id?: string;
      }
    ) => {
      const { data, error } = await supabase
        .from("travel_expenses")
        .insert([expenseData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidar todas las queries del viaje usando las nuevas query keys
      if (data?.travel_id) {
        const travelId = parseInt(data.travel_id);
        
        // Invalidar queries viejas del viaje
        queryClient.invalidateQueries({
          queryKey: ["travel", travelId],
          exact: false, // Importante: invalidar todas las sub-queries
        });

        // Invalidar NUEVAS queries de expenses separadas
        queryClient.invalidateQueries({
          queryKey: ["travel-expenses", travelId],
        });
        
        queryClient.invalidateQueries({
          queryKey: ["travel-accommodations", travelId],
        });
        
        queryClient.invalidateQueries({
          queryKey: ["expenses-total", travelId],
        });
        
        queryClient.invalidateQueries({
          queryKey: ["accommodations-total", travelId],
        });
        
        queryClient.invalidateQueries({
          queryKey: ["activities-count", travelId],
        });

        // FORZAR REFETCH INMEDIATO de las queries específicas viejas (por compatibilidad)
        queryClient.refetchQueries({
          queryKey: ["travel", "daily-plan-items", travelId],
        });

        queryClient.refetchQueries({
          queryKey: ["travel", "overview", travelId],
        });
        
        // FORZAR REFETCH INMEDIATO de las NUEVAS queries de expenses
        queryClient.refetchQueries({
          queryKey: ["travel-expenses", travelId],
        });
        
        queryClient.refetchQueries({
          queryKey: ["travel-accommodations", travelId],
        });
        
        queryClient.refetchQueries({
          queryKey: ["expenses-total", travelId],
        });
        
        queryClient.refetchQueries({
          queryKey: ["accommodations-total", travelId],
        });
      }

      // Dispatch custom event to notify components that daily data has changed
      window.dispatchEvent(new CustomEvent("dailyDataChanged"));

      // Mostrar toast de éxito
      showSuccessToast("Success", "Expense created successfully");
    },
    onError: (error) => {
      console.error("Error creating expense:", error);
      showErrorToast("Error", "Failed to create expense");
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      travelId,
      ...expenseData
    }: { id: string; travelId: string } & Omit<any, "id">) => {
      const { data, error } = await supabase
        .from("travel_expenses")
        .update({
          ...expenseData,
          travel_id: travelId,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      const travelId = parseInt(variables.travelId);
      
      // Invalidar todas las queries del viaje usando las nuevas query keys
      queryClient.invalidateQueries({
        queryKey: ["travel", travelId],
        exact: false, // Importante: invalidar todas las sub-queries
      });

      // Invalidar NUEVAS queries de expenses separadas
      queryClient.invalidateQueries({
        queryKey: ["travel-expenses", travelId],
      });
      
      queryClient.invalidateQueries({
        queryKey: ["travel-accommodations", travelId],
      });
      
      queryClient.invalidateQueries({
        queryKey: ["expenses-total", travelId],
      });
      
      queryClient.invalidateQueries({
        queryKey: ["accommodations-total", travelId],
      });

      // FORZAR REFETCH INMEDIATO de las queries específicas viejas (por compatibilidad)
      queryClient.refetchQueries({
        queryKey: ["travel", "daily-plan-items", travelId],
      });

      queryClient.refetchQueries({
        queryKey: ["travel", "overview", travelId],
      });
      
      // FORZAR REFETCH INMEDIATO de las NUEVAS queries de expenses
      queryClient.refetchQueries({
        queryKey: ["travel-expenses", travelId],
      });
      
      queryClient.refetchQueries({
        queryKey: ["travel-accommodations", travelId],
      });
      
      queryClient.refetchQueries({
        queryKey: ["expenses-total", travelId],
      });
      
      queryClient.refetchQueries({
        queryKey: ["accommodations-total", travelId],
      });

      // Dispatch custom event to notify components that daily data has changed
      window.dispatchEvent(new CustomEvent("dailyDataChanged"));

      // Mostrar toast de éxito
      showSuccessToast("Success", "Expense updated successfully");
    },
    onError: (error) => {
      console.error("Error updating expense:", error);
      showErrorToast("Error", "Failed to update expense");
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      travelId,
    }: {
      id: string;
      travelId: string;
      date?: string;
    }) => {
      const { error } = await supabase
        .from("travel_expenses")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, travelId };
    },
    onSuccess: (data, variables) => {
      const travelId = parseInt(variables.travelId);
      
      // Invalidar todas las queries del viaje usando las nuevas query keys
      queryClient.invalidateQueries({
        queryKey: ["travel", travelId],
        exact: false, // Importante: invalidar todas las sub-queries
      });

      // Invalidar NUEVAS queries de expenses separadas
      queryClient.invalidateQueries({
        queryKey: ["travel-expenses", travelId],
      });
      
      queryClient.invalidateQueries({
        queryKey: ["travel-accommodations", travelId],
      });
      
      queryClient.invalidateQueries({
        queryKey: ["expenses-total", travelId],
      });
      
      queryClient.invalidateQueries({
        queryKey: ["accommodations-total", travelId],
      });

      // FORZAR REFETCH INMEDIATO de las queries específicas viejas (por compatibilidad)
      queryClient.refetchQueries({
        queryKey: ["travel", "daily-plan-items", travelId],
      });

      queryClient.refetchQueries({
        queryKey: ["travel", "overview", travelId],
      });
      
      // FORZAR REFETCH INMEDIATO de las NUEVAS queries de expenses
      queryClient.refetchQueries({
        queryKey: ["travel-expenses", travelId],
      });
      
      queryClient.refetchQueries({
        queryKey: ["travel-accommodations", travelId],
      });
      
      queryClient.refetchQueries({
        queryKey: ["expenses-total", travelId],
      });
      
      queryClient.refetchQueries({
        queryKey: ["accommodations-total", travelId],
      });

      // Dispatch custom event to notify components that daily data has changed
      window.dispatchEvent(new CustomEvent("dailyDataChanged"));

      // Mostrar toast de éxito
      showSuccessToast("Success", "Expense deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting expense:", error);
      showErrorToast("Error", "Failed to delete expense");
    },
  });
};

// Hook para obtener items generales (sin fecha)
export const useGeneralItems = (travelId: string) => {
  return useQuery({
    queryKey: queryKeys.generalItems(travelId),
    queryFn: async () => {
      const { getGeneralItems } = await import("./generalItemsApi");
      const result = await getGeneralItems(Number(travelId));
      return result;
    },
    enabled: !!travelId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para obtener solo actividades generales
export const useGeneralActivities = (travelId: string) => {
  const { data: generalItems, ...rest } = useGeneralItems(travelId);

  const generalActivities =
    generalItems?.filter((item) => item.type === "activity") || [];

  return {
    data: generalActivities,
    ...rest,
  };
};

// Hook para obtener solo gastos generales
export const useGeneralExpenses = (travelId: string) => {
  const { data: generalItems, ...rest } = useGeneralItems(travelId);

  const generalExpenses =
    generalItems?.filter((item) => item.type === "expense") || [];

  return {
    data: generalExpenses,
    ...rest,
  };
};

// Función para obtener el icono según la categoría
const getCategoryIcon = (category: string): string => {
  const iconMap: Record<string, string> = {
    food: "🍕",
    transportation: "🚗",
    transport: "🚗",
    accommodation: "🛏️",
    shopping: "🛍️",
    sightseeing: "🗺️",
    guided_tours: "👥",
    cultural: "🏛️",
    nature_outdoor: "🌲",
    wellness: "🏥",
    nightlife: "🌙",
    health: "🏥",
    entertainment: "🎬",
    tickets: "🎫",
    other: "💰",
  };
  return iconMap[category] || iconMap.other;
};

// Función para obtener el color según la categoría
const getCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    food: "bg-red-500",
    transportation: "bg-blue-500",
    transport: "bg-blue-500",
    accommodation: "bg-purple-500",
    shopping: "bg-pink-500",
    sightseeing: "bg-orange-500",
    guided_tours: "bg-blue-500",
    cultural: "bg-orange-500",
    nature_outdoor: "bg-green-500",
    wellness: "bg-pink-500",
    nightlife: "bg-purple-500",
    health: "bg-green-500",
    entertainment: "bg-yellow-500",
    tickets: "bg-indigo-500",
    other: "bg-gray-500",
  };
  return colorMap[category] || colorMap.other;
};

// Mutations para actividades generales
export const useCreateGeneralActivity = () => {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToast();

  return useMutation({
    mutationFn: async (
      activityData: Omit<any, "id" | "completed"> & {
        travel_id: string;
      }
    ) => {
      // Para actividades generales, no incluimos fecha
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { date: _, ...activityDataWithoutDate } = activityData;

      const { data, error } = await supabase
        .from("travel_activities")
        .insert([activityDataWithoutDate])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidar la query key correcta que usa useGeneralItems
      queryClient.invalidateQueries({
        queryKey: ["generalItems"],
        exact: false,
      });

      // Invalidar overview para que se actualice
      const travelId = parseInt(data.travel_id);
      queryClient.invalidateQueries({
        queryKey: ["travel", "overview", travelId],
      });

      // Mostrar toast de éxito
      showSuccessToast("Success", "General activity created successfully");
    },
    onError: (error) => {
      console.error("Error creating general activity:", error);
      showErrorToast("Error", "Failed to create general activity");
    },
  });
};

export const useUpdateGeneralActivity = () => {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      travelId,
      ...activityData
    }: { id: string; travelId: string } & Omit<any, "id" | "completed">) => {
      // Para actividades generales, no incluimos fecha
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { date: _, ...activityDataWithoutDate } = activityData;

      const { data, error } = await supabase
        .from("travel_activities")
        .update({
          ...activityDataWithoutDate,
          travel_id: travelId,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidar la query key correcta que usa useGeneralItems
      queryClient.invalidateQueries({
        queryKey: ["generalItems"],
        exact: false,
      });

      // Invalidar overview para que se actualice
      const travelId = parseInt(data.travel_id);
      queryClient.invalidateQueries({
        queryKey: ["travel", "overview", travelId],
      });

      // Mostrar toast de éxito
      showSuccessToast("Success", "General activity updated successfully");
    },
    onError: (error) => {
      console.error("Error updating general activity:", error);
      showErrorToast("Error", "Failed to update general activity");
    },
  });
};

export const useDeleteGeneralActivity = () => {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, travelId }: { id: string; travelId: string }) => {
      const { error } = await supabase
        .from("travel_activities")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, travelId };
    },
    onSuccess: (data) => {
      // Invalidar la query key correcta que usa useGeneralItems
      queryClient.invalidateQueries({
        queryKey: ["generalItems"],
        exact: false,
      });

      // Invalidar overview para que se actualice
      const travelId = parseInt(data.travelId);
      queryClient.invalidateQueries({
        queryKey: ["travel", "overview", travelId],
      });

      // Mostrar toast de éxito
      showSuccessToast("Success", "General activity deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting general activity:", error);
      showErrorToast("Error", "Failed to delete general activity");
    },
  });
};

// Mutations para gastos generales
export const useCreateGeneralExpense = () => {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToast();

  return useMutation({
    mutationFn: async (
      expenseData: Omit<any, "id"> & {
        travel_id: string;
      }
    ) => {
      // Para gastos generales, no incluimos fecha
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { date: _, ...expenseDataWithoutDate } = expenseData;

      const { data, error } = await supabase
        .from("travel_expenses")
        .insert([expenseDataWithoutDate])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidar las queries de items generales usando la query key correcta
      queryClient.invalidateQueries({
        queryKey: ["generalItems"],
        exact: false,
      });

      // Invalidar overview para que se actualice
      const travelId = parseInt(data.travel_id);
      queryClient.invalidateQueries({
        queryKey: ["travel", "overview", travelId],
      });

      // Mostrar toast de éxito
      showSuccessToast("Success", "General expense created successfully");
    },
    onError: (error) => {
      console.error("Error creating general expense:", error);
      showErrorToast("Error", "Failed to create general expense");
    },
  });
};

export const useUpdateGeneralExpense = () => {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      travelId,
      ...expenseData
    }: { id: string; travelId: string } & Omit<any, "id">) => {
      // Para gastos generales, no incluimos fecha
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { date: _, ...expenseDataWithoutDate } = expenseData;

      const { data, error } = await supabase
        .from("travel_expenses")
        .update({
          ...expenseDataWithoutDate,
          travel_id: travelId,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidar las queries de items generales usando la query key correcta
      queryClient.invalidateQueries({
        queryKey: ["generalItems"],
        exact: false,
      });

      // Invalidar overview para que se actualice
      const travelId = parseInt(data.travel_id);
      queryClient.invalidateQueries({
        queryKey: ["travel", "overview", travelId],
      });

      // Mostrar toast de éxito
      showSuccessToast("Success", "General expense updated successfully");
    },
    onError: (error) => {
      console.error("Error updating general expense:", error);
      showErrorToast("Error", "Failed to update general expense");
    },
  });
};

export const useDeleteGeneralExpense = () => {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, travelId }: { id: string; travelId: string }) => {
      const { error } = await supabase
        .from("travel_expenses")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("❌ Error en Supabase:", error);
        throw error;
      }

      return { id, travelId };
    },
    onSuccess: (data) => {
      // Invalidar la query key correcta que usa useGeneralItems
      queryClient.invalidateQueries({
        queryKey: ["generalItems"],
        exact: false,
      });

      // Invalidar overview para que se actualice
      const travelId = parseInt(data.travelId);
      queryClient.invalidateQueries({
        queryKey: ["travel", "overview", travelId],
      });

      // Mostrar toast de éxito
      showSuccessToast("Success", "General expense deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting general expense:", error);
      showErrorToast("Error", "Failed to delete general expense");
    },
  });
};

// Hooks para operaciones de itinerarios con React Query
export const useCreateItinerary = () => {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToast();

  return useMutation({
    mutationFn: createItinerary,
    onSuccess: (data) => {
      console.log(
        "🔍 DEBUG - useCreateItinerary onSuccess ejecutándose con data:",
        data
      );

      // Invalidar todas las queries del viaje usando las query keys correctas
      if (data?.travel_id) {
        const travelId = parseInt(data.travel_id);

        // Invalidar queries específicas del viaje
        queryClient.invalidateQueries({
          queryKey: ["travel", "daily-plan-items", travelId],
        });

        queryClient.invalidateQueries({
          queryKey: ["travel", "overview", travelId],
        });

        queryClient.invalidateQueries({
          queryKey: ["travel", "general-items", travelId],
        });

        queryClient.invalidateQueries({
          queryKey: ["travel", "expenses", travelId],
        });

        // IMPORTANTE: Invalidar TODAS las queries de itinerarios (como en delete)
        queryClient.invalidateQueries({
          queryKey: ["itineraries"], // ← Invalida TODAS las queries de itinerarios
          exact: false, // ← Incluye sub-queries como ["itineraries", "58"]
        });

        // También invalidar la query específica por si acaso
        queryClient.invalidateQueries({
          queryKey: ["itineraries", data.travel_id],
        });

        // Forzar refetch inmediato de itinerarios para actualización instantánea
        queryClient.refetchQueries({
          queryKey: ["itineraries", data.travel_id],
        });
      }

      // REMOVIDO: Evento que causaba ciclo infinito de re-renders
      // window.dispatchEvent(new CustomEvent("dailyDataChanged"));

      // Mostrar toast de éxito
      showSuccessToast("Success", "Itinerary created successfully");
    },
    onError: (error) => {
      console.error("Error creating itinerary:", error);
      showErrorToast("Error", "Failed to create itinerary");
    },
  });
};

export const useUpdateItinerary = () => {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Record<string, unknown>;
    }) => updateItinerary(id, updates),
    onSuccess: (data) => {
      // Invalidar queries específicas del viaje si tenemos el travel_id
      if (data?.travel_id) {
        const travelId = parseInt(data.travel_id);

        // Invalidar queries específicas del viaje
        queryClient.invalidateQueries({
          queryKey: ["travel", "daily-plan-items", travelId],
        });

        queryClient.invalidateQueries({
          queryKey: ["travel", "overview", travelId],
        });

        queryClient.invalidateQueries({
          queryKey: ["travel", "general-items", travelId],
        });

        queryClient.invalidateQueries({
          queryKey: ["travel", "expenses", travelId],
        });

        // Invalidar query específica de itinerarios - usar tanto string como number para compatibilidad
        queryClient.invalidateQueries({
          queryKey: ["itineraries", data.travel_id.toString()],
        });
        
        queryClient.invalidateQueries({
          queryKey: ["itineraries", data.travel_id],
        });
      } else {
        // Fallback: invalidar todas las queries de itinerarios
        queryClient.invalidateQueries({
          queryKey: ["itineraries"],
          exact: false,
        });
      }

      // REMOVIDO: Evento que causaba ciclo infinito
      // window.dispatchEvent(new CustomEvent("dailyDataChanged"));

      // Mostrar toast de success
      showSuccessToast("Success", "Itinerary updated successfully");
    },
    onError: (error) => {
      console.error("Error updating itinerary:", error);
      showErrorToast("Error", "Failed to update itinerary");
    },
  });
};

export const useDeleteItinerary = () => {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToast();

  return useMutation({
    mutationFn: deleteItinerary,
    onSuccess: () => {
      // Intentar obtener el travel_id del itinerario eliminado
      // Como deleteItinerary no retorna datos, usamos variables si es posible
      // Por ahora, invalidamos todas las queries de itinerarios
      queryClient.invalidateQueries({
        queryKey: ["itineraries"],
        exact: false,
      });

      // También invalidar queries generales del viaje
      queryClient.invalidateQueries({
        queryKey: ["travel"],
        exact: false,
      });

      // REMOVIDO: Evento que causaba ciclo infinito
      // window.dispatchEvent(new CustomEvent("dailyDataChanged"));

      // Mostrar toast de success
      showSuccessToast("Success", "Itinerary deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting itinerary:", error);
      showErrorToast("Error", "Failed to delete itinerary");
    },
  });
};

export const useItineraries = (travelId: string) => {
  return useQuery({
    queryKey: ["itineraries", travelId],
    queryFn: () => getItinerariesByTravelId(travelId),
    enabled: !!travelId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hooks para operaciones de Travel con React Query
export const useCreateTravel = () => {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToast();

  return useMutation({
    mutationFn: async (tripData: {
      name: string;
      start_date: string;
      end_date: string;
      budget: number;
      bbox: number[];
      country_codes: Array<Record<string, string>>;
      user_id: string;
    }) => {
      const { data, error } = await supabase
        .from("travels")
        .insert([tripData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidar la query key correcta que usa TravelList
      queryClient.invalidateQueries({ queryKey: ["travel", "all-headers"] });

      // También invalidar las queries relacionadas con travels individuales
      queryClient.invalidateQueries({ queryKey: ["travel"], exact: false });

      // Invalidar queries antiguas para compatibilidad
      queryClient.invalidateQueries({ queryKey: ["optimizedTravelSummaries"] });
      queryClient.invalidateQueries({ queryKey: ["optimizedDailyPlan"] });
      queryClient.invalidateQueries({ queryKey: ["optimizedOverviewData"] });
      queryClient.invalidateQueries({ queryKey: ["dailyPlan"] });
      queryClient.invalidateQueries({ queryKey: ["generalItems"] });

      // Forzar refetch inmediato de la lista de travels
      queryClient.refetchQueries({ queryKey: ["travel", "all-headers"] });

      // Dispatch custom event to notify components that travel data has changed
      window.dispatchEvent(new CustomEvent("travelDataChanged"));

      // Mostrar toast de éxito
      showSuccessToast("Success", "Travel created successfully");
    },
    onError: (error) => {
      console.error("Error creating travel:", error);
      showErrorToast("Error", "Failed to create travel");
    },
  });
};

export const useUpdateTravel = () => {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: {
        name: string;
        start_date: string;
        end_date: string;
        budget: number;
        bbox: number[];
        country_codes: Array<Record<string, string>>;
      };
    }) => {
      const { data, error } = await supabase
        .from("travels")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidar la query key correcta que usa TravelList
      queryClient.invalidateQueries({ queryKey: ["travel", "all-headers"] });

      // También invalidar las queries relacionadas con travels individuales
      queryClient.invalidateQueries({ queryKey: ["travel"], exact: false });

      // Invalidar queries antiguas para compatibilidad
      queryClient.invalidateQueries({ queryKey: ["optimizedTravelSummaries"] });
      queryClient.invalidateQueries({ queryKey: ["optimizedDailyPlan"] });
      queryClient.invalidateQueries({ queryKey: ["optimizedOverviewData"] });

      // Dispatch custom event to notify components that travel data has changed
      window.dispatchEvent(new CustomEvent("travelDataChanged"));

      // Mostrar toast de éxito
      showSuccessToast("Success", "Travel updated successfully");
    },
    onError: (error) => {
      console.error("Error updating travel:", error);
      showErrorToast("Error", "Failed to update travel");
    },
  });
};

export const useDeleteTravel = () => {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToast();

  return useMutation({
    mutationFn: async (tripId: string) => {
      const { error } = await supabase
        .from("travels")
        .delete()
        .eq("id", tripId);

      if (error) throw error;
      return tripId;
    },
    onSuccess: () => {
      // Invalidar la query key correcta que usa TravelList
      queryClient.invalidateQueries({ queryKey: ["travel", "all-headers"] });

      // También invalidar las queries relacionadas con travels individuales
      queryClient.invalidateQueries({ queryKey: ["travel"], exact: false });

      // Invalidar queries antiguas para compatibilidad
      queryClient.invalidateQueries({ queryKey: ["optimizedTravelSummaries"] });

      // Dispatch custom event to notify components that travel data has changed
      window.dispatchEvent(new CustomEvent("travelDataChanged"));

      // Mostrar toast de éxito
      showSuccessToast("Success", "Travel deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting travel:", error);
      showErrorToast("Error", "Failed to delete travel");
    },
  });
};

export const useToggleActivityCompleted = () => {
  const queryClient = useQueryClient();
  const { showErrorToast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      completed,
    }: {
      id: string;
      completed: boolean;
    }) => {
      const { data, error } = await supabase
        .from("travel_activities")
        .update({ is_done: completed })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidar las queries usando las keys correctas
      // Necesitamos invalidar todas las queries de travel para asegurar que se actualicen
      queryClient.invalidateQueries({
        queryKey: ["travel"],
        exact: false,
      });

      // Dispatch custom event with the updated activity data
      window.dispatchEvent(
        new CustomEvent("dailyDataChanged", {
          detail: {
            activityId: variables.id,
            completed: variables.completed,
          },
        })
      );
    },
    onError: (error) => {
      console.error("Error toggling activity completed:", error);
      showErrorToast("Error", "Failed to update activity status");
    },
  });
};
