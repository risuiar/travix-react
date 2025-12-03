import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAnalytics } from "../../hooks/useAnalytics";
import ModalClean from "./ModalClean";
import { ModalHeader } from "./ModalHeader";

import TravelLoadingAnimation from "./TravelLoadingAnimation";
import { callAIApi } from "../../utils/aiApi";
import { useAIWithAlert } from "../../hooks/useAIWithAlert";
import { useConfirm } from "../../hooks/useConfirm";
import { ModalConfirm } from "./ModalConfirm";
import { checkAIUsageLimit } from "../../utils/api/aiUsageApi";

import { useUserAuthContext } from "../../contexts/useUserAuthContext";
import { useCurrency } from "../../hooks/useCurrency";
import { useLanguage } from "../../hooks/useLanguage";
import { ExpenseCategory } from "../../types";
import { formatDateForForm } from "../../utils/dateUtils";
import { supabase } from "../../supabaseClient";
import InterestsAccordion from "../InterestsAccordion";
import interestCategories from "./interestCategories";
import { Sparkles } from "lucide-react";
import DatePicker from "../DatePicker";
import Dropdown from "../Dropdown";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../hooks/useToast";
import { placeTypeCategoryMap } from "../../utils/placeTypeCategoryMap";
import { getCategoryKeys } from "../../data/categories";

interface ActivitiesIAModalProps {
  open: boolean;
  onClose: () => void;
  date?: string | null;
  dayNumber?: number;
  start_date?: string;
  end_date?: string;
  dailyBudget: number;
  travelId?: string;
  bbox?: number[];
  itineraryName?: string | null;
  itineraryId?: string | null;
}

interface AIActivity {
  title: string;
  description?: string;
  time?: string;
  location?: string;
  cost?: number;
  estimatedCost?: number;
  category: string;
  priority: string;
  date: string;
  latitude?: number | null;
  longitude?: number | null;
  currency?: string;
  // Extra fields returned by API
  place_id?: string;
  rating?: number;
  reviews_count?: number;
  address?: string;
  url?: string;
  google_category?: string;
}

