import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Expense } from "../../types";
import { useTranslation } from "react-i18next";
import ModalClean from "./ModalClean";
import { ModalHeader } from "./ModalHeader";
import { Bed, MapPin, X } from "lucide-react";
import GooglePlaces from "../GooglePlaces";
import DatePicker from "../DatePicker";
import { useConfirm } from "../../hooks/useConfirm";
import { ModalConfirm } from "./ModalConfirm";
import { ACCOMMODATION_EXPENSE_CATEGORIES } from "../../data/accommodationExpenseCategories";
import Dropdown from "../Dropdown";
import { useCurrency } from "../../hooks/useCurrency";
import {
  useCreateExpense,
  useUpdateExpense,
} from "../../utils/queries";

interface AccommodationExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expenseData: Omit<AccommodationExpense, "id">) => void;
  onEditExpense?: (expenseData: AccommodationExpense) => void; // Nueva prop para edición
  onDelete?: (expenseId: string) => void;
  editingExpense?: AccommodationExpense | null;
  selectedDate?: string | null;
  itineraryId?: string;
  tripStartDate?: string;
  tripEndDate?: string;
  travelId?: string; // ID del viaje para las mutaciones
  userId?: string; // ID del usuario para las mutaciones
  dailyPlan?: Array<{
    day: string;
    lat?: number;
    lng?: number;
    name?: string | null;
  }>;
  itineraryDate?: string | null; // New prop for itinerary date without affecting navigation
}

// Extended type for accommodation expenses
export interface AccommodationExpense
  extends Omit<Expense, "date" | "category"> {
  start_date: string;
  end_date: string;
  lodging_type: string;
  category: "accommodation";
  rating?: number;
  reviews_count?: number;
  travel_id?: string;
  user_id?: string;
}

