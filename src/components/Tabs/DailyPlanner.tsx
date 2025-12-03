import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Travel,
  Activity,
  Expense,
  TravelItinerary,
  ExpenseCategory,
} from "../../types";
import { useTranslation } from "react-i18next";
import { Plus, Calendar, DollarSign } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import MainTravelCard from "../MainTravelCard";

import { useUserAuthContext } from "../../contexts/useUserAuthContext";
import { useCurrency } from "../../hooks/useCurrency";
import { formatCurrency } from "../../utils/currency";
import { supabase } from "../../supabaseClient";
import { useCreateItinerary } from "../../utils/queries";
import { Card } from "../Card";
import { AdBannerResponsive } from "../AdBannerResponsive";
import { DailyPlannerSkeleton } from "../Skeleton";
import {
  useTravelDailyPlanItems,
  useTravelOverview,
} from "../../utils/hooks/useTravelQueries";

import {
  useDeleteActivity,
  useDeleteExpense,
  useCreateExpense,
  useUpdateExpense,
  useCreateActivity,
  useUpdateActivity,
  useGeneralItems,
  useCreateGeneralActivity,
  useUpdateGeneralActivity,
  useDeleteGeneralActivity,
  useCreateGeneralExpense,
  useUpdateGeneralExpense,
  useDeleteGeneralExpense,
  useItineraries,
  useUpdateItinerary,
} from "../../utils/queries";
import { ItineraryGroups } from "../ItineraryGroups";
import { ActivityModal } from "../Modal/ActivityModal";
import { ExpenseModal } from "../Modal/ExpenseModal";
import { AccommodationExpenseModal } from "../Modal/AccommodationExpenseModal";
import type { AccommodationExpense } from "../Modal/AccommodationExpenseModal";
import ItineraryModal from "../Modal/ItineraryModal";
import ActivitiesIAModal from "../Modal/ActivitiesIAModal";

import {
  getDayUrl,
  getItineraryUrl,
  getDayItineraryUrl,
  getDailyPlannerUrl,
} from "../../utils/navigation";
import { formatDateForForm, parseDateString } from "../../utils/dateUtils";
import { useConfirm } from "../../hooks/useConfirm";
import { ModalConfirm } from "../Modal/ModalConfirm";

interface DailyPlannerProps {
  selectedDate?: string;
  selectedItinerary?: string;
  travel: Travel;
  onBack: () => void;
  onEditTrip: () => void;
}

