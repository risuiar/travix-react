import { useQuery } from "@tanstack/react-query";
import {
  fetchTravelHeaderData,
  fetchTravelOverviewData,
  fetchTravelDailyPlanItems,
  fetchTravelGeneralItems,
  fetchAllTravelHeaders,
} from "../api/travelApi";
import { fetchUserProfile } from "../api/userApi";
import { fetchUserAuthData } from "../api/authApi";

// Query keys para React Query
// Hook para obtener el usuario actual directamente del endpoint de auth
import { supabase } from "../../supabaseClient";

export const fetchSupabaseUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error fetching Supabase user:", error);
    return null;
  }
  return data.user;
};

export const useSupabaseUser = () => {
  return useQuery({
    queryKey: ["user", "auth"],
    queryFn: fetchSupabaseUser,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
export const travelQueryKeys = {
  header: (travelId: number) => ["travel", "header", travelId],
  overview: (travelId: number) => ["travel", "overview", travelId],
  dailyPlanItems: (travelId: number) => [
    "travel",
    "daily-plan-items",
    travelId,
  ],
  generalItems: (travelId: number) => ["travel", "general-items", travelId],
  allHeaders: () => ["travel", "all-headers"],
  userProfile: () => ["user", "profile"],
  userAuthData: () => ["user", "auth-data"],
};

// Hook para obtener el perfil del usuario autenticado
export const useUserProfile = () => {
  return useQuery({
    queryKey: travelQueryKeys.userProfile(),
    queryFn: fetchUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutos - perfil cambia poco
    gcTime: 10 * 60 * 1000, // 10 minutos en cache
  });
};

// Hook para obtener datos completos del usuario autenticado
export const useUserAuthData = () => {
  return useQuery({
    queryKey: travelQueryKeys.userAuthData(),
    queryFn: fetchUserAuthData,
    staleTime: 10 * 60 * 1000, // 10 minutos - datos de auth cambian muy poco
    gcTime: 30 * 60 * 1000, // 30 minutos en cache
    refetchOnWindowFocus: false, // No refetch al enfocar la ventana
    refetchOnMount: false, // No refetch al montar si ya tenemos datos
  });
};

// Hook para obtener datos del header de un viaje
export const useTravelHeader = (travelId: number) => {
  return useQuery({
    queryKey: travelQueryKeys.header(travelId),
    queryFn: () => fetchTravelHeaderData(travelId),
    enabled: !!travelId,
    staleTime: 2 * 60 * 1000, // 2 minutos - datos del header cambian poco
    gcTime: 5 * 60 * 1000, // 5 minutos en cache
  });
};

// Hook para obtener datos del overview de un viaje
export const useTravelOverview = (travelId: number) => {
  return useQuery({
    queryKey: travelQueryKeys.overview(travelId),
    queryFn: () => fetchTravelOverviewData(travelId),
    enabled: !!travelId,
    staleTime: 5 * 60 * 1000, // 5 minutos - overview puede cambiar más
    gcTime: 10 * 60 * 1000, // 10 minutos en cache
  });
};

// Hook para obtener datos del daily plan items de un viaje
export const useTravelDailyPlanItems = (travelId: number) => {
  return useQuery({
    queryKey: travelQueryKeys.dailyPlanItems(travelId),
    queryFn: () => fetchTravelDailyPlanItems(travelId),
    enabled: !!travelId,
    staleTime: 1 * 60 * 1000, // 1 minuto - items diarios cambian frecuentemente
    gcTime: 5 * 60 * 1000, // 5 minutos en cache
    // Evitar refetches automáticos que disparan múltiples llamadas
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

// Hook para obtener datos de general items de un viaje
export const useTravelGeneralItems = (travelId: number) => {
  return useQuery({
    queryKey: travelQueryKeys.generalItems(travelId),
    queryFn: () => fetchTravelGeneralItems(travelId),
    enabled: !!travelId,
    staleTime: 2 * 60 * 1000, // 2 minutos - items generales cambian poco
    gcTime: 5 * 60 * 1000, // 5 minutos en cache
  });
};

// Hook para obtener todos los headers de viajes del usuario
export const useAllTravelHeaders = () => {
  return useQuery({
    queryKey: travelQueryKeys.allHeaders(),
    queryFn: fetchAllTravelHeaders,
    staleTime: 1 * 60 * 1000, // 1 minuto - lista de viajes cambia frecuentemente
    gcTime: 5 * 60 * 1000, // 5 minutos en cache
  });
};

// Hook combinado para obtener header y overview juntos
export const useTravelData = (travelId: number) => {
  const headerQuery = useTravelHeader(travelId);
  const overviewQuery = useTravelOverview(travelId);

  return {
    header: headerQuery.data,
    overview: overviewQuery.data,
    isLoading: headerQuery.isLoading || overviewQuery.isLoading,
    isError: headerQuery.isError || overviewQuery.isError,
    error: headerQuery.error || overviewQuery.error,
    refetch: () => {
      headerQuery.refetch();
      overviewQuery.refetch();
    },
  };
};