export const AccommodationExpenseModal: React.FC<AccommodationExpenseModalProps> =
  React.memo(
    ({
      isOpen,
      onClose,
      onDelete,
      editingExpense,
      itineraryId,
      selectedDate,
      tripStartDate,
      tripEndDate,
      travelId,
      userId,
      dailyPlan,
    }) => {
      const { t, i18n } = useTranslation();
      const { confirmState, confirmDelete } = useConfirm();
      const { userCurrency } = useCurrency();

      // React Query mutations
      const createExpenseMutation = useCreateExpense();
      const updateExpenseMutation = useUpdateExpense();
      // const deleteExpenseMutation = useDeleteExpense();

      const [formData, setFormData] = useState({
        title: "",
        cost: "",
        start_date: "",
        end_date: "",
        lodging_type: "hotel",
        location: "",
        notes: "",
      });

      const [selectedLocation, setSelectedLocation] = useState<{
        name: string;
        latitude: number;
        longitude: number;
        place_id?: string;
        address?: string;
        rating?: number;
        reviews_count?: number;
        place_type?: string;
      } | null>(null);

      const [errors, setErrors] = useState<Record<string, string>>({});
      const [locationMode, setLocationMode] = useState<"place" | "address">(
        "place"
      );
      const [addressSuggestions, setAddressSuggestions] = useState<
        Array<{
          main_text: string;
          secondary_text: string;
          place_id: string;
        }>
      >([]);

      // Function to get location for accommodation based on selected date or itinerary
      const getLocationForAccommodation = ():
        | { lat: number; lng: number }
        | undefined => {
        // If we have a selectedDate, try to find the itinerary location
        if (selectedDate && dailyPlan && dailyPlan.length > 0) {
          const itineraryDay = dailyPlan.find(
            (day: { day: string; lat?: number; lng?: number }) =>
              day.day === selectedDate
          );
          if (itineraryDay && itineraryDay.lat && itineraryDay.lng) {
            return { lat: itineraryDay.lat, lng: itineraryDay.lng };
          }
        }

        // If no specific date, try to find any itinerary with location
        if (dailyPlan && dailyPlan.length > 0) {
          const dayWithLocation = dailyPlan.find(
            (day: { lat?: number; lng?: number }) => day.lat && day.lng
          );
          if (dayWithLocation && dayWithLocation.lat && dayWithLocation.lng) {
            return { lat: dayWithLocation.lat, lng: dayWithLocation.lng };
          }
        }

        // If no location found in dailyPlan, return undefined to disable GooglePlaces
        // This ensures we don't search in random locations
        return undefined;
      };

      useEffect(() => {
        if (editingExpense) {
          setFormData({
            title: editingExpense.title,
            cost: editingExpense.cost.toString(),
            start_date: editingExpense.start_date || "",
            end_date: editingExpense.end_date || "",
            lodging_type: editingExpense.lodging_type || "hotel",
            location: editingExpense.location || "",
            notes: editingExpense.notes || "",
          });

          // Load location data if available
          if (editingExpense.lat && editingExpense.lng) {
            setSelectedLocation({
              name: editingExpense.location || "",
              latitude: editingExpense.lat,
              longitude: editingExpense.lng,
              place_id: editingExpense.place_id,
              address: editingExpense.address,
            });
          } else if (editingExpense.location) {
            // If no lat/lng but we have location text, set it in the form
            setSelectedLocation({
              name: editingExpense.location,
              latitude: 0, // Default values since we don't have real coordinates
              longitude: 0,
              place_id: editingExpense.place_id,
              address: editingExpense.address,
            });
          } else {
            setSelectedLocation(null);
          }
        } else {
          // For new accommodation expenses, start with itinerary date if available, otherwise trip date range
          let startDate = tripStartDate || "";
          let endDate = tripEndDate || "";

          // If we have a selectedDate (itinerary), try to find the itinerary range
          if (selectedDate && dailyPlan && dailyPlan.length > 0) {
            // Find the itinerary that contains the selectedDate
            const itineraryDay = dailyPlan.find(
              (day: { day: string; name?: string | null }) =>
                day.day === selectedDate
            );

            if (itineraryDay && itineraryDay.name) {
              // Find all days with the same itinerary name
              const itineraryDays = dailyPlan.filter(
                (day: { name?: string | null }) =>
                  day.name === itineraryDay.name
              );

              if (itineraryDays.length > 0) {
                // Sort by date to get start and end of the itinerary
                const sortedDays = itineraryDays.sort(
                  (a: { day: string }, b: { day: string }) =>
                    new Date(a.day).getTime() - new Date(b.day).getTime()
                );
                startDate = sortedDays[0].day;
                endDate = sortedDays[sortedDays.length - 1].day;
              }
            }
          }

          // Ensure we always have valid dates - use trip range as fallback
          if (!startDate && tripStartDate) {
            startDate = tripStartDate;
          }
          if (!endDate && tripEndDate) {
            endDate = tripEndDate;
          }

          setFormData({
            title: "",
            cost: "",
            start_date: startDate,
            end_date: endDate,
            lodging_type: "hotel",
            location: "",
            notes: "",
          });
          setSelectedLocation(null);
        }
      }, [editingExpense, selectedDate, tripStartDate, tripEndDate, dailyPlan]);

      // Clear address suggestions when switching modes
      useEffect(() => {
        setAddressSuggestions([]);
      }, [locationMode]);

      const validateForm = useCallback((): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.cost || parseFloat(formData.cost) <= 0) {
          newErrors.cost = t("validation.costRequired");
        }

        if (!formData.start_date) {
          newErrors.start_date = t("validation.dateRequired");
        }

        if (!formData.end_date) {
          newErrors.end_date = t("validation.dateRequired");
        }

        if (!formData.location.trim()) {
          newErrors.location = t("validation.locationRequired");
        }

        // Warning if no itinerary is selected (but don't block submission)
        if (!itineraryId) {
          console.warn(
            "⚠️ WARNING - No itinerary selected for accommodation expense"
          );
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      }, [formData, t, itineraryId]);

      const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
          e.preventDefault();

          if (!validateForm()) {
            return;
          }

          try {
            if (editingExpense) {
              // Modo edición - actualizar el gasto existente usando React Query
              const expenseData = {
                id: editingExpense.id,
                travelId: editingExpense.travel_id || "",
                title: formData.title.trim(),
                cost: parseFloat(formData.cost),
                start_date: formData.start_date,
                end_date: formData.end_date,
                category: "accommodation",
                lodging_type: formData.lodging_type,
                location: formData.location.trim(),
                notes: formData.notes.trim(),
                lat: selectedLocation?.latitude || editingExpense.lat,
                lng: selectedLocation?.longitude || editingExpense.lng,
                place_id: selectedLocation?.place_id || editingExpense.place_id,
                address: selectedLocation?.address || editingExpense.address,
                google_category:
                  selectedLocation?.place_type ||
                  editingExpense.google_category,
                rating: selectedLocation?.rating || editingExpense.rating,
                reviews_count:
                  selectedLocation?.reviews_count ||
                  editingExpense.reviews_count,
                itinerary_id: itineraryId || editingExpense.itinerary_id,
                currency: editingExpense.currency || userCurrency,
                travel_id: editingExpense.travel_id || "",
                user_id: editingExpense.user_id || "",
              };

              await updateExpenseMutation.mutateAsync(expenseData);
            } else {
              // Modo creación - agregar nuevo gasto usando React Query
              const expenseData = {
                title: formData.title.trim(),
                cost: parseFloat(formData.cost),
                start_date: formData.start_date,
                end_date: formData.end_date,
                category: "accommodation",
                lodging_type: formData.lodging_type,
                location: formData.location.trim(),
                notes: formData.notes.trim(),
                lat: selectedLocation?.latitude || undefined,
                lng: selectedLocation?.longitude || undefined,
                place_id: selectedLocation?.place_id || undefined,
                address: selectedLocation?.address || undefined,
                google_category: selectedLocation?.place_type || undefined,
                rating: selectedLocation?.rating || undefined,
                reviews_count: selectedLocation?.reviews_count || undefined,
                itinerary_id: itineraryId || undefined,
                currency: userCurrency,
                travel_id: travelId || "",
                user_id: userId || "",
              };

              await createExpenseMutation.mutateAsync(expenseData);
            }

            onClose();
          } catch (error) {
            console.error("Error saving accommodation expense:", error);
          }
        },
          [
            editingExpense,
            formData,
            selectedLocation,
            itineraryId,
            onClose,
            validateForm,
            createExpenseMutation,
            updateExpenseMutation,
            travelId,
            userId,
            userCurrency,
          ]
      );

      const handleInputChange = useCallback(
        (field: string, value: string) => {
          setFormData((prev) => ({ ...prev, [field]: value }));
          if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
          }
        },
        [errors]
      );

      const handleLocationSelect = useCallback(
        (place: {
          name: string;
          latitude: number;
          longitude: number;
          place_id?: string;
          address?: string;
          rating?: number;
          reviews_count?: number;
          place_type?: string;
        }) => {
          setSelectedLocation(place);
          setFormData((prev) => ({ ...prev, location: place.name }));

          if (errors.location) {
            setErrors((prev) => ({ ...prev, location: "" }));
          }
        },
        [errors.location]
      );

      const searchAddresses = useCallback(
        async (query: string) => {
          if (query.trim().length < 3) {
            setAddressSuggestions([]);
            return;
          }

          // Get location from itinerary or use default
          const location = (() => {
            if (selectedDate && dailyPlan && dailyPlan.length > 0) {
              const itineraryDay = dailyPlan.find(
                (day: { day: string; lat?: number; lng?: number }) =>
                  day.day === selectedDate
              );
              if (itineraryDay && itineraryDay.lat && itineraryDay.lng) {
                return { lat: itineraryDay.lat, lng: itineraryDay.lng };
              }
            }
            // Default to a central location if no itinerary coordinates
            return { lat: -34.6037, lng: -58.3816 }; // Buenos Aires center
          })();

          try {
            // Use our backend API for address search
            const response = await fetch(
              `${
                import.meta.env.VITE_BACKEND_TRAVIX ||
                "https://backend.travix.app"
              }/api/google-addresses`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
                },
                body: JSON.stringify({
                  input: query,
                  location: location,
                  radius: 50000,
                  language: i18n.language || "en",
                  types: "address",
                }),
              }
            );

            const data = await response.json();

            if (data.status === "OK" && data.predictions) {
              setAddressSuggestions(
                data.predictions.map(
                  (pred: {
                    description: string;
                    place_id: string;
                    structured_formatting?: {
                      main_text?: string;
                      secondary_text?: string;
                    };
                  }) => ({
                    main_text:
                      pred.structured_formatting?.main_text || pred.description,
                    secondary_text:
                      pred.structured_formatting?.secondary_text || "",
                    place_id: pred.place_id,
                  })
                )
              );
            } else {
              setAddressSuggestions([]);
            }
          } catch (error) {
            console.error("Error searching addresses:", error);
            setAddressSuggestions([]);
          }
        },
        [selectedDate, dailyPlan, i18n.language]
      );

      const selectAddress = useCallback(
        (suggestion: {
          main_text: string;
          secondary_text: string;
          place_id: string;
        }) => {
          const fullAddress =
            `${suggestion.main_text}, ${suggestion.secondary_text}`.trim();

          setFormData((prev) => ({
            ...prev,
            location: fullAddress,
          }));

          // Set selected location for the blue card display
          setSelectedLocation({
            name: fullAddress,
            latitude: 0, // We don't have coordinates for addresses
            longitude: 0,
            place_id: suggestion.place_id,
            address: fullAddress,
          });

          setAddressSuggestions([]);

          if (errors.location) {
            setErrors((prev) => ({ ...prev, location: "" }));
          }
        },
        [errors.location]
      );

      const handleDeleteExpense = useCallback(async () => {
        if (editingExpense && onDelete) {
          // Usar el modal de confirmación en lugar de eliminar directamente
          const confirmed = await confirmDelete(
            t("expense.deleteExpense") || "Delete Expense",
            t("expense.deleteExpenseConfirm") ||
              "Are you sure you want to delete this accommodation expense?",
            t("common.delete") || "Delete"
          );

          if (confirmed) {
            await onDelete(editingExpense.id);
            onClose();
          }
        }
      }, [editingExpense, onDelete, confirmDelete, t, onClose]);

      // Warning message for no itinerary - memoized to prevent re-renders
      const itineraryWarning = useMemo(() => {
        if (!itineraryId) {
          return (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ No itinerary selected. This accommodation will not be
                    associated with a specific itinerary.
                  </p>
                </div>
              </div>
            </div>
          );
        }
        return null;
      }, [itineraryId]);

      if (!isOpen) return null;

      return (
        <>
          <ModalClean isOpen={isOpen} onClose={onClose} className="max-w-md">
            <div className="overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-gray-800">
              <ModalHeader
                title={
                  editingExpense
                    ? t("overview.editAccommodation") || "Edit Accommodation"
                    : t("overview.addAccommodation")
                }
                type="primary"
                icon={Bed}
                onClose={onClose}
              />

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("form.dates")} *
                  </label>
                  <DatePicker
                    mode="range"
                    value={{
                      start_date: formData.start_date
                        ? new Date(formData.start_date)
                        : null,
                      end_date: formData.end_date
                        ? new Date(formData.end_date)
                        : null,
                    }}
                    onChange={(value) => {
                      if (value && "start_date" in value) {
                        // Es un DateRange
                        const startDate = value.start_date
                          ? value.start_date.toISOString().split("T")[0]
                          : "";
                        const endDate = value.end_date
                          ? value.end_date.toISOString().split("T")[0]
                          : "";
                        setFormData((prev) => ({
                          ...prev,
                          start_date: startDate,
                          end_date: endDate,
                        }));
                        if (errors.start_date) {
                          setErrors((prev) => ({ ...prev, start_date: "" }));
                        }
                        if (errors.end_date) {
                          setErrors((prev) => ({ ...prev, end_date: "" }));
                        }
                      }
                    }}
                    placeholder={t("placeholders.selectDate")}
                    className={`w-full ${
                      errors.start_date || errors.end_date
                        ? "border-red-500"
                        : ""
                    }`}
                    minDate={
                      tripStartDate ? new Date(tripStartDate) : undefined
                    }
                    maxDate={tripEndDate ? new Date(tripEndDate) : undefined}
                  />
                  {(errors.start_date || errors.end_date) && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.start_date || errors.end_date}
                    </p>
                  )}
                </div>

                {/* Warning if no itinerary selected */}
                {itineraryWarning}

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("form.title")} ({t("form.optional")})
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={t("placeholders.expenseTitle")}
                  />
                </div>

                {/* Cost */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("form.cost")} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost}
                    onChange={(e) => handleInputChange("cost", e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.cost
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    }`}
                    placeholder="0.00"
                  />
                  {errors.cost && (
                    <p className="text-red-500 text-xs mt-1">{errors.cost}</p>
                  )}
                </div>

                {/* Lodging Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("form.lodgingType")}
                  </label>
                  <Dropdown
                    options={ACCOMMODATION_EXPENSE_CATEGORIES.map(
                      (category) => ({
                        value: category.id,
                        label: t(
                          `overview.accommodationCategories.${category.key}`
                        ),
                      })
                    )}
                    value={formData.lodging_type}
                    onChange={(option) =>
                      handleInputChange("lodging_type", option.value)
                    }
                    className="w-full"
                  />
                </div>

                {/* Location */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("form.location")} *
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t("placeholders.place")}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setLocationMode(
                            locationMode === "place" ? "address" : "place"
                          )
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          locationMode === "address"
                            ? "bg-blue-600"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            locationMode === "address"
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t("placeholders.address")}
                      </span>
                    </div>
                  </div>

                  {locationMode === "place" ? (
                    getLocationForAccommodation() ? (
                      <div className="relative">
                        {editingExpense && editingExpense.location ? (
                          // Show existing location when editing
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/20 rounded-md flex items-center justify-center">
                                    <MapPin className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                      {editingExpense.location}
                                    </p>
                                    {editingExpense.address &&
                                      editingExpense.address !==
                                        editingExpense.location && (
                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                          {editingExpense.address}
                                        </p>
                                      )}
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    location: "",
                                  }));
                                  setSelectedLocation(null);
                                }}
                                className="ml-2 p-1 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Show GooglePlaces only when creating new accommodation
                          <GooglePlaces
                            onSelect={handleLocationSelect}
                            initialValue=""
                            location={getLocationForAccommodation()}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                          <div className="w-5 h-5 bg-yellow-100 dark:bg-yellow-900/20 rounded-md flex items-center justify-center">
                            <MapPin className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {t("placeholders.noLocationAvailable")}
                            </p>
                            <p className="text-xs text-yellow-600 dark:text-yellow-400">
                              {t("placeholders.selectItineraryFirst")}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="relative">
                      {selectedLocation && selectedLocation.name ? (
                        // Blue card for selected address
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/20 rounded-md flex items-center justify-center">
                                  <MapPin className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                    {selectedLocation.name}
                                  </p>
                                  {selectedLocation.address &&
                                    selectedLocation.address !==
                                      selectedLocation.name && (
                                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                        {selectedLocation.address}
                                      </p>
                                    )}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLocation(null);
                                setFormData((prev) => ({
                                  ...prev,
                                  location: "",
                                }));
                              }}
                              className="ml-2 p-1 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Input field for searching addresses
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => {
                            handleInputChange("location", e.target.value);
                            // Trigger address search
                            if (e.target.value.trim().length > 2) {
                              searchAddresses(e.target.value);
                            }
                          }}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder={t("placeholders.searchAddress")}
                        />
                      )}

                      {/* Address suggestions dropdown */}
                      {addressSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {addressSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => selectAddress(suggestion)}
                              className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none"
                            >
                              <div className="text-sm text-gray-900 dark:text-gray-100">
                                {suggestion.main_text}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {suggestion.secondary_text}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {errors.location && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.location}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("form.notesOptional")}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={t("placeholders.expenseNotes")}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    {editingExpense ? t("common.save") : t("common.add")}
                  </button>
                  {editingExpense && onDelete && (
                    <button
                      type="button"
                      onClick={handleDeleteExpense}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                    >
                      {t("common.delete")}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              </form>
            </div>
          </ModalClean>

          {/* Delete Confirmation Modal */}
          <ModalConfirm
            isOpen={confirmState.isOpen}
            onClose={confirmState.onCancel}
            onConfirm={confirmState.onConfirm}
            title={t("expense.deleteExpense")}
            message={t("expense.deleteExpenseConfirm")}
            confirmText={t("common.delete")}
            cancelText={t("common.cancel")}
            type="danger"
          />
        </>
      );
    }
  );
