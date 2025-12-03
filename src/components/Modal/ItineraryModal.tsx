import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { MapPin } from "lucide-react";
import { TravelItinerary, DailyPlan } from "../../types";
import MapBoxPlaces from "../MapBoxPlaces";
import DatePicker from "../DatePicker";
import { parseDateString, formatDateForForm } from "../../utils/dateUtils";
import { useDeleteItinerary } from "../../utils/queries";
import ModalClean from "./ModalClean";
import { ModalHeader } from "./ModalHeader";
import { useConfirm } from "../../hooks/useConfirm";
import { ModalConfirm } from "./ModalConfirm";
import { useAnalytics } from "../../hooks/useAnalytics";

interface ItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (itinerary: Omit<TravelItinerary, "id" | "created_at">) => void;
  onUpdate?: (formData: {
    start_date: string;
    end_date: string;
    notes: string;
    lat?: number;
    lng?: number;
    place_id?: string;
    bbox?: number[];
  }) => void;
  travelId: string;
  travelStartDate: string;
  travelEndDate: string;
  countryCodes?: Array<Record<string, string>>;
  isSubmitting?: boolean;
  editingItinerary?: string | null;
  editingItineraryData?: TravelItinerary | null;
  dailyPlan?: DailyPlan[];
}

interface Place {
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
  bbox: number[];
  country_code?: string;
  place_type?: "city" | "place";
  place_id?: string;
}