export const DailyPlanner: React.FC<DailyPlannerProps> = ({
  selectedDate: urlSelectedDate,
  selectedItinerary: urlSelectedItinerary,
  travel,
  onBack,
  onEditTrip,
}) => {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showEditExpense, setShowEditExpense] = useState(false);
  const [showAccommodationExpenseModal, setShowAccommodationExpenseModal] =
    useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showItineraryModal, setShowItineraryModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editingGeneralExpense, setEditingGeneralExpense] =
    useState<Expense | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isGeneralExpenseModal, setIsGeneralExpenseModal] = useState(false);
  const [isGeneralActivityModal, setIsGeneralActivityModal] = useState(false);
  const [isSubmittingItinerary, setIsSubmittingItinerary] = useState(false);
  const [editingItinerary, setEditingItinerary] = useState<string | null>(null);
  const [editingItineraryData, setEditingItineraryData] =
    useState<TravelItinerary | null>(null);

  // AI Modal state
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedItineraryForAI, setSelectedItineraryForAI] = useState<
    string | null
  >(null);

  const [selectedItineraryDates, setSelectedItineraryDates] = useState<{
    fromDate?: string;
    toDate?: string;
  }>({});

  const [aiSelectedDate, setAiSelectedDate] = useState<string | null>(null);
  const [selectedItineraryId, setSelectedItineraryId] = useState<string | null>(
    null
  );
  const suppressNextUrlScrollRef = useRef(false);

  const { t } = useTranslation();
  const navigate = useNavigate();

  // Get data from context
  // Usar nuevos hooks para obtener datos
  const { data: dailyPlanData } = useTravelDailyPlanItems(parseInt(travel.id));

  const { data: overviewData } = useTravelOverview(parseInt(travel.id));

  // Extraer datos del daily plan y mapear a la estructura esperada
  const rawDailyPlan = dailyPlanData?.daily_items || [];

  // SOLUCIÓN TEMPORAL: Limpiar duplicados por source_id en cada día
  const cleanedRawDailyPlan = rawDailyPlan.map((day) => ({
    ...day,
    items: day.items.filter(
      (item, index, array) =>
        array.findIndex((i) => i.source_id === item.source_id) === index
    ),
  }));

  // Usar los datos limpios en lugar de los originales
  const finalRawDailyPlan = cleanedRawDailyPlan;

  const totalSpent = overviewData?.total_spent || 0;
  const countActivities = overviewData?.total_activities || 0;

  const { userAuthData } = useUserAuthContext();
  const { userCurrency } = useCurrency();

  // Use React Query for general items
  const {
    data: generalItems = [],
    isLoading: loadingGeneralItems,
  } = useGeneralItems(travel.id);

  // Use React Query for itineraries
  const {
    data: itineraries = [],
  } = useItineraries(travel.id);

  // Función para generar todos los días del viaje
  const generateAllTravelDays = (): string[] => {
    const days: string[] = [];
    const startDate = parseDateString(travel.start_date);
    const endDate = parseDateString(travel.end_date);

    // Generar todos los días desde start_date hasta end_date usando UTC
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      days.push(formatDateForForm(currentDate));
      // Incrementar día en UTC
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return days;
  };

  // Función para determinar qué itinerario corresponde a una fecha específica
  const getItineraryForDate = (date: string): string | null => {
    // Buscar en los itinerarios disponibles
    for (const itinerary of itineraries) {
      const startDate = parseDateString(itinerary.start_date);
      const endDate = parseDateString(itinerary.end_date);
      const currentDate = parseDateString(date);

      // Verificar si la fecha está dentro del rango del itinerario
      if (currentDate >= startDate && currentDate <= endDate) {
        // Mostrar el itinerario siempre que esté dentro del rango
        // No solo cuando hay actividades o gastos
        return itinerary.name;
      }
    }

    return null;
  };

  // Function to get itinerary coordinates
  const getItineraryCoordinates = (
    itineraryName: string
  ): { lat: number; lng: number } => {
    // Buscar en los itinerarios cargados desde la base de datos
    const itinerary = itineraries.find(
      (itinerary) => itinerary.name === itineraryName
    );
    if (itinerary?.lat && itinerary?.lng) {
      return { lat: itinerary.lat, lng: itinerary.lng };
    }

    // Si no hay coordenadas, retornar coordenadas por defecto del Garda
    // en lugar de (0,0) que está en el mar
    return { lat: 45.6983, lng: 10.7167 };
  };

  // Función para obtener datos de un día específico
  const getDayData = (date: string) => {
    const dayData = rawDailyPlan.find((day) => day.date === date);
    if (dayData) {
      // Calcular el costo total incluyendo tanto gastos como costos de actividades
      const totalCost = dayData.items.reduce((sum, item) => {
        const itemCost = item.cost || 0;
        return sum + itemCost;
      }, 0);

      return {
        activities_count: dayData.items.filter(
          (item) => item.type === "activity"
        ).length,
        expenses_count: dayData.items.filter((item) => item.type === "expense")
          .length,
        total_spent: totalCost, // ← Ahora incluye TODOS los costos (gastos + actividades)
      };
    }
    return {
      activities_count: 0,
      expenses_count: 0,
      total_spent: 0,
    };
  };

  // Generar todos los días del viaje y mapearlos
  const allTravelDays = generateAllTravelDays();

  const dailyPlan = allTravelDays.map((date) => {
    const itineraryName = getItineraryForDate(date);
    const dayData = getDayData(date);

    return {
      day: date,
      date: date,
      city_id: null,
      name: itineraryName, // null para días sin itinerario
      notes: null,
      activities_count: dayData.activities_count,
      expenses_count: dayData.expenses_count,
      total_spent: dayData.total_spent,
      bbox: undefined,
      lat: itineraryName
        ? getItineraryCoordinates(itineraryName).lat
        : undefined,
      lng: itineraryName
        ? getItineraryCoordinates(itineraryName).lng
        : undefined,
    };
  });

  // Use React Query mutations
  const deleteActivityMutation = useDeleteActivity();
  const deleteExpenseMutation = useDeleteExpense();
  const createExpenseMutation = useCreateExpense();
  const createActivityMutation = useCreateActivity();
  const updateActivityMutation = useUpdateActivity();
  const updateExpenseMutation = useUpdateExpense();
  const createGeneralActivityMutation = useCreateGeneralActivity();
  const updateGeneralActivityMutation = useUpdateGeneralActivity();
  const deleteGeneralActivityMutation = useDeleteGeneralActivity();
  const createGeneralExpenseMutation = useCreateGeneralExpense();
  const updateGeneralExpenseMutation = useUpdateGeneralExpense();
  const deleteGeneralExpenseMutation = useDeleteGeneralExpense();
  const createItineraryMutation = useCreateItinerary();
  const updateItineraryMutation = useUpdateItinerary();
  const queryClient = useQueryClient();

  // Use confirm hook
  const { confirmState, confirmDelete } = useConfirm();

  // Función optimizada para refrescar datos usando React Query
  // REMOVIDO: Función no utilizada que causaba warnings de lint
  // const refreshData = useCallback(() => {
  //   // Invalidar todas las queries relacionadas con este viaje usando las keys correctas
  //   queryClient.invalidateQueries({
  //     queryKey: ["travel", "daily-plan-items", parseInt(travel.id)],
  //   });
  //   queryClient.invalidateQueries({
  //     queryKey: ["travel", "overview", parseInt(travel.id)],
  //   });
  //   queryClient.invalidateQueries({
  //     queryKey: ["travel", "general-items", parseInt(travel.id)],
  //   });
  //   queryClient.invalidateQueries({
  //     queryKey: ["travel", "expenses", parseInt(travel.id)],
  //   });

  //   // También invalidar la query general del viaje por si acaso
  //   queryClient.invalidateQueries({
  //     queryKey: ["travel", parseInt(travel.id)],
  //     exact: false,
  //   });
  // }, [queryClient, travel.id]);

  // Function to get itinerary_id based on selected date
  const getItineraryIdForDate = useCallback((date: string): string | undefined => {
    // Buscar en los itinerarios disponibles
    const dayPlan = dailyPlan.find((day) => day.date === date);
    if (dayPlan?.name) {
      const itinerary = itineraries.find((it) => it.name === dayPlan.name);
      return itinerary?.id;
    }
    return undefined;
  }, [dailyPlan, itineraries]);

  // Helper: get itinerary name by id
  const getItineraryNameById = (
    id: string | null | undefined
  ): string | null => {
    if (!id) return null;
    const it = itineraries.find((i) => String(i.id) === String(id));
    return it?.name || null;
  };

  // Function to get itinerary name for a specific date
  const getItineraryNameForDate = (date: string): string | undefined => {
    const dayPlan = dailyPlan.find((day) => day.date === date);
    return dayPlan?.name || undefined;
  };

  // Listen for travel data changes to refresh daily plan
  // REMOVIDO: useEffect que causaba re-renders infinitos
  // useEffect(() => {
  //   const handleTravelDataChanged = () => {
  //     refreshData();
  //   };

  //   window.addEventListener("travelDataChanged", handleTravelDataChanged);
  //   return () => {
  //     window.removeEventListener("travelDataChanged", handleTravelDataChanged);
  //   };
  // }, [refreshData]);

  // REMOVIDO: useEffect que escuchaba dailyDataChanged causando ciclo infinito
  // useEffect(() => {
  //   const handleDailyDataChanged = () => {
  //     refreshData();
  //   };
  //   window.addEventListener("dailyDataChanged", handleDailyDataChanged);
  //   return () => {
  //     window.removeEventListener("dailyDataChanged", handleDailyDataChanged);
  //   };
  // }, [refreshData]);

  // Listen for trip day data changes to refresh daily plan
  // REMOVIDO: useEffect que causaba re-renders infinitos
  // useEffect(() => {
  //   const handleTripDayDataChanged = (event: CustomEvent) => {
  //     if (event.detail?.date) {
  //       // Invalidar cache para la fecha específica
  //       invalidateDateCache(event.detail.date);
  //       // Refrescar datos
  //       refreshData();
  //     }
  //   };
  //   window.addEventListener(
  //     "tripDayDataChanged",
  //     handleTripDayDataChanged as EventListener
  //   );
  //   return () => {
  //     window.removeEventListener(
  //       "tripDayDataChanged",
  //       handleTripDayDataChanged as EventListener
  //     );
  //   };
  // }, [refreshData, invalidateDateCache]);

  // Manejar parámetros de la URL
  useEffect(() => {
    if (urlSelectedDate) {
      setSelectedDate(urlSelectedDate);
    }
  }, [urlSelectedDate]);

  useEffect(() => {
    if (urlSelectedItinerary) {
      setSelectedItineraryId(urlSelectedItinerary);
    }
  }, [urlSelectedItinerary]);

  // Navegar cuando cambie selectedDate
  useEffect(() => {
    if (selectedDate && selectedDate !== urlSelectedDate) {
      // Evitar el scroll automático en el efecto de URL para navegaciones internas
      suppressNextUrlScrollRef.current = true;
      const url = selectedItineraryId
        ? getDayItineraryUrl(travel.id, selectedDate, selectedItineraryId)
        : getDayUrl(travel.id, selectedDate);
      navigate(url);
    }
  }, [selectedDate, selectedItineraryId, navigate, travel.id, urlSelectedDate]);

  // Scroll hacia arriba solo cuando se selecciona una fecha desde la URL
  useEffect(() => {
    if (urlSelectedDate) {
      if (suppressNextUrlScrollRef.current) {
        // Consumir la supresión para esta navegación interna
        suppressNextUrlScrollRef.current = false;
        return;
      }
      // Delay más corto para que sea más inmediato
      setTimeout(() => {
        // Hacer scroll hacia arriba para que aparezca el card del día
        try {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });

          // También intentar scroll al elemento específico del día
          setTimeout(() => {
            const dayElement = document.querySelector(
              `[data-date="${urlSelectedDate}"]`
            );
            if (dayElement) {
              dayElement.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }, 50); // Delay muy corto para que sea casi inmediato
        } catch {
          window.scrollTo(0, 0);
        }
      }, 100); // Delay muy corto para que sea casi inmediato
    }
  }, [urlSelectedDate]);

  // Handlers for editing activities and expenses from days
  const handleEditDayActivity = (activityId: string, item?: any) => {
    // Si tenemos el item completo, usarlo directamente
    if (item) {
      // Convertir DailyPlanItem a Activity
      const activity: Activity = {
        id: item.source_id,
        title: item.title,
        description: item.description,
        date: item.date,
        time: item.time || "",
        cost: item.cost,
        category: item.category as ExpenseCategory,
        priority: (item.priority as "high" | "medium" | "low") || "medium",
        completed: item.is_done,
        location: item.location,
        place_id: item.place_id || undefined,
        rating: item.rating || undefined,
        reviews_count: item.reviews_count || undefined,
        address: item.address || undefined,
        google_category: item.google_category || undefined,
        itinerary_id: item.itinerary_id?.toString(),
      };
      setEditingActivity(activity);
      setShowActivityModal(true);
      setIsGeneralActivityModal(false);
      return;
    }

    // Fallback: buscar la actividad en los datos del daily plan
    for (const day of finalRawDailyPlan) {
      const activityItem = day.items.find(
        (item) => item.source_id === activityId && item.type === "activity"
      );
      if (activityItem) {
        // Convertir DailyPlanItem a Activity
        const activity: Activity = {
          id: activityItem.source_id,
          title: activityItem.title,
          description: activityItem.description,
          date: day.date,
          time: activityItem.time || "",
          cost: activityItem.cost,
          category: activityItem.category as ExpenseCategory,
          priority:
            (activityItem.priority as "high" | "medium" | "low") || "medium",
          completed: activityItem.is_done,
          location: activityItem.location,
          place_id: activityItem.place_id || undefined,
          rating: activityItem.rating || undefined,
          reviews_count: activityItem.reviews_count || undefined,
          address: activityItem.address || undefined,
          google_category: activityItem.google_category || undefined,
          itinerary_id: activityItem.itinerary_id?.toString(),
        };
        setEditingActivity(activity);
        setShowActivityModal(true);
        setIsGeneralActivityModal(false);
        return;
      }
    }
  };

  const handleEditDayExpense = (expenseId: string, item?: any) => {
    // Si tenemos el item completo, usarlo directamente
    if (item) {
      // Verificar si es un gasto de alojamiento
      if (item.category === "accommodation") {
        // Para alojamientos, necesitamos obtener los datos reales de la base de datos
        // porque item.date es solo el día donde aparece, no el rango real
        const fetchAccommodationData = async () => {
          try {
            const { data: expenseData, error } = await supabase
              .from("travel_expenses")
              .select("*")
              .eq("id", item.source_id)
              .eq("category", "accommodation")
              .single();

            if (error) {
              console.error("Error fetching accommodation data:", error);
              return;
            }

            if (expenseData) {
              const accommodationExpense = {
                id: expenseData.id.toString(),
                title: expenseData.title,
                cost: expenseData.cost,
                currency: expenseData.currency || "EUR",
                category: "accommodation" as ExpenseCategory,
                start_date: expenseData.start_date,
                end_date: expenseData.end_date,
                location: expenseData.location,
                notes: expenseData.notes,
                lat: expenseData.lat,
                lng: expenseData.lng,
                place_id: expenseData.place_id,
                address: expenseData.address,
                google_category: expenseData.google_category,
                rating: expenseData.rating,
                reviews_count: expenseData.reviews_count,
                itinerary_id: expenseData.itinerary_id?.toString(),
                travel_id: expenseData.travel_id?.toString(),
                user_id: expenseData.user_id,
                lodging_type: expenseData.lodging_type || "hotel",
              };

              setEditingExpense(accommodationExpense as any);
              setShowAccommodationExpenseModal(true);
            }
          } catch (error) {
            console.error("Error in fetchAccommodationData:", error);
          }
        };

        fetchAccommodationData();
        return;
      }

      // Para gastos que no son de alojamiento, usar el modal general
      const expense: Expense = {
        id: item.source_id,
        title: item.title,
        cost: item.cost,
        currency: "EUR",
        category: item.category as ExpenseCategory,
        date: item.date,
        location: item.location,
        notes: item.description,
        place_id: item.place_id || undefined,
        address: item.address || undefined,
        google_category: item.google_category || undefined,
        itinerary_id: item.itinerary_id?.toString(),
      };
      setEditingExpense(expense);
      setShowEditExpense(true);
      return;
    }

    // Fallback: buscar el gasto en los datos del daily plan
    for (const day of finalRawDailyPlan) {
      const expenseItem = day.items.find(
        (item) => item.source_id === expenseId && item.type === "expense"
      );
      if (expenseItem) {
        // Verificar si es un gasto de alojamiento
        if (expenseItem.category === "accommodation") {
          // Para alojamientos, necesitamos obtener los datos reales de la base de datos
          const fetchAccommodationData = async () => {
            try {
              const { data: expenseData, error } = await supabase
                .from("travel_expenses")
                .select("*")
                .eq("id", expenseItem.source_id)
                .eq("category", "accommodation")
                .single();

              if (error) {
                console.error("Error fetching accommodation data:", error);
                return;
              }

              if (expenseData) {
                const accommodationExpense = {
                  id: expenseData.id.toString(),
                  title: expenseData.title,
                  cost: expenseData.cost,
                  currency: expenseData.currency || "EUR",
                  category: "accommodation" as ExpenseCategory,
                  start_date: expenseData.start_date,
                  end_date: expenseData.end_date,
                  location: expenseData.location,
                  notes: expenseData.notes,
                  lat: expenseData.lat,
                  lng: expenseData.lng,
                  place_id: expenseData.place_id,
                  address: expenseData.address,
                  google_category: expenseData.google_category,
                  rating: expenseData.rating,
                  reviews_count: expenseData.reviews_count,
                  itinerary_id: expenseData.itinerary_id?.toString(),
                  travel_id: expenseData.travel_id?.toString(),
                  user_id: expenseData.user_id,
                  lodging_type: expenseData.lodging_type || "hotel",
                };

                setEditingExpense(accommodationExpense as any);
                setShowAccommodationExpenseModal(true);
              }
            } catch (error) {
              console.error("Error in fetchAccommodationData:", error);
            }
          };

          fetchAccommodationData();
          return;
        }

        // Para gastos que no son de alojamiento, usar el modal general
        const expense: Expense = {
          id: expenseItem.source_id,
          title: expenseItem.title,
          cost: expenseItem.cost,
          currency: "EUR",
          category: expenseItem.category as ExpenseCategory,
          date: day.date,
          location: expenseItem.location,
          notes: expenseItem.description,
          place_id: expenseItem.place_id || undefined,
          address: expenseItem.address || undefined,
          google_category: expenseItem.google_category || undefined,
          itinerary_id: expenseItem.itinerary_id?.toString(),
        };
        setEditingExpense(expense);
        setShowEditExpense(true);
        return;
      }
    }
  };

  // Activity operations are now handled directly in the modal submit handlers

  const handleActivityModalSubmit = async (
    activityData: Omit<Activity, "id" | "completed">,
    isEdit: boolean
  ) => {
    try {
      if (isEdit && editingActivity) {
        if (isGeneralActivityModal) {
          await updateGeneralActivityMutation.mutateAsync({
            id: editingActivity.id,
            travelId: travel.id,
            ...activityData,
          });
        } else {
          await updateActivityMutation.mutateAsync({
            id: editingActivity.id,
            travelId: travel.id,
            ...activityData,
          });
        }
      } else {
        if (isGeneralActivityModal) {
          await createGeneralActivityMutation.mutateAsync({
            ...activityData,
            travel_id: travel.id,
          });
        } else {
          // Get itinerary_id for the selected date
          const itineraryId = selectedDate
            ? getItineraryIdForDate(selectedDate)
            : undefined;

          await createActivityMutation.mutateAsync({
            ...activityData,
            travel_id: travel.id,
            user_id: userAuthData?.id || "",
            itinerary_id: itineraryId,
          });
        }
      }

      // Invalidar cache usando las query keys correctas
      queryClient.invalidateQueries({
        queryKey: ["travel", "daily-plan-items", parseInt(travel.id)],
      });
      queryClient.invalidateQueries({
        queryKey: ["travel", "overview", parseInt(travel.id)],
      });
      queryClient.invalidateQueries({
        queryKey: ["travel", "general-items", parseInt(travel.id)],
      });
      queryClient.invalidateQueries({
        queryKey: ["travel", "expenses", parseInt(travel.id)],
      });

      // REMOVIDO: Evento que causaba ciclo infinito
      // window.dispatchEvent(new CustomEvent("dailyDataChanged"));

      setEditingActivity(null);
      setShowActivityModal(false);
    } catch (error) {
      console.error("Error saving activity:", error);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      if (isGeneralActivityModal) {
        await deleteGeneralActivityMutation.mutateAsync({
          id: activityId,
          travelId: travel.id,
        });
      } else {
        await deleteActivityMutation.mutateAsync({
          id: activityId,
          travelId: travel.id,
          date: selectedDate || "",
        });
      }

      // Invalidar cache usando las query keys correctas
      queryClient.invalidateQueries({
        queryKey: ["travel", "daily-plan-items", parseInt(travel.id)],
      });
      queryClient.invalidateQueries({
        queryKey: ["travel", "overview", parseInt(travel.id)],
      });
      queryClient.invalidateQueries({
        queryKey: ["travel", "general-items", parseInt(travel.id)],
      });
      queryClient.invalidateQueries({
        queryKey: ["travel", "expenses", parseInt(travel.id)],
      });

      // REMOVIDO: Evento que causaba ciclo infinito
      // window.dispatchEvent(new CustomEvent("dailyDataChanged"));

      setEditingActivity(null);
      setShowActivityModal(false);
    } catch (error) {
      console.error("Error deleting activity:", error);
    }
  };

  const handleDeleteExpense = useCallback(
    async (expenseId: string) => {
      try {
        await deleteExpenseMutation.mutateAsync({
          id: expenseId,
          travelId: travel.id,
        });
        // La invalidación de cache ya se maneja en useDeleteExpense
        // No es necesario invalidar manualmente aquí
      } catch (error) {
        console.error("Error deleting expense:", error);
      }
    },
    [deleteExpenseMutation, travel.id]
  );

  // Handler for add/edit expense
  const handleExpenseModalSubmit = useCallback(
    async (expenseData: Omit<Expense, "id"> | Expense) => {
      try {
        if (editingGeneralExpense || editingExpense) {
          // Edit mode - update expense using React Query mutation
          const expenseToEdit = editingGeneralExpense || editingExpense;
          if (expenseToEdit) {
            if (isGeneralExpenseModal) {
              await updateGeneralExpenseMutation.mutateAsync({
                id: expenseToEdit.id,
                travelId: travel.id,
                ...expenseData,
              });
            } else {
              await updateExpenseMutation.mutateAsync({
                id: expenseToEdit.id,
                travelId: travel.id,
                ...expenseData,
              });
            }
          }
        } else {
          // Add mode - insert expense using React Query mutation
          if (isGeneralExpenseModal) {
            await createGeneralExpenseMutation.mutateAsync({
              ...expenseData,
              travel_id: travel.id,
            });
          } else {
            // Get itinerary_id for the selected date
            const itineraryId = selectedDate
              ? getItineraryIdForDate(selectedDate)
              : undefined;

            await createExpenseMutation.mutateAsync({
              ...expenseData,
              travel_id: travel.id,
              user_id: userAuthData?.id || "",
              itinerary_id: itineraryId,
            });
          }
        }

        // REMOVIDO: Evento que causaba ciclo infinito
        // window.dispatchEvent(new CustomEvent("dailyDataChanged"));

        setShowAddExpense(false);
        setShowEditExpense(false);
        setEditingGeneralExpense(null);
        setEditingExpense(null);
      } catch (error) {
        console.error("❌ Error saving expense:", error);
      }
    },
    [
      editingGeneralExpense,
      editingExpense,
      isGeneralExpenseModal,
      travel.id,
      selectedDate,
      userAuthData?.id,
      updateGeneralExpenseMutation,
      updateExpenseMutation,
      createGeneralExpenseMutation,
      createExpenseMutation,
      getItineraryIdForDate,
    ]
  );

  // Handler for accommodation expense modal submit
  const handleAccommodationExpenseModalSubmit = useCallback(
    async (
      expenseData: Omit<AccommodationExpense, "id"> | AccommodationExpense
    ) => {
      try {
        // Check if this is an edit operation
        const isEditing = "id" in expenseData && expenseData.id;
        const expenseId = isEditing ? expenseData.id : undefined;

        // Use the itinerary_id from the accommodation expense, or get it from selected date if not available
        const finalItineraryId =
          expenseData.itinerary_id ||
          (selectedDate ? getItineraryIdForDate(selectedDate) : undefined);

        // Save accommodation expense directly to database with start_date and end_date
        const accommodationExpenseData = {
          title: expenseData.title,
          cost: expenseData.cost,
          currency: expenseData.currency,
          start_date: expenseData.start_date,
          end_date: expenseData.end_date,
          category: "accommodation", // Keep accommodation category for proper display
          location: expenseData.location,
          notes: expenseData.notes,
          lat: expenseData.lat,
          lng: expenseData.lng,
          place_id: expenseData.place_id,
          address: expenseData.address,
          google_category: expenseData.google_category,
          rating: expenseData.rating,
          reviews_count: expenseData.reviews_count,
          itinerary_id: finalItineraryId,
          travel_id: travel.id,
          user_id: userAuthData?.id || "",
        };

        let error;

        if (isEditing && expenseId) {
          const { error: updateError } = await supabase
            .from("travel_expenses")
            .update(accommodationExpenseData)
            .eq("id", expenseId)
            .select()
            .single();

          error = updateError;
        } else {
          const { error: insertError } = await supabase
            .from("travel_expenses")
            .insert([accommodationExpenseData])
            .select()
            .single();

          error = insertError;
        }

        if (error) {
          console.error("❌ Error saving accommodation expense:", error);
          throw error;
        }

        // REMOVIDO: Evento que causaba ciclo infinito
        // window.dispatchEvent(new CustomEvent("dailyDataChanged"));

        setShowAccommodationExpenseModal(false);
        setEditingExpense(null);
      } catch (error) {
        console.error("Error submitting accommodation expense:", error);
      }
    },
    [
      selectedDate,
      travel.id,
      userAuthData?.id,
      getItineraryIdForDate,
    ]
  );

  const handleAddItinerarySubmit = async (
    itinerary: Omit<TravelItinerary, "id" | "created_at">
  ) => {
    setIsSubmittingItinerary(true);
    try {
      await createItineraryMutation.mutateAsync(itinerary);
      setShowItineraryModal(false);
      setEditingItinerary(null);

      // La invalidación de cache ya se maneja en useCreateItinerary
      // No es necesario invalidar manualmente aquí
    } catch (error) {
      console.error("Error saving itinerary:", error);
    } finally {
      setIsSubmittingItinerary(false);
    }
  };

  const handleEditItinerary = async (itineraryName: string) => {
    setEditingItinerary(itineraryName);
    setEditingItineraryData(null);
    setShowItineraryModal(true);

    // Only fetch itinerary data if we don't already have it
    if (!editingItineraryData || editingItineraryData.name !== itineraryName) {
      try {
        const { data: itineraries, error } = await supabase
          .from("travel_itineraries")
          .select("*")
          .eq("travel_id", travel.id)
          .eq("name", itineraryName)
          .limit(1);

        if (error) {
          console.error("Error fetching itinerary data:", error);
          return;
        }

        if (itineraries && itineraries.length > 0) {
          setEditingItineraryData(itineraries[0]);
        }
      } catch (error) {
        console.error("Error fetching itinerary data:", error);
      }
    }
  };

  const handleUpdateItinerary = async (formData: {
    start_date: string;
    end_date: string;
    notes: string;
    lat?: number;
    lng?: number;
    place_id?: string;
    bbox?: number[];
  }) => {
    if (!editingItineraryData) return;

    setIsSubmittingItinerary(true);
    try {
      await updateItineraryMutation.mutateAsync({
        id: editingItineraryData.id?.toString() || "",
        updates: {
          start_date: formData.start_date,
          end_date: formData.end_date,
          notes: formData.notes || "",
          lat: formData.lat,
          lng: formData.lng,
          place_id: formData.place_id,
          bbox: formData.bbox,
        },
      });

      // Invalidar manualmente las queries para asegurar actualización inmediata
      queryClient.invalidateQueries({
        queryKey: ["itineraries", travel.id],
      });
      
      queryClient.invalidateQueries({
        queryKey: ["travel", "daily-plan-items", parseInt(travel.id)],
      });

      setShowItineraryModal(false);
      setEditingItinerary(null);
      setEditingItineraryData(null);
    } catch (error) {
      console.error("Error updating itinerary:", error);
    } finally {
      setIsSubmittingItinerary(false);
    }
  };

  // Función auxiliar para establecer las fechas del itinerario
  const setItineraryDatesForDate = (date: string) => {
    const itineraryName = getItineraryNameForDate(date);
    if (itineraryName) {
      const itinerary = itineraries.find((it) => it.name === itineraryName);
      if (itinerary) {
        setSelectedItineraryDates({
          fromDate: itinerary.start_date,
          toDate: itinerary.end_date,
        });
      }
    }
  };

  // Función auxiliar para limpiar las fechas del itinerario
  const clearItineraryDates = () => {
    setSelectedItineraryDates({});
  };

  // AI Modal handlers
  const handleOpenAIModalFromDay = (date: string) => {
    const itineraryName = getItineraryNameForDate(date);
    setSelectedItineraryForAI(itineraryName || null);
    setAiSelectedDate(date);
    setItineraryDatesForDate(date);
    setShowAIModal(true);
  };

  const handleOpenAccommodationExpenseModal = useCallback(() => {
    // If no date is selected, try to find a date with an itinerary or use the first day of the trip
    if (!selectedDate) {
      // Try to find a date that has an itinerary
      const dayWithItinerary = dailyPlan.find((day) => day.name);
      if (dayWithItinerary) {
        setSelectedDate(dayWithItinerary.day);
      } else if (dailyPlan.length > 0) {
        // Use the first day of the trip as fallback
        setSelectedDate(dailyPlan[0].day);
      }
    }

    setShowAccommodationExpenseModal(true);
  }, [selectedDate, dailyPlan]);

  // Function to get itinerary_id by name
  const getItineraryIdByName = (itineraryName: string): string | undefined => {
    const itinerary = itineraries.find(
      (itinerary) => itinerary.name === itineraryName
    );
    return itinerary?.id;
  };

  const handleToggleItinerary = (
    itineraryName: string | null,
    expanded: boolean
  ) => {
    const id = itineraryName
      ? getItineraryIdByName(itineraryName) || null
      : null;
    if (expanded && id) {
      setSelectedItineraryId(id);
      // Al abrir otro itinerario: cerrar día y mostrar solo el itinerario en la URL
      setSelectedDate(null);
      // Suprimir scroll automático por cambio interno
      suppressNextUrlScrollRef.current = true;
      const url = getItineraryUrl(travel.id, id);
      navigate(url);
    } else {
      setSelectedItineraryId(null);
      // Al cerrar itinerario: cerrar también el día y dejar URL base
      setSelectedDate(null);
      // Suprimir scroll automático por cambio interno
      suppressNextUrlScrollRef.current = true;
      const url = getDailyPlannerUrl(travel.id);
      navigate(url);
    }
  };

  // Función para manejar el cierre de un día específico
  const handleCloseDay = () => {
    if (selectedDate && selectedItineraryId) {
      // Si hay día e itinerario seleccionados, volver al itinerario
      setSelectedDate(null);
      suppressNextUrlScrollRef.current = true;
      const url = getItineraryUrl(travel.id, selectedItineraryId);
      navigate(url);
    } else if (selectedDate) {
      // Si solo hay día seleccionado, volver al daily planner base
      setSelectedDate(null);
      suppressNextUrlScrollRef.current = true;
      const url = getDailyPlannerUrl(travel.id);
      navigate(url);
    }
  };

  // Show skeleton while loading general items
  if (loadingGeneralItems) {
    return <DailyPlannerSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto pt-0 pb-6 px-0 sm:px-0">
      {/* MainTripCard */}
      <MainTravelCard
        name={travel.name}
        startDate={travel.start_date}
        endDate={travel.end_date}
        country_codes={travel.country_codes}
        budget={travel.budget}
        spent={totalSpent}
        activities={countActivities}
        expenses={overviewData?.total_expenses || 0}
        onEdit={onEditTrip}
        onBack={onBack}
      />
      {/* Ad Banner */}
      <AdBannerResponsive area="large" provider="custom" className="mb-4" />

      <div className="overview-cards-container flex flex-col pt-4">
        {/* Days List */}
        <div className="internal-spacing flex flex-col">
          <ItineraryGroups
            dailyPlan={dailyPlan}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedItineraryName={getItineraryNameById(selectedItineraryId)}
            getItineraryIdByName={getItineraryIdByName}
            getItineraryCoordinates={getItineraryCoordinates}
            onOpenAIModal={handleOpenAIModalFromDay}
            onOpenAddActivityModal={(date: string) => {
              setSelectedDate(date);
              setEditingActivity(null);
              setItineraryDatesForDate(date);
              setShowActivityModal(true);
            }}
            onOpenAddExpenseModal={(date: string) => {
              setSelectedDate(date);
              setEditingExpense(null);
              setItineraryDatesForDate(date);
              setShowAddExpense(true);
            }}
            onEditActivity={handleEditDayActivity}
            onEditExpense={handleEditDayExpense}
            travelBudget={travel.budget || 0}
            onAddItinerary={() => setShowItineraryModal(true)}
            onEditItinerary={handleEditItinerary}
            onToggleItinerary={handleToggleItinerary}
            onCloseDay={handleCloseDay}
            onAddAccommodationExpense={handleOpenAccommodationExpenseModal}
            rawDailyPlan={finalRawDailyPlan}
          />
        </div>

        {/* Ad Banner */}
        <AdBannerResponsive
          area="xl-large"
          provider="custom"
          className="mb-4"
        />

        {/* General Activities Section */}
        <Card padding="lg" className="p-2 sm:p-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t("overview.generalActivities")}
            </h3>
          </div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("overview.generalActivitiesSubtitle")}
            </p>
            <button
              onClick={() => {
                setShowActivityModal(true);
                setEditingActivity(null);
                setIsGeneralActivityModal(true);

                // Limpiar fechas del itinerario para actividades generales (sin fecha específica)
                clearItineraryDates();
              }}
              className="px-3 py-1 rounded-lg transition-colors text-sm font-medium flex items-center gap-1 bg-blue-500 text-white hover:bg-blue-600"
            >
              <Plus className="w-3 h-3" />
              {t("common.add")}
            </button>
          </div>

          {/* General Activities List */}
          {generalItems.filter((item) => item.type === "activity").length > 0 ? (
            <div className="space-y-3">
              {generalItems
                .filter((item) => item.type === "activity")
                .map((activity) => (
                  <Card key={activity.id} border="yellow" padding="md">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-white dark:bg-gray-700 rounded-full border border-gray-300 dark:border-gray-600"></div>
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        </div>
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                          {activity.title}
                        </h5>
                        {activity.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {activity.description}
                          </p>
                        )}
                        {activity.category && (
                          <div className="mb-2">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {t(`categories.${activity.category}`)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(activity.cost || 0, userCurrency)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              // Convert GeneralItem to Activity for editing
                              const activityForEdit: Activity = {
                                id: activity.id.toString(),
                                title: activity.title,
                                description: activity.description,
                                date: null, // General activities don't have a date initially
                                time: "",
                                cost: activity.cost,
                                category: activity.category as ExpenseCategory,
                                priority: "medium",
                                completed: false,
                                travelId: activity.travel_id.toString(),
                              };
                              setEditingActivity(activityForEdit);
                              setShowActivityModal(true);
                              setIsGeneralActivityModal(true); // Keep as general mode for editing
                            }}
                            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                            title={t("common.editActivity", "Edit activity")}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={async () => {
                              const confirmed = await confirmDelete(
                                t("common.deleteActivity"),
                                t("common.deleteActivityConfirm", {
                                  title: activity.title,
                                }),
                                t("common.delete")
                              );

                              if (confirmed) {
                                deleteGeneralActivityMutation.mutate({
                                  id: activity.id.toString(),
                                  travelId: travel.id,
                                });
                              }
                            }}
                            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          ) : (
            <Card className="text-center">
              <Calendar className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {t("overview.noGeneralActivities")}
              </p>
            </Card>
          )}
        </Card>

        {/* General Expenses Section */}
        <Card padding="lg" className="p-3 sm:p-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t("overview.generalExpenses")}
            </h3>
          </div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("overview.generalExpensesSubtitle")}
            </p>
            <button
              onClick={() => {
                setShowAddExpense(true);
                setEditingGeneralExpense(null);
                setIsGeneralExpenseModal(true);
              }}
              className="px-3 py-1 rounded-lg transition-colors text-sm font-medium flex items-center gap-1 bg-green-500 text-white hover:bg-green-600"
            >
              <Plus className="w-3 h-3" />
              {t("common.add")}
            </button>
          </div>

          {/* General Expenses List */}
          {generalItems.filter((item) => item.type === "expense").length > 0 ? (
            <div className="space-y-3">
              {generalItems
                .filter((item) => item.type === "expense")
                .map((expense) => (
                  <Card key={expense.id} padding="md">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {expense.title}
                          </span>
                        </div>
                        {expense.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {expense.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mb-2">
                          {expense.category && (
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {t(`categories.${expense.category}`)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(expense.cost || 0, userCurrency)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              // Convert GeneralItem to Expense for editing
                              const expenseForEdit: Expense = {
                                id: expense.id.toString(),
                                title: expense.title,
                                cost: expense.cost,
                                currency: "EUR",
                                category: expense.category as ExpenseCategory,
                                date: null, // General expenses don't have a date initially
                                location: "",
                                notes: expense.description,
                              };
                              setEditingGeneralExpense(expenseForEdit);
                              setShowEditExpense(true);
                              setIsGeneralExpenseModal(true); // Keep as general mode for editing
                            }}
                            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                            title={t("common.editExpense", "Edit expense")}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={async () => {
                              const confirmed = await confirmDelete(
                                t("common.deleteExpense"),
                                t("common.deleteExpenseConfirm", {
                                  title: expense.title,
                                }),
                                t("common.delete")
                              );

                              if (confirmed) {
                                deleteGeneralExpenseMutation.mutate({
                                  id: expense.id.toString(),
                                  travelId: travel.id,
                                });
                              }
                            }}
                            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          ) : (
            <Card className="text-center">
              <DollarSign className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {t("overview.noGeneralExpenses")}
              </p>
            </Card>
          )}
        </Card>

        {/* Add Expense Modal */}
        <ExpenseModal
          isOpen={showAddExpense || showEditExpense}
          onClose={() => {
            setShowAddExpense(false);
            setShowEditExpense(false);
            setEditingGeneralExpense(null);
            setEditingExpense(null);
            setIsGeneralExpenseModal(false);
          }}
          onAddExpense={handleExpenseModalSubmit}
          onDelete={handleDeleteExpense}
          editingExpense={editingGeneralExpense || editingExpense}
          modalMode={
            editingGeneralExpense || isGeneralExpenseModal ? "general" : "daily"
          }
          selectedDate={selectedDate}
          itineraryId={
            selectedDate ? getItineraryIdForDate(selectedDate) : undefined
          }
          dailyPlan={dailyPlan}
          start_date={selectedItineraryDates.fromDate}
          end_date={selectedItineraryDates.toDate}
        />

        {/* Activity Modal */}
        <ActivityModal
          isOpen={showActivityModal}
          onClose={() => {
            setShowActivityModal(false);
            setEditingActivity(null);
            setIsGeneralActivityModal(false);
          }}
          travelId={travel.id}
          onSubmit={handleActivityModalSubmit}
          onDelete={handleDeleteActivity}
          editingActivity={editingActivity}
          editingDate={selectedDate}
          modalMode={isGeneralActivityModal ? "general" : "planned"}
          itineraryId={
            selectedDate ? getItineraryIdForDate(selectedDate) : undefined
          }
          dailyPlan={dailyPlan}
          start_date={selectedItineraryDates.fromDate}
          end_date={selectedItineraryDates.toDate}
        />

        {/* Itinerary Modal */}
        <ItineraryModal
          isOpen={showItineraryModal}
          onClose={() => {
            setShowItineraryModal(false);
            setEditingItinerary(null);
            setEditingItineraryData(null);
          }}
          onSubmit={handleAddItinerarySubmit}
          onUpdate={handleUpdateItinerary}
          travelId={travel.id}
          travelStartDate={travel.start_date}
          travelEndDate={travel.end_date}
          countryCodes={travel.country_codes}
          isSubmitting={isSubmittingItinerary}
          editingItinerary={editingItinerary}
          editingItineraryData={editingItineraryData}
          dailyPlan={dailyPlan}
        />

        {/* AI Modal */}
        <ActivitiesIAModal
          open={showAIModal}
          onClose={() => {
            setShowAIModal(false);
            setSelectedItineraryForAI(null);
            clearItineraryDates();
            setAiSelectedDate(null);
          }}
          date={aiSelectedDate}
          dailyBudget={travel.budget / dailyPlan.length}
          travelId={travel.id}
          itineraryName={selectedItineraryForAI}
          itineraryId={
            selectedItineraryForAI
              ? getItineraryIdByName(selectedItineraryForAI)
              : null
          }
          start_date={selectedItineraryDates.fromDate}
          end_date={selectedItineraryDates.toDate}
          bbox={
            selectedItineraryForAI
              ? [
                  getItineraryCoordinates(selectedItineraryForAI).lng - 0.01, // west
                  getItineraryCoordinates(selectedItineraryForAI).lat - 0.01, // south
                  getItineraryCoordinates(selectedItineraryForAI).lng + 0.01, // east
                  getItineraryCoordinates(selectedItineraryForAI).lat + 0.01, // north
                ]
              : undefined
          }
        />

        {/* Accommodation Expense Modal */}
        <AccommodationExpenseModal
          isOpen={showAccommodationExpenseModal}
          onClose={() => {
            setShowAccommodationExpenseModal(false);
            setEditingExpense(null);
          }}
          onAddExpense={handleAccommodationExpenseModalSubmit}
          onEditExpense={handleAccommodationExpenseModalSubmit}
          editingExpense={editingExpense as any}
          onDelete={handleDeleteExpense}
          selectedDate={selectedDate} // Pass the selected date to get correct location
          itineraryId={
            selectedDate ? getItineraryIdForDate(selectedDate) : undefined
          }
          tripStartDate={travel.start_date}
          tripEndDate={travel.end_date}
          travelId={travel.id}
          userId={userAuthData?.id || ""}
          dailyPlan={dailyPlan}
        />

        {/* ModalConfirm component */}
        <ModalConfirm
          isOpen={confirmState.isOpen}
          onClose={confirmState.onCancel}
          onConfirm={confirmState.onConfirm}
          title={confirmState.title}
          message={confirmState.message}
          type={confirmState.type}
          action={confirmState.action}
          confirmText={confirmState.confirmText}
          cancelText={confirmState.cancelText}
          isLoading={confirmState.isLoading}
          isAlert={confirmState.isAlert}
        />
      </div>
      {/* Ad Banner */}
      <AdBannerResponsive area="large" provider="custom" className="mb-4" />
    </div>
  );
};

export default DailyPlanner;