const ActivitiesIAModal: React.FC<ActivitiesIAModalProps> = ({
  open,
  onClose,
  date,
  start_date,
  end_date,
  travelId,
  bbox,
  itineraryName,
  itineraryId,
}) => {
  const { t } = useTranslation();
  const { trackEvent } = useAnalytics();
  const { callAIWithAlert } = useAIWithAlert();
  const { confirmState, alert } = useConfirm();

  // Translate the imported interest categories
  const translatedInterestCategories = interestCategories.map((category) => ({
    ...category,
    label: t(category.label),
    interests: category.interests.map((interest) => ({
      ...interest,
      label: t(interest.label),
    })),
  }));
  const allInterestKeys = translatedInterestCategories.flatMap((cat) =>
    cat.interests.map((i) => i.key)
  );
  const getInitialInterests = useCallback(() => {
    const obj: Record<string, boolean> = {};
    allInterestKeys.forEach((key) => {
      obj[key] = false;
    });
    return obj;
  }, [allInterestKeys]);

  // Función para obtener nombres de lugares existentes del itinerario
  const getExistingPlaceNames = useCallback(async (): Promise<string[]> => {
    if (!itineraryId) return [];

    try {
      // Consultar solo actividades generadas por IA para obtener nombres de lugares existentes
      const { data, error } = await supabase
        .from("travel_activities")
        .select("title, location, address")
        .eq("itinerary_id", itineraryId)
        .eq("generated_by_ai", true)
        .not("title", "is", null);

      if (error) {
        return [];
      }

      // Extraer nombres únicos de lugares
      const placeNames = new Set<string>();
      data?.forEach((item) => {
        // Agregar título del lugar
        if (item.title && item.title.trim()) {
          placeNames.add(item.title.trim().toLowerCase());
        }
        // Agregar ubicación si es diferente del título
        if (
          item.location &&
          item.location.trim() &&
          item.location !== item.title
        ) {
          placeNames.add(item.location.trim().toLowerCase());
        }
        // Agregar dirección si está disponible
        if (item.address && item.address.trim()) {
          placeNames.add(item.address.trim().toLowerCase());
        }
      });

      const uniquePlaceNames = Array.from(placeNames);

      return uniquePlaceNames;
    } catch {
      return [];
    }
  }, [itineraryId]);
  const [formData, setFormData] = useState({
    travelStyle: "average" as "relaxed" | "average" | "active",
    travelBudget: "average" as "economical" | "average" | "luxury",
    tourStartTime: "08:00" as string,
    interests: getInitialInterests(),
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    interests?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);
  const [completedActivitiesCount, setCompletedActivitiesCount] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isAILimitReached, setIsAILimitReached] = useState(false);
  const [aiLimitInfo, setAiLimitInfo] = useState<{requests_today: number} | null>(null);

  const prevOpen = useRef(false);

  // Use React Query mutation for creating activities

  const queryClient = useQueryClient();
  const { showSuccessToast } = useToast();
  const { userAuthData } = useUserAuthContext();
  const { userCurrency } = useCurrency();
  const { currentLanguage } = useLanguage();

  // Track modal open time for analytics
  const modalOpenTime = useRef(Date.now());

  // Handle close with analytics tracking
  const handleClose = () => {
    trackEvent("ai_activities_modal_closed", {
      travel_id: travelId || '',
      itinerary_id: itineraryId || '',
      had_user_input: !!(formData.travelStyle || formData.travelBudget || Object.keys(formData.interests).length > 0),
      modal_open_duration: Date.now() - modalOpenTime.current,
      user_tier: userAuthData?.premium_status || 'free',
    });
    onClose();
  };

  // Generate time options based on user locale
  const generateTimeOptions = () => {
    const options = [];
    const is24Hour =
      currentLanguage === "de" ||
      currentLanguage === "fr" ||
      currentLanguage === "it";

    if (is24Hour) {
      // 24-hour format
      for (let hour = 6; hour <= 20; hour += 2) {
        const time = `${hour.toString().padStart(2, "0")}:00`;
        options.push({ value: time, label: time });
      }
    } else {
      // 12-hour format with AM/PM
      for (let hour = 6; hour <= 20; hour += 2) {
        const displayHour = hour > 12 ? hour - 12 : hour;
        const ampm = hour >= 12 ? "PM" : "AM";
        const time = `${hour.toString().padStart(2, "0")}:00`;
        const displayTime = `${displayHour}:00 ${ampm}`;
        options.push({ value: time, label: displayTime });
      }
    }

    return options;
  };

  // Function to get itinerary_id based on itinerary name
  const getItineraryIdByName = (): string | undefined => {
    // Use the itineraryId passed as prop
    return itineraryId || undefined;
  };

  // Function to clean time field for database
  const cleanTimeField = (time: string): string => {
    if (!time) return "";

    // Remove any timezone or range indicators
    let cleanedTime = time
      .replace(/\s*-\s*\d{2}:\d{2}/g, "") // Remove time ranges like "15:00 - 16:30"
      .replace(/\s*[+-]\d{2}:\d{2}/g, "") // Remove timezone offsets
      .replace(/\s*[A-Z]{3,4}/g, "") // Remove timezone abbreviations
      .trim();

    // Remove seconds if present (e.g., "01:00:00" -> "01:00")
    if (cleanedTime.includes(":")) {
      const parts = cleanedTime.split(":");
      if (parts.length === 3) {
        cleanedTime = `${parts[0]}:${parts[1]}`;
      }
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (timeRegex.test(cleanedTime)) {
      return cleanedTime;
    }

    return ""; // Return empty string if invalid format
  };

  // Reset form when modal opens
  useEffect(() => {
    if (open && !prevOpen.current) {
      // Reset modal open time for tracking
      modalOpenTime.current = Date.now();
      
      // Track AI modal opened
      trackEvent("ai_activities_modal_opened", {
        travel_id: travelId || '',
        itinerary_id: itineraryId || '',
        itinerary_name: itineraryName || '',
        has_date: !!date,
        date: date || '',
      });

      // Verificar límite de IA al abrir el modal
      const checkAILimit = async () => {
        try {
          const limitCheck = await checkAIUsageLimit();
          
          if (limitCheck && !limitCheck.can_make_request) {
            // Establecer que el límite se ha alcanzado para deshabilitar el formulario
            setIsAILimitReached(true);
            setAiLimitInfo(limitCheck);
            
            // Mostrar alerta inmediatamente
            await alert({
              title: t("aiUsage.limitReachedTitle"),
              message: t("aiUsage.limitReachedMessage").replace("{count}", limitCheck.requests_today.toString()),
              type: "warning",
            });
          } else {
            // Resetear el estado si el límite no se ha alcanzado
            setIsAILimitReached(false);
            setAiLimitInfo(limitCheck);
          }
        } catch {
          // Si hay error verificando el límite, permitir continuar
          setIsAILimitReached(false);
        }
      };

      // Ejecutar verificación de límite
      checkAILimit();

      setFormData({
        travelStyle: "average",
        travelBudget: "average",
        tourStartTime: "08:00",
        interests: getInitialInterests(),
      });

      // Initialize date based on context
      if (date) {
        // If opened from a specific day, use that date
        setSelectedDate(date);
      } else if (start_date) {
        // If opened from itinerary, use the start date
        setSelectedDate(start_date);
      } else {
        setSelectedDate(null);
      }

      setErrors({});
      setCompletedActivitiesCount(0);
      setHasError(false);
    }
    prevOpen.current = open;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, getInitialInterests, date, start_date, t, alert, onClose]);

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | Record<string, boolean>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInterestChange = (interestKey: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      interests: {
        ...prev.interests,
        [interestKey]: checked,
      },
    }));
  };

  const mapCategoryToValidCategory = (category: string): ExpenseCategory => {
    const categoryLower = category.toLowerCase();
    const validCategories = getCategoryKeys();

    // 1. Primero verificar si es una categoría base válida
    if (validCategories.includes(categoryLower as ExpenseCategory)) {
      return categoryLower as ExpenseCategory;
    }

    // 2. Buscar en el mapeo de placeTypeCategoryMap
    const mappedCategory = placeTypeCategoryMap[categoryLower];
    if (mappedCategory) {
      return mappedCategory as ExpenseCategory;
    }

    // 3. Fallback a "other"
    return "other";
  };

  const mapPriorityToValidPriority = (
    priority: string
  ): "high" | "medium" | "low" => {
    const priorityMap: Record<string, "high" | "medium" | "low"> = {
      high: "high",
      medium: "medium",
      low: "low",
      alta: "high",
      media: "medium",
      baja: "low",
    };
    return priorityMap[priority.toLowerCase()] || "medium";
  };

  const processAIActivities = async (activities: AIActivity[]) => {

    if (!activities || activities.length === 0) {
      return;
    }

    // Obtener nombres de lugares existentes (solo IA) para validación adicional
    const existingPlaceNames = await getExistingPlaceNames();

    // Group activities by date
    const activitiesByDate: Record<string, AIActivity[]> = {};

    activities.forEach((activity: AIActivity) => {
      const activityDate = activity.date;
      if (!activityDate) {
        return;
      }

      // Validación adicional: verificar que no sea duplicado por nombre de lugar
      if (
        activity.title &&
        existingPlaceNames.includes(activity.title.toLowerCase().trim())
      ) {
        return; // Saltar esta actividad
      }

      if (!activitiesByDate[activityDate]) {
        activitiesByDate[activityDate] = [];
      }

      activitiesByDate[activityDate].push(activity);
    });

    if (Object.keys(activitiesByDate).length === 0) {
      return;
    }

    // Prepare all activities for bulk insert
    const allActivitiesData = [];

    for (const [date, dayActivities] of Object.entries(activitiesByDate)) {
      if (date && dayActivities.length > 0) {
        const seenCoords = new Set<string>();
        let bboxFallbackUsed = false;
        for (const activity of dayActivities) {
          const mappedPriority = mapPriorityToValidPriority(
            activity.priority as string
          );

          // Sanitize and deduplicate coordinates with maximum precision
          let lat =
            typeof activity.latitude === "number"
              ? activity.latitude
              : undefined;
          let lng =
            typeof activity.longitude === "number"
              ? activity.longitude
              : undefined;

          if (typeof lat === "number" && typeof lng === "number") {
            // Use higher precision for duplicate detection (7 decimal places for ~1m accuracy)
            const key = `${lat.toFixed(7)},${lng.toFixed(7)}`;
            if (seenCoords.has(key)) {
              lat = undefined;
              lng = undefined;
            } else {
              seenCoords.add(key);
            }
          } else if (!lat || !lng) {
            if (!bboxFallbackUsed && bbox && bbox.length >= 2) {
              lat = bbox[1];
              lng = bbox[0];
              bboxFallbackUsed = true;
              const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
              seenCoords.add(key);
            } else {
              lat = undefined;
              lng = undefined;
            }
          }

          if (lat === 0 && lng === 0) {
            lat = undefined;
            lng = undefined;
          }

          const activityData = {
            title: activity.title,
            description: activity.description || "",
            time: cleanTimeField(activity.time || ""),
            location: activity.location || "",
            cost: activity.estimatedCost || activity.cost || 0,
            category: mapCategoryToValidCategory(activity.category || ""),
            priority: mappedPriority,
            date: date,
            travel_id: travelId || "",
            user_id: userAuthData?.id || "",
            itinerary_id: itineraryName ? getItineraryIdByName() : undefined,
            generated_by_ai: true, // Mark as AI-generated
            lat,
            lng,
            currency: activity.currency || userCurrency,
            // Extra fields
            place_id: activity.place_id || null,
            rating:
              typeof activity.rating === "number" ? activity.rating : null,
            reviews_count:
              typeof activity.reviews_count === "number"
                ? activity.reviews_count
                : null,
            address: activity.address || "",
            url: activity.url || "",
            google_category: activity.google_category || null,
          };

          allActivitiesData.push(activityData);
        }
      }
    }

    // Bulk insert all activities at once
    if (allActivitiesData.length > 0) {
      try {
        const { error } = await supabase
          .from("travel_activities")
          .insert(allActivitiesData)
          .select();

        if (error) {
          throw error;
        }

        setCompletedActivitiesCount(allActivitiesData.length);

        // Invalidate React Query cache to refresh the UI
        queryClient.invalidateQueries({
          queryKey: ["travel", "overview"],
          exact: false,
        });
        queryClient.invalidateQueries({
          queryKey: ["travel", "daily-plan-items"],
          exact: false,
        });
        queryClient.invalidateQueries({
          queryKey: ["travel", "general-items"],
          exact: false,
        });
        queryClient.invalidateQueries({
          queryKey: ["travel", "expenses"],
          exact: false,
        });

        // Force immediate refetch of overview data to ensure UI updates
        queryClient.refetchQueries({
          queryKey: ["travel", "overview"],
          exact: false,
        });

        // Additional refetch after a delay to ensure all data is updated
        setTimeout(() => {
          queryClient.refetchQueries({
            queryKey: ["travel", "overview"],
            exact: false,
          });
          queryClient.refetchQueries({
            queryKey: ["travel", "daily-plan-items"],
            exact: false,
          });
        }, 500);

        // Show success toast
        showSuccessToast(
          t("common.success"),
          `${allActivitiesData.length} ${t("common.activities")} ${t(
            "common.have"
          )} ${t("common.been")} ${t("common.added")}`
        );

        // Dispatch custom event to notify components that daily data has changed
        window.dispatchEvent(new CustomEvent("dailyDataChanged"));

      } catch {
        // Error handling without console.error
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Verificar si el límite de IA se ha alcanzado
    if (isAILimitReached) {
      // Track AI limit reached attempt
      trackEvent("ai_generation_blocked_limit_reached", {
        travel_id: travelId || '',
        itinerary_id: itineraryId || '',
        user_tier: userAuthData?.premium_status || 'free',
      });
      return;
    }

    // Track AI generation started
    trackEvent("ai_activities_generation_started", {
      travel_id: travelId || '',
      itinerary_id: itineraryId || '',
      itinerary_name: itineraryName || '',
      date: selectedDate || '',
      travel_style: formData.travelStyle,
      travel_budget: formData.travelBudget,
      tour_start_time: formData.tourStartTime,
      selected_interests_count: Object.keys(formData.interests || {}).filter(key => formData.interests?.[key]).length,
      user_tier: userAuthData?.premium_status || 'free',
      language: currentLanguage,
    });

    setIsSubmitting(true);
    setShowLoadingAnimation(true);

    try {
      // Obtener nombres de lugares existentes (solo IA) antes de enviar a la IA
      const existingPlaceNames = await getExistingPlaceNames();

      // Usar directamente el estado del componente en lugar de FormData
      const data = {
        travel_id: travelId,
        user_id: userAuthData?.id || "",
        title: "Generar actividades turísticas", // Título fijo para la generación de IA
        description: `Generar actividades para ${
          itineraryName || t("itinerary.theItinerary", "el itinerario")
        }`, // Descripción basada en el itinerario
        date: selectedDate,
        time: formData.tourStartTime, // Usar el estado del componente
        cost: 0, // Costo fijo para generación de IA
        category: "sightseeing", // Categoría por defecto
        priority: "medium", // Prioridad por defecto
        location: itineraryName || "", // Use itinerary name as location
        itinerary_id: itineraryId || null,
        // Agregar nombres de lugares existentes para evitar duplicados
        existing_place_names: existingPlaceNames,
        // Agregar preferencias del usuario
        travel_style: formData.travelStyle,
        travel_budget: formData.travelBudget,
        interests: formData.interests,
        // Agregar idioma del usuario
        language: currentLanguage,
        // Add coordinates if available
        ...(bbox &&
          bbox.length >= 2 && {
            latitude: bbox[1],
            longitude: bbox[0],
          }),
      };

      // Usar el nuevo sistema que maneja límites y alertas automáticamente
      const response = await callAIWithAlert(
        'activity_recommendations',
        () => callAIApi(data),
        {
          estimatedTokens: 1000, // Estimación de tokens para esta operación
          estimatedCost: 0.02,   // Estimación de costo
          includeRequestData: { endpoint: 'activity_recommendations', location: itineraryName }
        }
      );

      // Si response es null, significa que se alcanzó el límite
      // (esto es un fallback por si el límite cambió entre la apertura del modal y ahora)
      if (!response) {
        setIsSubmitting(false);
        setShowLoadingAnimation(false);
        return;
      }

      let activities: AIActivity[];

      // Handle the new structured response format
      if (
        response.processedActivities &&
        Array.isArray(response.processedActivities)
      ) {
        activities = response.processedActivities;
      } else if (response.text) {
        // Fallback for legacy string format
        try {
          const parsed = JSON.parse(response.text);
          activities = Array.isArray(parsed) ? parsed : [];
        } catch {
          throw new Error("Invalid response format from AI");
        }
      } else {
        throw new Error("Unexpected response format from AI");
      }

      await processAIActivities(activities);

      // Track successful AI generation
      trackEvent("ai_activities_generation_success", {
        travel_id: travelId || '',
        itinerary_id: itineraryId || '',
        activities_generated: activities.length,
        travel_style: formData.travelStyle,
        travel_budget: formData.travelBudget,
        user_tier: userAuthData?.premium_status || 'free',
        language: currentLanguage,
      });

      // Close modal after successful processing
      setTimeout(() => {
        handleClose();
        setIsSubmitting(false);
        setShowLoadingAnimation(false);
      }, 2000);
    } catch (error) {
      // Track failed AI generation
      trackEvent("ai_activities_generation_failed", {
        travel_id: travelId || '',
        itinerary_id: itineraryId || '',
        error_type: error instanceof Error ? error.message : 'unknown_error',
        travel_style: formData.travelStyle,
        travel_budget: formData.travelBudget,
        user_tier: userAuthData?.premium_status || 'free',
      });

      setHasError(true);
      setIsSubmitting(false);
      setShowLoadingAnimation(false);
    }
  };

  if (!open) return null;

  return (
    <ModalClean isOpen={open} onClose={handleClose} className="max-w-2xl">
      <div className="overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-gray-800">
        <ModalHeader
          title={t("ai.generateActivities")}
          type="primary"
          icon={Sparkles}
          onClose={handleClose}
        />
        <div className="p-4">
          {showLoadingAnimation ? (
            <TravelLoadingAnimation
              activitiesCount={completedActivitiesCount}
              hasError={hasError}
              onClose={handleClose}
              isCompleted={completedActivitiesCount > 0}
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Alerta de límite alcanzado */}
              {isAILimitReached && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-yellow-600 dark:text-yellow-400 mr-3">
                      ⚠️
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        {t("aiUsage.limitReachedTitle")}
                      </h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        {t("aiUsage.limitReachedMessage").replace("{count}", (aiLimitInfo?.requests_today || 0).toString())}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Location Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("form.location")}
                </label>
                <div className="p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    {itineraryName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t("ai.locationFromItinerary")}
                  </p>
                  {itineraryId && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        🚫 Se evitarán actividades duplicadas en este itinerario
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("form.date")}
                </label>
                <DatePicker
                  mode="single"
                  value={selectedDate ? new Date(selectedDate) : null}
                  onChange={(selected) => {
                    if (
                      selected &&
                      typeof selected === "object" &&
                      "toLocaleDateString" in selected
                    ) {
                      setSelectedDate(formatDateForForm(selected));
                    }
                  }}
                  minDate={start_date ? new Date(start_date) : undefined}
                  maxDate={end_date ? new Date(end_date) : undefined}
                />
              </div>

              {/* Tour Start Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("ai.tourStartTime.label")}
                </label>
                <Dropdown
                  options={generateTimeOptions()}
                  value={formData.tourStartTime}
                  onChange={(option: { value: string; label: string }) =>
                    handleInputChange("tourStartTime", option.value)
                  }
                  className="w-full"
                />
              </div>

              {/* Travel Style - Botones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("ai.travelStyle")}{" "}
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                    ({t("ai.activitiesQuantity")})
                  </span>
                </label>
                <div className="flex gap-2">
                  {["relaxed", "average", "active"].map((style) => (
                    <button
                      key={style}
                      type="button"
                      className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors duration-150 focus:outline-none
                      ${
                        formData.travelStyle === style
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900"
                      }
                    `}
                      onClick={() => handleInputChange("travelStyle", style)}
                    >
                      <div className="flex flex-col">
                        <span className="truncate block">
                          {t(`ai.${style}`)}
                        </span>
                        <span className="text-xs opacity-75">
                          {t(`ai.${style}Description`)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Level - Botones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("ai.budgetLevel")}
                </label>
                <div className="flex gap-2">
                  {["economical", "average", "luxury"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors duration-150 focus:outline-none
                      ${
                        formData.travelBudget === level
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900"
                      }
                    `}
                      onClick={() => handleInputChange("travelBudget", level)}
                    >
                      <span className="truncate block">{t(`ai.${level}`)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("ai.interests")}
                </label>
                <InterestsAccordion
                  categories={translatedInterestCategories}
                  selected={formData.interests}
                  onToggle={(key) =>
                    handleInterestChange(key, !formData.interests[key])
                  }
                />
                {errors.interests && (
                  <p className="mt-0.5 text-sm text-red-600 dark:text-red-400">
                    {errors.interests}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isAILimitReached}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAILimitReached
                  ? t("aiUsage.limitReached")
                  : isSubmitting
                    ? t("common.generating")
                    : t("ai.generateActivities")}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Modal de confirmación para alertas de límite de IA */}
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
    </ModalClean>
  );
};

export default ActivitiesIAModal;