export default function ItineraryModal({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  travelId,
  travelStartDate,
  travelEndDate,
  countryCodes = [],
  isSubmitting = false,
  editingItinerary = null,
  editingItineraryData = null,

  dailyPlan = [],
}: ItineraryModalProps) {
  const { t } = useTranslation();
  const { trackEvent } = useAnalytics();
  const { confirmState, confirmDelete } = useConfirm();

  // Track modal open time for analytics
  const modalOpenTime = useRef(Date.now());

  // Handle close with analytics tracking
  const handleClose = () => {
    trackEvent("itinerary_modal_closed", {
      travel_id: travelId,
      had_user_input: !!(formData.start_date || formData.end_date || formData.notes || selectedPlace),
      modal_open_duration: Date.now() - modalOpenTime.current,
      is_editing: !!editingItinerary,
      itinerary_id: editingItinerary || '',
    });
    onClose();
  };

  const deleteItineraryMutation = useDeleteItinerary();
  const [formData, setFormData] = useState({
    start_date: "",
    end_date: "",
    notes: "",
  });
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
  const hasInitializedRef = useRef(false);

  // Load itinerary data and check deletion safety when modal opens
  useEffect(() => {
    if (isOpen && editingItinerary && !hasInitializedRef.current) {
      if (editingItineraryData) {
        // Set form data from editingItineraryData if available
        setFormData({
          start_date: editingItineraryData.start_date,
          end_date: editingItineraryData.end_date,
          notes: editingItineraryData.notes || "",
        });
        setSelectedPlace({
          name: editingItineraryData.name,
          country: "",
          latitude: editingItineraryData.lat || 0,
          longitude: editingItineraryData.lng || 0,
          bbox: editingItineraryData.bbox || [],
          place_type: editingItineraryData.place_type,
          place_id: editingItineraryData.place_id,
        });
      } else {
        // Get data from dailyPlan if editingItineraryData is null
        const itineraryDays = dailyPlan.filter(
          (day) => day.name === editingItinerary
        );
        if (itineraryDays.length > 0) {
          // For now, we'll need to get the dates from the dailyPlan

          const firstDay = itineraryDays[0];
          const lastDay = itineraryDays[itineraryDays.length - 1];

          setFormData({
            start_date: firstDay.day,
            end_date: lastDay.day,
            notes: firstDay.notes || "",
          });
          setSelectedPlace({
            name: editingItinerary,
            country: "",
            latitude: 0,
            longitude: 0,
            bbox: [],
            place_type: "city",
            place_id: "",
          });
        }
      }
      hasInitializedRef.current = true;
    } else if (!isOpen) {
      hasInitializedRef.current = false;
    }
  }, [isOpen, editingItinerary, editingItineraryData, dailyPlan]);

  // Reset form when modal opens/closes (only for new itineraries)
  React.useEffect(() => {
    if (isOpen && !editingItinerary) {
      setFormData({
        start_date: "",
        end_date: "",
        notes: "",
      });
      setSelectedPlace(null);
      setErrors({});
    }
  }, [isOpen, editingItinerary]);

  // Track modal open events
  useEffect(() => {
    if (isOpen) {
      // Reset modal open time for tracking
      modalOpenTime.current = Date.now();
      
      // Track itinerary modal opened
      trackEvent("itinerary_modal_opened", {
        travel_id: travelId,
        is_editing: !!editingItinerary,
        itinerary_id: editingItinerary || '',
        has_daily_plan: dailyPlan.length > 0,
        country_codes_count: countryCodes.length,
      });
    }
  }, [isOpen, travelId, editingItinerary, dailyPlan.length, countryCodes.length, trackEvent]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.start_date) {
      newErrors.start_date = t("validation.required");
    }

    if (!formData.end_date) {
      newErrors.end_date = t("validation.required");
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);

      if (startDate > endDate) {
        newErrors.end_date = t(
          "validation.endDateAfterStart",
          "End date must be after start date"
        );
      }

      const travelStart = new Date(travelStartDate);
      const travelEnd = new Date(travelEndDate);

      if (startDate < travelStart || endDate > travelEnd) {
        newErrors.start_date = t(
          "validation.datesWithinTrip",
          "Dates must be within the trip period"
        );
      }
    }

    if (!selectedPlace) {
      newErrors.place = t("validation.required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Track itinerary submission started
    trackEvent(editingItinerary ? "itinerary_edit_started" : "itinerary_create_started", {
      travel_id: travelId,
      place_name: selectedPlace?.name || '',
      place_type: selectedPlace?.place_type || '',
      has_notes: !!formData.notes,
      date_range_days: formData.start_date && formData.end_date ? 
        Math.ceil((new Date(formData.end_date).getTime() - new Date(formData.start_date).getTime()) / (1000 * 60 * 60 * 24)) : 0,
      itinerary_id: editingItinerary || '',
    });

    setIsSubmittingLocal(true);
    try {
      if (editingItinerary && editingItineraryData) {
        // For editing, just call the onUpdate callback which handles the actual update
        if (onUpdate) {
          // Pass the form data to the parent component
          const updateData = {
            start_date: formData.start_date,
            end_date: formData.end_date,
            notes: formData.notes.trim(),
            lat: selectedPlace?.latitude,
            lng: selectedPlace?.longitude,
            place_id: selectedPlace?.place_id,
            bbox: selectedPlace?.bbox,
          };

          // Track successful itinerary update
          trackEvent("itinerary_edit_success", {
            travel_id: travelId,
            itinerary_id: editingItinerary,
            place_name: selectedPlace?.name || '',
            place_type: selectedPlace?.place_type || '',
            has_notes: !!formData.notes,
            modal_open_duration: Date.now() - modalOpenTime.current,
          });

          await onUpdate(updateData);
        }

        handleClose();
      } else {
        // Create new itinerary
        const place_type = selectedPlace?.place_type || "city";
        const itinerary: Omit<TravelItinerary, "id" | "created_at"> = {
          travel_id: travelId,
          name: selectedPlace?.name || "",
          start_date: formData.start_date,
          end_date: formData.end_date,
          notes: formData.notes.trim(),
          place_type,
          lat: selectedPlace?.latitude,
          lng: selectedPlace?.longitude,
          place_id: selectedPlace?.place_id,
          bbox: selectedPlace?.bbox,
        };

        // Track successful itinerary creation
        trackEvent("itinerary_create_success", {
          travel_id: travelId,
          place_name: selectedPlace?.name || '',
          place_type: selectedPlace?.place_type || '',
          has_notes: !!formData.notes,
          date_range_days: formData.start_date && formData.end_date ? 
            Math.ceil((new Date(formData.end_date).getTime() - new Date(formData.start_date).getTime()) / (1000 * 60 * 60 * 24)) : 0,
          modal_open_duration: Date.now() - modalOpenTime.current,
        });

        onSubmit(itinerary);
      }
    } catch (error) {
      // Track failed itinerary operation
      trackEvent(editingItinerary ? "itinerary_edit_failed" : "itinerary_create_failed", {
        travel_id: travelId,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        itinerary_id: editingItinerary || '',
      });
      
      console.error("Error saving itinerary:", error);
    } finally {
      setIsSubmittingLocal(false);
    }
  };

  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);
    setErrors((prev) => ({ ...prev, place: "" }));
  };

  const handleInputChange = (
    field: "start_date" | "end_date" | "notes",
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleDeleteItinerary = async () => {
    if (!editingItinerary || !editingItineraryData) return;

    // Track delete confirmation shown
    trackEvent("itinerary_delete_confirmation_shown", {
      travel_id: travelId,
      itinerary_id: editingItinerary,
      itinerary_name: editingItinerary,
      place_type: editingItineraryData.place_type,
    });

    // Primera confirmación
    const firstConfirmed = await confirmDelete(
      t("common.deleteItinerary"),
      t("common.deleteItineraryConfirm", { title: editingItinerary }),
      t("common.delete")
    );

    if (firstConfirmed) {
      // Track first confirmation accepted
      trackEvent("itinerary_delete_first_confirmation_accepted", {
        travel_id: travelId,
        itinerary_id: editingItinerary,
        itinerary_name: editingItinerary,
      });

      // Segunda confirmación con advertencia más fuerte
      const finalConfirmed = await confirmDelete(
        t("common.warning"),
        t("common.deleteItineraryFinalConfirm"),
        t("common.delete")
      );

      if (finalConfirmed) {
        // Track final confirmation accepted
        trackEvent("itinerary_delete_final_confirmation_accepted", {
          travel_id: travelId,
          itinerary_id: editingItinerary,
          itinerary_name: editingItinerary,
        });

        setIsDeleting(true);
        try {
          if (editingItineraryData && editingItineraryData.id) {
            await deleteItineraryMutation.mutateAsync(
              editingItineraryData.id.toString()
            );

            // Track successful itinerary deletion
            trackEvent("itinerary_delete_success", {
              travel_id: travelId,
              itinerary_id: editingItinerary,
              itinerary_name: editingItinerary,
              place_type: editingItineraryData.place_type,
              modal_open_duration: Date.now() - modalOpenTime.current,
            });

            // CORREGIDO: No llamar a onUpdate después del borrado
            // onUpdate() se usa para actualizar itinerarios, no para borrarlos
            // React Query ya maneja la invalidación de cache automáticamente

            handleClose();
          }
        } catch (error) {
          // Track failed itinerary deletion
          trackEvent("itinerary_delete_failed", {
            travel_id: travelId,
            itinerary_id: editingItinerary,
            error_message: error instanceof Error ? error.message : 'Unknown error',
          });
          
          console.error("Error deleting itinerary:", error);
        } finally {
          setIsDeleting(false);
        }
      } else {
        // Track final confirmation cancelled
        trackEvent("itinerary_delete_final_confirmation_cancelled", {
          travel_id: travelId,
          itinerary_id: editingItinerary,
        });
      }
    } else {
      // Track first confirmation cancelled
      trackEvent("itinerary_delete_first_confirmation_cancelled", {
        travel_id: travelId,
        itinerary_id: editingItinerary,
      });
    }
  };

  // Get dates that are already occupied by other itineraries
  const getDisabledDates = (): Date[] => {
    const disabledDates: Date[] = [];

    // Group dates by itinerary name to get complete ranges
    const itineraryRanges = new Map<string, { start: string; end: string }>();

    dailyPlan.forEach((day) => {
      if (day.name && day.name !== editingItinerary) {
        // If we already have a start date for this itinerary, update the end date
        if (itineraryRanges.has(day.name)) {
          const range = itineraryRanges.get(day.name);
          if (range) {
            range.end = day.day;
          }
        } else {
          // First occurrence of this itinerary, set both start and end
          itineraryRanges.set(day.name, { start: day.day, end: day.day });
        }
      }
    });

    // Now disable all dates within each itinerary range
    itineraryRanges.forEach((range) => {
      const startDate = new Date(range.start);
      const endDate = new Date(range.end);

      // Add all dates from start to end (inclusive)
      for (
        let date = new Date(startDate);
        date <= endDate;
        date.setDate(date.getDate() + 1)
      ) {
        disabledDates.push(new Date(date));
      }
    });

    return disabledDates;
  };

  return (
    <ModalClean
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-lg max-h-[90vh] overflow-y-auto"
    >
      <div className="overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-gray-800">
        <ModalHeader
          title={
            editingItinerary
              ? t("itinerary.editItinerary")
              : t("itinerary.addItinerary")
          }
          type="primary"
          icon={MapPin}
          onClose={handleClose}
        />

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("itinerary.dateRange")}
            </label>
            <DatePicker
              mode="range"
              value={{
                start_date: formData.start_date
                  ? parseDateString(formData.start_date)
                  : null,
                end_date: formData.end_date
                  ? parseDateString(formData.end_date)
                  : null,
              }}
              onChange={(range) => {
                if (range === null) {
                  setFormData((prev) => ({
                    ...prev,
                    start_date: "",
                    end_date: "",
                  }));
                  if (errors.start_date)
                    setErrors((prev) => ({ ...prev, start_date: "" }));
                  if (errors.end_date)
                    setErrors((prev) => ({ ...prev, end_date: "" }));
                } else if (
                  range &&
                  typeof range === "object" &&
                  "start_date" in range &&
                  "end_date" in range
                ) {
                  setFormData((prev) => ({
                    ...prev,
                    start_date: range.start_date
                      ? formatDateForForm(range.start_date)
                      : "",
                    end_date: range.end_date
                      ? formatDateForForm(range.end_date)
                      : "",
                  }));
                  if (errors.start_date)
                    setErrors((prev) => ({ ...prev, start_date: "" }));
                  if (errors.end_date)
                    setErrors((prev) => ({ ...prev, end_date: "" }));
                }
              }}
              placeholder={t("itinerary.dateRange")}
              disabled={isSubmitting || isSubmittingLocal}
              isInModal={true}
              showConfirmButton={true}
              minDate={new Date(travelStartDate)}
              maxDate={new Date(travelEndDate)}
              disabledDates={getDisabledDates()}
            />
            {(errors.start_date || errors.end_date) && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.start_date || errors.end_date}
              </p>
            )}
          </div>

          {/* Place Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("itinerary.cityOrPlace")}
            </label>
            {editingItinerary ? (
              // Show selected place as read-only when editing
              selectedPlace && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedPlace.name}
                    </span>
                  </div>
                  {selectedPlace.country && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedPlace.country}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {t("itinerary.cityCannotBeEdited")}
                  </p>
                </div>
              )
            ) : (
              // Allow place selection when creating new itinerary
              <>
                <MapBoxPlaces
                  onSelect={handlePlaceSelect}
                  countries={false}
                  countryCodes={countryCodes
                    .map((code) => Object.keys(code)[0])
                    .filter((code) => code && code.length === 2)}
                  searchType="itinerary"
                />
                {selectedPlace && (
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedPlace.name}
                      </span>
                    </div>
                    {selectedPlace.country && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {selectedPlace.country}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
            {errors.place && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {errors.place}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("itinerary.notes")}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder={t(
                "itinerary.notesPlaceholder",
                "Add any additional notes..."
              )}
              disabled={isSubmitting || isSubmittingLocal}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            {editingItinerary && (
              <button
                type="button"
                onClick={handleDeleteItinerary}
                className="flex-1 px-4 py-3 border border-red-300 dark:border-red-600 rounded-lg text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || isSubmittingLocal || isDeleting}
              >
                {isDeleting ? t("common.deleting") : t("common.delete")}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isSubmitting || isSubmittingLocal || isDeleting}
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || isSubmittingLocal || isDeleting}
            >
              {isSubmitting || isSubmittingLocal
                ? t("common.saving")
                : editingItinerary
                ? t("common.update")
                : t("common.save")}
            </button>
          </div>
        </form>
      </div>

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
    </ModalClean>
  );
}
