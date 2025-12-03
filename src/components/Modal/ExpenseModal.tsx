import React, { useState, useEffect, useRef } from "react";
import { Expense, ExpenseCategory } from "../../types";
import { useTranslation } from "react-i18next";
import ModalClean from "./ModalClean";
import { ModalHeader } from "./ModalHeader";
import { getCategoryKeys } from "../../data/categories";
import { Receipt } from "lucide-react";
import GooglePlaces from "../GooglePlaces";
import DatePicker, { DateRange } from "../DatePicker";
import { getTodayDate, formatDateForForm } from "../../utils/dateUtils";
import { mapPlaceTypesToCategory } from "../../utils/placeTypeCategoryMap";
import { useConfirm } from "../../hooks/useConfirm";
import { ModalConfirm } from "./ModalConfirm";
import { useCurrency } from "../../hooks/useCurrency";
import { useAnalytics } from "../../hooks/useAnalytics";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expenseData: Omit<Expense, "id">) => void;
  onDelete?: (expenseId: string) => void;
  editingExpense?: Expense | null;
  modalMode?: "daily" | "general";
  selectedDate?: string | null;
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

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onAddExpense,
  onDelete,
  editingExpense,
  modalMode = "daily",
  selectedDate,
  itineraryId,
  dailyPlan = [],
  start_date,
  end_date,
}) => {
  const { t } = useTranslation();
  const { trackEvent } = useAnalytics();
  const { confirmState, confirmDelete } = useConfirm();
  const { userCurrency } = useCurrency();

  // Track modal open time for analytics
  const modalOpenTime = useRef(Date.now());

  // Handle close with analytics tracking
  const handleClose = () => {
    trackEvent("expense_modal_closed", {
      modal_mode: modalMode,
      itinerary_id: itineraryId || '',
      had_user_input: !!(formData.title || formData.cost || formData.notes || selectedLocation),
      modal_open_duration: Date.now() - modalOpenTime.current,
      is_editing: !!editingExpense,
      expense_id: editingExpense?.id || '',
    });
    onClose();
  };
  const [formData, setFormData] = useState({
    title: "",
    cost: "",
    date: "",
    category: "food" as ExpenseCategory,
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

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        title: editingExpense.title,
        cost: editingExpense.cost.toString(),
        date:
          editingExpense.date ||
          (modalMode === "daily" && selectedDate
            ? selectedDate
            : modalMode === "general"
            ? ""
            : getTodayDate()),
        category: editingExpense.category,
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
      } else {
        setSelectedLocation(null);
      }
    } else {
      // For new expenses, use selectedDate if available (for daily expenses)
      // For general expenses, start with empty date
      const initialDate =
        modalMode === "daily" && selectedDate
          ? selectedDate
          : modalMode === "general"
          ? ""
          : getTodayDate();

      setFormData({
        title: "",
        cost: "",
        date: initialDate,
        category: "food" as ExpenseCategory,
        location: "",
        notes: "",
      });
      setSelectedLocation(null);
    }
  }, [editingExpense, isOpen, modalMode, selectedDate]);

  // Update formData when selectedLocation changes
  useEffect(() => {
    if (selectedLocation) {
      setFormData((prev) => ({
        ...prev,
        location: selectedLocation.name,
      }));
    }
  }, [selectedLocation]);

  // Track modal open/close events
  useEffect(() => {
    if (isOpen) {
      // Reset modal open time for tracking
      modalOpenTime.current = Date.now();
      
      // Track expense modal opened
      trackEvent("expense_modal_opened", {
        modal_mode: modalMode,
        itinerary_id: itineraryId || '',
        is_editing: !!editingExpense,
        expense_id: editingExpense?.id || '',
        expense_category: editingExpense?.category || '',
        has_selected_date: !!selectedDate,
      });
    }
  }, [isOpen, modalMode, itineraryId, editingExpense, selectedDate, trackEvent]);

  // Function to get location for expenses based on selected date
  const getLocationForDate = (date: string) => {
    const dayPlan = dailyPlan.find((day) => day.day === date);
    if (dayPlan && dayPlan.lat && dayPlan.lng) {
      return { lat: dayPlan.lat, lng: dayPlan.lng };
    }
    // Fallback to default location if no data found
    return { lat: 40.4168, lng: -3.7038 }; // Default to Madrid, Spain
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Title is now optional - no validation needed
    const costValue = parseFloat(formData.cost) || 0;
    if (costValue <= 0) newErrors.cost = t("validation.costRequired");
    // Only require date for daily expenses
    if (modalMode === "daily" && !formData.date)
      newErrors.date = t("validation.dateRequired");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚨 ExpenseModal - handleSubmit ejecutándose");
    if (!validateForm()) return;
    
    try {
      // Track expense creation/edit started
      trackEvent(editingExpense ? "expense_edit_started" : "expense_create_started", {
        modal_mode: modalMode,
        itinerary_id: itineraryId || '',
        expense_category: formData.category,
        cost_amount: Number(formData.cost),
        has_location: !!selectedLocation,
        has_notes: !!formData.notes,
        currency: userCurrency,
        expense_id: editingExpense?.id || '',
      });

      console.log("🚨 ExpenseModal - Llamando a onAddExpense con datos:", {
        ...formData,
        title: formData.title.trim() || t("form.defaultExpenseTitle"),
        cost: Number(formData.cost),
        date:
          formData.date && formData.date.trim() !== "" ? formData.date : null,
        currency: userCurrency,
        itinerary_id: itineraryId,
        ...(selectedLocation && {
          lat: selectedLocation.latitude,
          lng: selectedLocation.longitude,
          place_id: selectedLocation.place_id,
          address: selectedLocation.address,
        }),
      });

      await onAddExpense({
        ...formData,
        title: formData.title.trim() || t("form.defaultExpenseTitle"), // Use translated default if title is empty
        cost: Number(formData.cost),
        date:
          formData.date && formData.date.trim() !== "" ? formData.date : null, // Allow null date for general expenses
        currency: userCurrency, // Usar la moneda del usuario
        itinerary_id: itineraryId,
        // Add location data if available
        ...(selectedLocation && {
          lat: selectedLocation.latitude,
          lng: selectedLocation.longitude,
          place_id: selectedLocation.place_id,
          address: selectedLocation.address,
        }),
      });

      // Track successful expense creation/edit
      trackEvent(editingExpense ? "expense_edit_success" : "expense_create_success", {
        modal_mode: modalMode,
        itinerary_id: itineraryId || '',
        expense_category: formData.category,
        cost_amount: Number(formData.cost),
        has_location: !!selectedLocation,
        has_notes: !!formData.notes,
        currency: userCurrency,
        expense_id: editingExpense?.id || '',
        modal_open_duration: Date.now() - modalOpenTime.current,
      });

      handleClose();
    } catch (error) {
      // Track failed expense creation/edit
      trackEvent(editingExpense ? "expense_edit_failed" : "expense_create_failed", {
        modal_mode: modalMode,
        itinerary_id: itineraryId || '',
        expense_category: formData.category,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        expense_id: editingExpense?.id || '',
      });
      // Los errores ya se manejan en el contexto
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value, // Keep cost as string for better UX
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleDateChange = (value: Date | DateRange | null) => {
    if (value instanceof Date) {
      const formattedDate = formatDateForForm(value);
      setFormData((prev) => ({
        ...prev,
        date: formattedDate,
      }));
      if (errors.date) {
        setErrors((prev) => ({ ...prev, date: "" }));
      }
    } else if (value === null) {
      // Handle clearing the date
      setFormData((prev) => ({
        ...prev,
        date: "",
      }));
      if (errors.date) {
        setErrors((prev) => ({ ...prev, date: "" }));
      }
    }
    // Ignore DateRange for single date picker
  };

  const handleLocationSelect = (place: {
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

    // Auto-select category based on place type
    if (place.place_type) {
      const category = mapPlaceTypesToCategory([place.place_type]);
      setFormData((prev) => ({
        ...prev,
        category: category as ExpenseCategory,
      }));
    }
  };

  const handleDeleteExpense = async () => {
    if (!editingExpense || !onDelete) return;

    // Track delete confirmation shown
    trackEvent("expense_delete_confirmation_shown", {
      expense_id: editingExpense.id,
      expense_category: editingExpense.category,
      cost_amount: editingExpense.cost,
      itinerary_id: itineraryId || '',
      modal_mode: modalMode,
    });

    const confirmed = await confirmDelete(
      t("common.deleteExpense"),
      t("common.deleteExpenseConfirm", { title: editingExpense.title }),
      t("common.delete")
    );

    if (confirmed) {
      // Track successful expense deletion
      trackEvent("expense_delete_success", {
        expense_id: editingExpense.id,
        expense_category: editingExpense.category,
        cost_amount: editingExpense.cost,
        itinerary_id: itineraryId || '',
        modal_mode: modalMode,
        modal_open_duration: Date.now() - modalOpenTime.current,
      });
      
      onDelete(editingExpense.id);
      handleClose();
    } else {
      // Track cancelled expense deletion
      trackEvent("expense_delete_cancelled", {
        expense_id: editingExpense.id,
        expense_category: editingExpense.category,
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
            editingExpense ? t("common.editExpense") : t("pages.newExpense")
          }
          type="primary"
          icon={Receipt}
          onClose={handleClose}
        />
        <form onSubmit={handleSubmit} noValidate className="space-y-4 p-6">
          {/* Date - Show for daily expenses or general expenses with optional date */}
          {modalMode === "daily" || modalMode === "general" ? (
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
                    className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    {t("common.removeDate")}
                  </button>
                )}
              </div>
              <DatePicker
                value={formData.date ? new Date(formData.date) : null}
                onChange={handleDateChange}
                placeholder={
                  modalMode === "general"
                    ? t("form.dateOptional")
                    : t("placeholders.selectDate")
                }
                className={`w-full ${errors.date ? "border-red-500" : ""}`}
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
              {t("form.title")} ({t("form.optional")})
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder={t("form.defaultExpenseTitle")}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t("form.leaveEmptyForGeneral")}
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("form.locationOptional")}
            </label>
            <GooglePlaces
              onSelect={handleLocationSelect}
              location={
                selectedDate
                  ? getLocationForDate(selectedDate)
                  : getLocationForDate("")
              }
              radius={5000}
              initialValue={selectedLocation?.name || formData.location}
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

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("form.amount")}
            </label>
            <input
              type="text"
              value={formData.cost}
              onChange={(e) => {
                // Only allow numbers and decimal point
                const value = e.target.value.replace(/[^0-9.]/g, "");
                // Prevent multiple decimal points
                if (value.split(".").length <= 2) {
                  handleInputChange("cost", value);
                }
              }}
              onFocus={(e) => e.target.select()}
              placeholder="0"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                errors.cost
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {errors.cost && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.cost}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("form.category")}
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {getCategoryKeys().map((key) => (
                <option key={key} value={key}>
                  {t(`categories.${key}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("form.notesOptional")}
            </label>
            <div className="relative">
              <Receipt
                size={18}
                className="absolute left-3 top-3 text-gray-400 dark:text-gray-500"
              />
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder={t("placeholders.expenseNotes")}
                rows={3}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t("common.cancel")}
            </button>
            {editingExpense && onDelete && (
              <button
                type="button"
                onClick={handleDeleteExpense}
                className="px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors dark:text-red-300 dark:border-red-600 dark:hover:bg-red-700"
              >
                {t("common.delete")}
              </button>
            )}
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {editingExpense ? "Update" : "Add"}
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
