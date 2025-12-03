import { useQuery } from "@tanstack/react-query";
import { 
  fetchTravelExpenses, 
  fetchTravelAccommodations, 
  fetchExpensesTotal, 
  fetchAccommodationsTotal,
  fetchActivitiesCount
} from "../api/expensesApi";
import { useUserAuthContext } from "../../contexts/useUserAuthContext";

// Hook para obtener gastos (sin accommodations)
export const useTravelExpenses = (travelId: number) => {
  const { userAuthData } = useUserAuthContext();
  
  return useQuery({
    queryKey: ["travel-expenses", travelId],
    queryFn: () => fetchTravelExpenses(travelId, userAuthData?.id || ""),
    enabled: !!travelId && !!userAuthData?.id,
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos en cache
  });
};

// Hook para obtener accommodations
export const useTravelAccommodations = (travelId: number) => {
  const { userAuthData } = useUserAuthContext();
  
  return useQuery({
    queryKey: ["travel-accommodations", travelId],
    queryFn: () => fetchTravelAccommodations(travelId, userAuthData?.id || ""),
    enabled: !!travelId && !!userAuthData?.id,
    staleTime: 2 * 60 * 1000, // 2 minutos (cambian menos frecuentemente)
    gcTime: 5 * 60 * 1000, // 5 minutos en cache
  });
};

// Hook para obtener el total de gastos (sin accommodations)
export const useExpensesTotal = (travelId: number) => {
  const { userAuthData } = useUserAuthContext();
  
  return useQuery({
    queryKey: ["expenses-total", travelId],
    queryFn: () => fetchExpensesTotal(travelId, userAuthData?.id || ""),
    enabled: !!travelId && !!userAuthData?.id,
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos en cache
  });
};

// Hook para obtener el total de accommodations
export const useAccommodationsTotal = (travelId: number) => {
  const { userAuthData } = useUserAuthContext();
  
  return useQuery({
    queryKey: ["accommodations-total", travelId],
    queryFn: () => fetchAccommodationsTotal(travelId, userAuthData?.id || ""),
    enabled: !!travelId && !!userAuthData?.id,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos en cache
  });
};

// Hook para obtener el conteo de actividades
export const useActivitiesCount = (travelId: number) => {
  const { userAuthData } = useUserAuthContext();
  
  return useQuery({
    queryKey: ["activities-count", travelId],
    queryFn: () => fetchActivitiesCount(travelId, userAuthData?.id || ""),
    enabled: !!travelId && !!userAuthData?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos (cambia poco)
    gcTime: 10 * 60 * 1000, // 10 minutos en cache
  });
};

// Hook combinado para obtener todos los datos relacionados con expenses
export const useAllExpensesData = (travelId: number) => {
  const expensesQuery = useTravelExpenses(travelId);
  const accommodationsQuery = useTravelAccommodations(travelId);
  const expensesTotalQuery = useExpensesTotal(travelId);
  const accommodationsTotalQuery = useAccommodationsTotal(travelId);

  // Combinar expenses y accommodations
  const allExpenses = [
    ...(expensesQuery.data || []),
    ...(accommodationsQuery.data || [])
  ];

  // Calcular total combinado
  const totalSpent = (expensesTotalQuery.data || 0) + (accommodationsTotalQuery.data || 0);

  return {
    expenses: expensesQuery.data || [],
    accommodations: accommodationsQuery.data || [],
    allExpenses,
    expensesTotal: expensesTotalQuery.data || 0,
    accommodationsTotal: accommodationsTotalQuery.data || 0,
    totalSpent,
    isLoading: 
      expensesQuery.isLoading || 
      accommodationsQuery.isLoading || 
      expensesTotalQuery.isLoading || 
      accommodationsTotalQuery.isLoading,
    isError: 
      expensesQuery.isError || 
      accommodationsQuery.isError || 
      expensesTotalQuery.isError || 
      accommodationsTotalQuery.isError,
    error: 
      expensesQuery.error || 
      accommodationsQuery.error || 
      expensesTotalQuery.error || 
      accommodationsTotalQuery.error,
    refetch: () => {
      expensesQuery.refetch();
      accommodationsQuery.refetch();
      expensesTotalQuery.refetch();
      accommodationsTotalQuery.refetch();
    }
  };
};
