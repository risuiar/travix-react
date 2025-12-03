import React, { useState, useEffect, useCallback, useRef } from "react";
import { Travel, TravelFormValues } from "../../types";
import { useTranslation } from "react-i18next";
import ModalClean from "./ModalClean";
import { ModalHeader } from "./ModalHeader";
import { MapPin } from "lucide-react";
import {
  getTodayDate,
  getNextWeekDate,
  parseDateString,
  formatDateForForm,
} from "../../utils/dateUtils";
import DatePicker from "../DatePicker";
import CountryChipSelector from "../CountryChipSelector";

import { createTrip } from "../../utils/api/travelApi";
// useTravelList y useTravel eliminados - usando nuevas funciones independientes

import { useUserAuthContext } from "../../contexts/useUserAuthContext";
import { useConfirm } from "../../hooks/useConfirm";
import { ModalConfirm } from "./ModalConfirm";
import { useDeleteTravel } from "../../utils/queries";
import { useNavigate } from "react-router-dom";
import { useAnalytics } from "../../hooks/useAnalytics";

interface TripModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Modo antiguo
  onAddTrip?: (tripData: TravelFormValues) => void;
  editTrip?: Travel;
  // Modo nuevo
  initialValues?: TravelFormValues;
  mode?: "create" | "edit";
  onSubmit?: (values: TravelFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

export const TripModal: React.FC<TripModalProps> = ({
  isOpen,
  onClose,
  onAddTrip,
  editTrip,
  initialValues,
  mode,
  onSubmit,
  isSubmitting = false,
}) => {
  const { t } = useTranslation();
  const { trackEvent } = useAnalytics();
  const { userAuthData } = useUserAuthContext();
  const { confirmState, confirmDelete } = useConfirm();
  const deleteTravelMutation = useDeleteTravel();
  const navigate = useNavigate();

  // Track modal open time for analytics
  const modalOpenTime = useRef(Date.now());

  // Handle close with analytics tracking
  const handleClose = () => {
    trackEvent("trip_modal_closed", {
      had_user_input: !!(formData.name || formData.budget > 0 || formData.country_codes.length > 0),
      modal_open_duration: Date.now() - modalOpenTime.current,
      is_editing: !!(editTrip || mode === 'edit'),
      trip_id: editTrip?.id || '',
      mode: mode || (editTrip ? 'edit' : 'create'),
    });
    onClose();
  };

  // Obtener el símbolo de la moneda del perfil del usuario
  const userCurrencySymbol = userAuthData?.default_currency || "EUR";

  // Por ahora, updateTrip no está disponible (será migrado en el futuro)
  // const updateTrip:
  //   | ((tripData: TravelFormValues) => Promise<Travel>)
  //   | undefined = undefined;

  const [submitting, setSubmitting] = useState(false);

  // Usar solo una variable de loading para evitar conflictos
  const isLoading = submitting || isSubmitting;

  // Determinar valores iniciales
  const getInitialValues = useCallback((): TravelFormValues => {
    if (initialValues) return initialValues;
    if (editTrip) {
      // Convertir country_codes de estructura antigua a nueva si es necesario
      let normalizedCountryCodes = editTrip.country_codes || [];

      // Si country_codes es un array de strings, convertirlo a la nueva estructura
      if (
        Array.isArray(normalizedCountryCodes) &&
        normalizedCountryCodes.length > 0
      ) {
        const firstItem = normalizedCountryCodes[0];
        if (typeof firstItem === "string") {
          // Es la estructura antigua, convertir a la nueva
          normalizedCountryCodes = (
            normalizedCountryCodes as unknown as string[]
          ).map((code) => ({ [code]: code }));
        }
      }

      const values = {
        name: editTrip.name,
        start_date: editTrip.start_date,
        end_date: editTrip.end_date,
        budget: editTrip.budget,
        country_codes: normalizedCountryCodes,
      };

      return values;
    }
    return {
      name: "",
      start_date: getTodayDate(),
      end_date: getNextWeekDate(),
      budget: 0,
      country_codes: [],
    };
  }, [initialValues, editTrip]);

  const [formData, setFormData] = useState<TravelFormValues>({
    name: "",
    start_date: "",
    end_date: "",
    budget: 0,
    country_codes: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Actualizar formData cuando cambian los valores iniciales
  useEffect(() => {
    const initialValues = getInitialValues();

    setFormData(initialValues);
  }, [getInitialValues]);

  // Track modal open events
  useEffect(() => {
    if (isOpen) {
      // Reset modal open time for tracking
      modalOpenTime.current = Date.now();
      
      // Track trip modal opened
      trackEvent("trip_modal_opened", {
        is_editing: !!(editTrip || mode === 'edit'),
        trip_id: editTrip?.id || '',
        mode: mode || (editTrip ? 'edit' : 'create'),
        has_initial_values: !!initialValues,
      });
    }
  }, [isOpen, editTrip, mode, initialValues, trackEvent]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = t("validation.required");
    if (formData.country_codes.length === 0)
      newErrors.destinations = t("validation.required");
    if (!formData.start_date) newErrors.start_date = t("validation.required");
    if (!formData.end_date) newErrors.end_date = t("validation.required");

    if (formData.start_date && formData.end_date) {
      const start_date = parseDateString(formData.start_date);
      const end_date = parseDateString(formData.end_date);
      if (start_date >= end_date) {
        newErrors.end_date = t("validation.end_dateAfterStart");
      }
    }

    if (formData.budget <= 0) newErrors.budget = t("validation.positiveAmount");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "budget" ? parseFloat(value) || 0 : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCountryCodesChange = (
    country_codes: Array<Record<string, string>>
  ) => {
    setFormData((prev) => {
      return {
        ...prev,
        country_codes,
      };
    });
    if (errors.destinations) {
      setErrors((prev) => ({ ...prev, destinations: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Track trip submission started
    const isEdit = !!(mode === 'edit' || editTrip);
    trackEvent(isEdit ? "trip_edit_started" : "trip_create_started", {
      trip_name: formData.name,
      budget_amount: formData.budget,
      countries_count: formData.country_codes.length,
      date_range_days: formData.start_date && formData.end_date ? 
        Math.ceil((new Date(formData.end_date).getTime() - new Date(formData.start_date).getTime()) / (1000 * 60 * 60 * 24)) : 0,
      trip_id: editTrip?.id || '',
      currency: userCurrencySymbol,
    });

    setSubmitting(true);
    try {
      if (onSubmit) {
        // Modo nuevo - usar onSubmit callback
        await onSubmit(formData);
        
        // Track successful trip operation (new mode)
        trackEvent(isEdit ? "trip_edit_success" : "trip_create_success", {
          trip_name: formData.name,
          budget_amount: formData.budget,
          countries_count: formData.country_codes.length,
          trip_id: editTrip?.id || '',
          modal_open_duration: Date.now() - modalOpenTime.current,
          submission_mode: 'new',
        });
      } else if (onAddTrip) {
        // Modo antiguo - usar onAddTrip callback
        // Crear un objeto que coincida con el tipo esperado
        const tripData = {
          name: formData.name,
          start_date: formData.start_date,
          end_date: formData.end_date,
          budget: formData.budget,
          bbox: formData.bbox || [],
          country_codes: formData.country_codes,
        };

        await onAddTrip(tripData);
        
        // Track successful trip operation (legacy mode)
        trackEvent("trip_create_success", {
          trip_name: formData.name,
          budget_amount: formData.budget,
          countries_count: formData.country_codes.length,
          modal_open_duration: Date.now() - modalOpenTime.current,
          submission_mode: 'legacy',
        });
      } else {
        // Crear viaje usando la nueva función independiente
        if (!userAuthData) {
          throw new Error("No user found");
        }

        await createTrip(formData, userAuthData.id);
        
        // Track successful trip creation (independent mode)
        trackEvent("trip_create_success", {
          trip_name: formData.name,
          budget_amount: formData.budget,
          countries_count: formData.country_codes.length,
          modal_open_duration: Date.now() - modalOpenTime.current,
          submission_mode: 'independent',
          user_id: userAuthData.id,
        });
        
        handleClose();
      }
    } catch (error) {
      // Track failed trip operation
      trackEvent(isEdit ? "trip_edit_failed" : "trip_create_failed", {
        trip_name: formData.name,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        trip_id: editTrip?.id || '',
      });
      
      // Los errores ya se manejan en el contexto
      console.error("Error in TripModal:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getModalTitle = (): string => {
    if (mode) {
      return mode === "edit" ? t("trip.editTrip") : t("trip.createNewTrip");
    }
    return editTrip ? t("trip.editTrip") : t("trip.createNewTrip");
  };

  const handleDeleteTrip = async () => {
    if (!editTrip) return;

    // Track delete confirmation shown
    trackEvent("trip_delete_confirmation_shown", {
      trip_id: editTrip.id,
      trip_name: editTrip.name,
      budget_amount: editTrip.budget,
      countries_count: editTrip.country_codes?.length || 0,
    });

    // Primera confirmación
    const firstConfirmed = await confirmDelete(
      t("common.deleteTrip"),
      t("common.deleteTripConfirm", { title: editTrip.name }),
      t("common.delete")
    );

    if (firstConfirmed) {
      // Track first confirmation accepted
      trackEvent("trip_delete_first_confirmation_accepted", {
        trip_id: editTrip.id,
        trip_name: editTrip.name,
      });

      // Segunda confirmación con advertencia más fuerte
      const finalConfirmed = await confirmDelete(
        t("common.warning"),
        t("common.deleteTripFinalConfirm"),
        t("common.delete")
      );

      if (finalConfirmed) {
        // Track final confirmation accepted
        trackEvent("trip_delete_final_confirmation_accepted", {
          trip_id: editTrip.id,
          trip_name: editTrip.name,
        });

        try {
          await deleteTravelMutation.mutateAsync(editTrip.id);

          // Track successful trip deletion
          trackEvent("trip_delete_success", {
            trip_id: editTrip.id,
            trip_name: editTrip.name,
            budget_amount: editTrip.budget,
            countries_count: editTrip.country_codes?.length || 0,
            modal_open_duration: Date.now() - modalOpenTime.current,
          });

          // Redireccionar a /travels después de eliminar
          navigate("/travels");
        } catch (error) {
          // Track failed trip deletion
          trackEvent("trip_delete_failed", {
            trip_id: editTrip.id,
            trip_name: editTrip.name,
            error_message: error instanceof Error ? error.message : 'Unknown error',
          });
          
          console.error("Error deleting trip:", error);
        }
      } else {
        // Track final confirmation cancelled
        trackEvent("trip_delete_final_confirmation_cancelled", {
          trip_id: editTrip.id,
          trip_name: editTrip.name,
        });
      }
    } else {
      // Track first confirmation cancelled
      trackEvent("trip_delete_first_confirmation_cancelled", {
        trip_id: editTrip.id,
        trip_name: editTrip.name,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <ModalClean isOpen={isOpen} onClose={handleClose} className="max-w-lg">
      <div className="overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-gray-800">
        <ModalHeader
          title={getModalTitle()}
          type="primary"
          icon={MapPin}
          onClose={handleClose}
        />
        <form onSubmit={handleSubmit} noValidate className="space-y-4 p-6">
          {/* Fechas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("trip.stayDuration")} <span className="text-red-500">*</span>
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
                  // Usar formatDateForForm para asegurar formato UTC puro
                  const formattedStartDate = range.start_date
                    ? formatDateForForm(range.start_date)
                    : "";
                  const formattedEndDate = range.end_date
                    ? formatDateForForm(range.end_date)
                    : "";
                    
                  setFormData((prev) => ({
                    ...prev,
                    start_date: formattedStartDate,
                    end_date: formattedEndDate,
                  }));
                  if (errors.start_date)
                    setErrors((prev) => ({ ...prev, start_date: "" }));
                  if (errors.end_date)
                    setErrors((prev) => ({ ...prev, end_date: "" }));
                }
              }}
              placeholder={t("trip.stayDuration")}
              disabled={isSubmitting}
              isInModal={true}
            />
            {(errors.start_date || errors.end_date) && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.start_date || errors.end_date}
              </p>
            )}
          </div>

          {/* Nombre del Viaje */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("trip.name")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder={t("placeholders.tripName")}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                errors.name
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              required
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* Destinos */}
          <div>
            <CountryChipSelector
              country_codes={formData.country_codes}
              onCountryCodesChange={handleCountryCodesChange}
              disabled={isLoading}
            />
            {errors.destinations && (
              <p className="text-sm text-red-600 mt-1">{errors.destinations}</p>
            )}
          </div>

          {/* Presupuesto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("trip.budget")} ({userCurrencySymbol}){" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              onFocus={(e) => e.target.select()}
              onWheel={(e) => e.currentTarget.blur()}
              min="0"
              step="1"
              placeholder={t("placeholders.budget")}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                errors.budget
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              required
              disabled={isLoading}
            />
            {errors.budget && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.budget}
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t("common.cancel")}
            </button>
            {(mode === "edit" || editTrip) && (
              <button
                type="button"
                onClick={handleDeleteTrip}
                disabled={isLoading || deleteTravelMutation.isPending}
                className="px-6 py-3 border border-red-300 dark:border-red-600 rounded-lg text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteTravelMutation.isPending
                  ? t("common.deleting")
                  : t("common.delete")}
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t("common.loading")}
                </div>
              ) : mode === "edit" || editTrip ? (
                t("common.save")
              ) : (
                t("trip.createNewTrip")
              )}
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
