import React, { useState, useEffect, useRef } from "react";
import {
  Activity as ActivityType,
  ExpenseCategory,
} from "../../types";
import { useTranslation } from "react-i18next";
import ModalClean from "./ModalClean";
import { ModalHeader } from "./ModalHeader";
import { getCategoryKeys } from "../../data/categories";
import { Clock, MapPin } from "lucide-react";
import DatePicker from "../DatePicker";
import GooglePlaces from "../GooglePlaces";
import { mapPlaceTypesToCategory } from "../../utils/placeTypeCategoryMap";
import { useConfirm } from "../../hooks/useConfirm";
import { ModalConfirm } from "./ModalConfirm";
import { useAnalytics } from "../../hooks/useAnalytics";

interface ExtendedActivity {
  location?: string;
  lat?: number;
  lng?: number;
  place_id?: string;
  rating?: number;
  reviews_count?: number;
  address?: string;
  google_category?: string;
}

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  travelId?: string;
  onSubmit: (
    activityData: Omit<ActivityType, "id" | "completed">,
    isEdit: boolean
  ) => void;
  onDelete?: (activityId: string) => void;
  editingActivity?: ActivityType | null;
  editingDate?: string | null;
  modalMode?: "planned" | "general";
  itineraryId?: string;
  dailyPlan?: Array<{
    day: string;
    lat?: number;
    lng?: number;
    name?: string | null;
  }>;
  start_date?: string;
  end_date?: string;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  editingActivity,
  editingDate,
  modalMode = "planned",
  itineraryId,
  dailyPlan = [],
  start_date,
  end_date,
}) => {
  const { t } = useTranslation();
  const { trackEvent } = useAnalytics();
  const { confirmState, confirmDelete } = useConfirm();

  // Track modal open time for analytics
  const modalOpenTime = useRef(Date.now());

  // Handle close with analytics tracking
  const handleClose = () => {
    trackEvent("activity_modal_closed", {
      modal_mode: modalMode,
      itinerary_id: itineraryId || '',
      had_user_input: !!(formData.title || formData.description || formData.cost > 0 || selectedLocation),
      modal_open_duration: Date.now() - modalOpenTime.current,
      is_editing: !!editingActivity,
      activity_id: editingActivity?.id || '',
    });
    onClose();
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    cost: 0,
    category: "sightseeing" as ExpenseCategory,
    priority: "medium" as "high" | "medium" | "low",
  });

  const [selectedLocation, setSelectedLocation] = useState<{
  name: string;
  latitude?: number;
  longitude?: number;
    place_id?: string;
    rating?: number;
    reviews_count?: number;
    address?: string;
    google_category?: string;
  } | null>(null);

  useEffect(() => {
    if (editingActivity) {
      const dateValue = editingDate
        ? ("date" in editingActivity ? editingActivity.date : editingDate) ||
          editingDate ||
          ""
        : "";

      setFormData({
        title: editingActivity.title,
        description: editingActivity.description || "",
        date: dateValue,
        time: editingActivity.time || "",
        cost: editingActivity.cost,
        category: editingActivity.category,
        priority: editingActivity.priority,
      });

      // Load location data if available
      const extendedActivity = editingActivity as ExtendedActivity;
      if (
        editingActivity.location ||
        extendedActivity.lat ||
        extendedActivity.lng
      ) {
          setSelectedLocation({
            name: editingActivity.location || "",
            latitude:
              typeof extendedActivity.lat === "number"
                ? extendedActivity.lat
                : undefined,
            longitude:
              typeof extendedActivity.lng === "number"
                ? extendedActivity.lng
                : undefined,
            place_id: extendedActivity.place_id,
            rating: extendedActivity.rating,
            reviews_count: extendedActivity.reviews_count,
            address: extendedActivity.address,
            google_category: extendedActivity.google_category,
          });
      } else {
        setSelectedLocation(null);
      }
    } else {
      // For new activities, use editingDate if available (for planned activities)
      const initialDate =
        modalMode === "planned" && editingDate ? editingDate : "";

      setFormData({
        title: "",
        description: "",
        date: initialDate,
        time: "",
        cost: 0,
        category: "sightseeing",
        priority: "medium",
      });

      // Clear location data for new activities
      setSelectedLocation(null);
    }

    // Clear errors when modal opens
    setErrors({});
  }, [editingActivity, editingDate, isOpen, modalMode]);

  // Track modal open/close events
  useEffect(() => {
    if (isOpen) {
      // Reset modal open time for tracking
      modalOpenTime.current = Date.now();
      
      // Track activity modal opened
      trackEvent("activity_modal_opened", {
        modal_mode: modalMode,
        itinerary_id: itineraryId || '',
        is_editing: !!editingActivity,
        activity_id: editingActivity?.id || '',
        activity_category: editingActivity?.category || '',
        has_editing_date: !!editingDate,
      });
    }
  }, [isOpen, modalMode, itineraryId, editingActivity, editingDate, trackEvent]);

  // Additional effect to ensure form is reset when modal opens
  useEffect(() => {
    if (isOpen && !editingActivity) {
      // Force reset for new activities
      const initialDate =
        modalMode === "planned" && editingDate ? editingDate : "";
      setFormData({
        title: "",
        description: "",
        date: initialDate,
        time: "",
        cost: 0,
        category: "sightseeing",
        priority: "medium",
      });
      setErrors({});
    }
  }, [isOpen, editingActivity, modalMode, editingDate]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = t("validation.required");
    }
    // Only require date for planned activities or when editing a planned activity
    if (modalMode === "planned" && !formData.date) {
      newErrors.date = t("validation.required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Track activity creation/edit started
      trackEvent(editingActivity ? "activity_edit_started" : "activity_create_started", {
        modal_mode: modalMode,
        itinerary_id: itineraryId || '',
        activity_category: formData.category,
        cost_amount: formData.cost,
        has_location: !!selectedLocation,
        has_description: !!formData.description,
        priority: formData.priority,
        activity_id: editingActivity?.id || '',
      });

      try {
        onSubmit(
          {
            title: formData.title.trim(),
            description: formData.description.trim(),
            date:
              formData.date && formData.date.trim() !== "" ? formData.date : null,
            time: formData.time || undefined,
            cost: formData.cost,
            category: formData.category,
            priority: formData.priority,
            lat: selectedLocation?.latitude,
            lng: selectedLocation?.longitude,
            location: selectedLocation?.name,
            place_id: selectedLocation?.place_id,
            rating: selectedLocation?.rating,
            reviews_count: selectedLocation?.reviews_count,
            address: selectedLocation?.address,
            google_category: selectedLocation?.google_category,
            itinerary_id: itineraryId,
          },
          !!editingActivity
        );

        // Track successful activity creation/edit
        trackEvent(editingActivity ? "activity_edit_success" : "activity_create_success", {
          modal_mode: modalMode,
          itinerary_id: itineraryId || '',
          activity_category: formData.category,
          cost_amount: formData.cost,
          has_location: !!selectedLocation,
          has_description: !!formData.description,
          priority: formData.priority,
          activity_id: editingActivity?.id || '',
          modal_open_duration: Date.now() - modalOpenTime.current,
        });

        handleClose();
      } catch (error) {
        // Track failed activity creation/edit
        trackEvent(editingActivity ? "activity_edit_failed" : "activity_create_failed", {
          modal_mode: modalMode,
          itinerary_id: itineraryId || '',
          activity_category: formData.category,
          error_message: error instanceof Error ? error.message : 'Unknown error',
          activity_id: editingActivity?.id || '',
        });
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "cost" ? parseFloat(value) || 0 : value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleLocationSelect = (place: {
    name: string;
    latitude: number;
    longitude: number;
    place_id?: string;
    rating?: number;
    reviews_count?: number;
    address?: string;
    google_category?: string;
    place_type?: string;
  }) => {
    setSelectedLocation(place);

    // Auto-select category based on place type
    if (place.place_type) {
      const category = mapPlaceTypesToCategory([place.place_type]);
      setFormData((prev) => ({
        ...prev,
        category: category as ExpenseCategory,
      }));
    }
  };

  // Function to get location for the selected date
  const getLocationForDate = (date: string) => {
    const dayPlan = dailyPlan.find((day) => day.day === date);
    if (dayPlan && dayPlan.lat && dayPlan.lng) {
      return { lat: dayPlan.lat, lng: dayPlan.lng };
    }
    // Fallback to default location if no data found
    return { lat: -27.366089, lng: -55.893475 }; // Default to Posadas, Argentina
  };

  const handleDeleteActivity = async () => {
    if (!editingActivity || !onDelete) return;

    // Track delete confirmation shown
    trackEvent("activity_delete_confirmation_shown", {
      activity_id: editingActivity.id,
      activity_category: editingActivity.category,
      cost_amount: editingActivity.cost,
      itinerary_id: itineraryId || '',
      modal_mode: modalMode,
    });

    const confirmed = await confirmDelete(
      t("common.deleteActivity"),
      t("common.deleteActivityConfirm", { title: editingActivity.title }),
      t("common.delete")
    );

    if (confirmed) {
      // Track successful activity deletion
      trackEvent("activity_delete_success", {
        activity_id: editingActivity.id,
        activity_category: editingActivity.category,
        cost_amount: editingActivity.cost,
        itinerary_id: itineraryId || '',
        modal_mode: modalMode,
        modal_open_duration: Date.now() - modalOpenTime.current,
      });
      
      onDelete(editingActivity.id);
      handleClose();
    } else {
      // Track cancelled activity deletion
      trackEvent("activity_delete_cancelled", {
        activity_id: editingActivity.id,
        activity_category: editingActivity.category,
        itinerary_id: itineraryId || '',
        modal_mode: modalMode,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <ModalClean isOpen={isOpen} onClose={handleClose} className="max-w-md">
      <div className="overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-gray-800">
        <ModalHeader
          title={
            editingActivity ? t("common.editActivity") : t("pages.newActivity")
          }
          type="primary"
          icon={MapPin}
          onClose={handleClose}
        />
        <form onSubmit={handleSubmit} noValidate className="space-y-4 p-6">
          {/* Date - Show for planned activities or general activities with optional date */}
          {(modalMode === "planned" && (!editingActivity || editingDate)) ||
          modalMode === "general" ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {modalMode === "general"
                    ? t("form.dateOptional")
                    : t("form.date")}
                </label>
                {modalMode === "general" && formData.date && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, date: "" }));
                      if (errors.date) {
                        setErrors((prev) => ({ ...prev, date: "" }));
                      }
                    }}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    {t("common.removeDate")}
                  </button>
                )}
              </div>
              <DatePicker
                mode="single"
                value={formData.date ? new Date(formData.date) : null}
                onChange={(date) => {
                  if (date instanceof Date && !isNaN(date.getTime())) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");
                    const dateString = `${year}-${month}-${day}`;
                    setFormData((prev) => ({
                      ...prev,
                      date: dateString,
                    }));
                    if (errors.date) {
                      setErrors((prev) => ({ ...prev, date: "" }));
                    }
                  } else if (date === null) {
                    // Handle clearing the date
                    setFormData((prev) => ({
                      ...prev,
                      date: "",
                    }));
                    if (errors.date) {
                      setErrors((prev) => ({ ...prev, date: "" }));
                    }
                  }
                }}
                placeholder={
                  modalMode === "general"
                    ? t("form.dateOptional")
                    : t("form.date")
                }
                isInModal={true}
                minDate={start_date ? new Date(start_date) : undefined}
                maxDate={end_date ? new Date(end_date) : undefined}
              />
              {errors.date && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {errors.date}
                </p>
              )}
            </div>
          ) : null}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("form.title")}
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder={t("placeholders.activityTitle")}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                errors.title
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {errors.title && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.title}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("form.locationOptional")}
            </label>
            <GooglePlaces
              onSelect={handleLocationSelect}
              location={
                editingDate ? getLocationForDate(editingDate) : undefined
              }
              radius={5000}
              initialValue={selectedLocation?.name || ""}
              initialDetails={
                selectedLocation
                  ? {
                      name: selectedLocation.name,
                      address: selectedLocation.address,
                      rating: selectedLocation.rating,
                      reviews_count: selectedLocation.reviews_count,
                      place_id: selectedLocation.place_id,
                    }
                  : undefined
              }
            />
          </div>

          {/* Time & Cost */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("form.timeOptional")}
              </label>
              <div className="relative">
                <Clock
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("form.cost")}
              </label>
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => handleInputChange("cost", e.target.value)}
                onFocus={(e) => e.target.select()}
                onWheel={(e) => e.currentTarget.blur()}
                min="0"
                step="1"
                placeholder="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("form.category")}
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              >
                {getCategoryKeys().map((key) => (
                  <option key={key} value={key}>
                    {t(`categories.${key}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("form.priority")}
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange("priority", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              >
                <option value="low">{t("priority.low")}</option>
                <option value="medium">{t("priority.medium")}</option>
                <option value="high">{t("priority.high")}</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("form.descriptionOptional")}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder={t("placeholders.activityDescription")}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              {t("common.cancel")}
            </button>
            {editingActivity && onDelete && (
              <button
                type="button"
                onClick={handleDeleteActivity}
                className="px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors dark:text-red-300 dark:border-red-600 dark:hover:bg-red-700"
              >
                {t("common.delete")}
              </button>
            )}
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {editingActivity ? "Update" : "Add"}
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
};
