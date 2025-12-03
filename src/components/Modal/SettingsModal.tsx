import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useLanguage } from "../../hooks/useLanguage";
import { useToast } from "../../hooks/useToast";
import { useCurrency } from "../../hooks/useCurrency";
import { useTheme } from "../../hooks/useTheme";
import { useUserAuthContext } from "../../contexts/useUserAuthContext";
import { useVersion } from "../../hooks/useVersion";
import { supabase } from "../../supabaseClient";
import ModalClean from "./ModalClean";
import { ModalHeader } from "./ModalHeader";
import { Settings, Sun, Moon, Monitor } from "lucide-react";
import Dropdown, { DropdownOption } from "../Dropdown";
import { UserTierBadge } from "../UserTierBadge";
import { getCurrencyDisplay } from "../../utils/currency";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userAuthData } = useUserAuthContext();
  const { currentLanguage, setLanguage } = useLanguage();
  const { showSuccessToast, showErrorToast } = useToast();
  const { userCurrency, setUserCurrency } = useCurrency();
  const { currentTheme, setTheme } = useTheme();
  const version = useVersion();
  const [imgError, setImgError] = useState(false);
  const [saving, setSaving] = useState(false);

  // Settings state
  const [defaultCurrency, setDefaultCurrency] = useState("EUR");
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const [tripReminders, setTripReminders] = useState(false);
  const [budgetAlerts, setBudgetAlerts] = useState(false);
  const [activityReminders, setActivityReminders] = useState(false);

  const currencyOptions: DropdownOption[] = [
    { value: "USD", label: getCurrencyDisplay("USD") },
    { value: "EUR", label: getCurrencyDisplay("EUR") },
    { value: "GBP", label: getCurrencyDisplay("GBP") },
    { value: "JPY", label: getCurrencyDisplay("JPY") },
    { value: "CAD", label: getCurrencyDisplay("CAD") },
    { value: "AUD", label: getCurrencyDisplay("AUD") },
    { value: "CHF", label: getCurrencyDisplay("CHF") },
    { value: "CNY", label: getCurrencyDisplay("CNY") },
    { value: "INR", label: getCurrencyDisplay("INR") },
    { value: "BRL", label: getCurrencyDisplay("BRL") },
    { value: "MXN", label: getCurrencyDisplay("MXN") },
    { value: "ARS", label: getCurrencyDisplay("ARS") },
    { value: "CLP", label: getCurrencyDisplay("CLP") },
    { value: "COP", label: getCurrencyDisplay("COP") },
    { value: "PEN", label: getCurrencyDisplay("PEN") },
    { value: "UYU", label: getCurrencyDisplay("UYU") },
    { value: "VEF", label: getCurrencyDisplay("VEF") },
  ];

  const languageOptions: DropdownOption[] = [
    { value: "es", label: t("language.es") },
    { value: "en", label: t("language.en") },
    { value: "de", label: t("language.de") },
    { value: "fr", label: t("language.fr") },
    { value: "it", label: t("language.it") },
  ];

  // Load saved settings on mount
  useEffect(() => {
    // Usar la moneda del contexto en lugar de localStorage
    setDefaultCurrency(userCurrency);

    // Cargar settings del perfil cacheado
    if (userAuthData) {
      if (userAuthData.theme)
        setSelectedTheme(userAuthData.theme as "light" | "dark" | "auto");
      if (userAuthData.language) setSelectedLanguage(userAuthData.language);
      if (typeof userAuthData.trip_reminders === "boolean")
        setTripReminders(userAuthData.trip_reminders);
      if (typeof userAuthData.budget_alerts === "boolean")
        setBudgetAlerts(userAuthData.budget_alerts);
      if (typeof userAuthData.activity_reminders === "boolean")
        setActivityReminders(userAuthData.activity_reminders);
    }
  }, [userAuthData, userCurrency]);

  // Sincronizar selectedLanguage con currentLanguage del contexto
  useEffect(() => {
    setSelectedLanguage(currentLanguage);
  }, [currentLanguage]);

  // Sincronizar selectedTheme con currentTheme del contexto
  useEffect(() => {
    setSelectedTheme(currentTheme);
  }, [currentTheme]);

  // Cambia el idioma de la app al seleccionar uno nuevo
  useEffect(() => {
    if (selectedLanguage && selectedLanguage !== currentLanguage) {
      setLanguage(selectedLanguage);
    }
  }, [selectedLanguage, currentLanguage, setLanguage]);

  // Cambia el idioma de la app al seleccionar uno nuevo
  // Removido para evitar llamadas duplicadas a updateProfile
  // useEffect(() => {
  //   if (selectedLanguage && selectedLanguage !== currentLanguage) {
  //     setLanguage(selectedLanguage);
  //   }
  // }, [selectedLanguage, currentLanguage, setLanguage]);

  const handleCurrencyChange = (option: DropdownOption) => {
    setDefaultCurrency(option.value);
    // Usar el contexto de moneda para actualizar inmediatamente
    setUserCurrency(option.value);
  };

  const handleThemeChange = (theme: "light" | "dark" | "auto") => {
    setSelectedTheme(theme);
    setTheme(theme); // Aplicar inmediatamente
  };

  const handleLogout = async () => {
    try {
      const { supabase } = await import("../../supabaseClient");
      await supabase.auth.signOut();
      onClose(); // Close the modal after logout
      navigate("/login"); // Redirigir al login
    } catch {
      // Error logging out
    }
  };

  // Guardar settings en el perfil del usuario
  const handleSaveSettings = async () => {
    if (!userAuthData) return;
    setSaving(true);

    try {
      // No incluir default_currency ya que se maneja a través del contexto
      const updates = {
        theme: selectedTheme,
        language: selectedLanguage,
        trip_reminders: tripReminders,
        budget_alerts: budgetAlerts,
        activity_reminders: activityReminders,
      };

      // Usar fetch directo a la tabla profiles en lugar de la vista user_auth_data
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userAuthData.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Mostrar toast de éxito
      showSuccessToast(t("settings.saveChanges"), t("settings.settingsSaved"));

      // Aplicar cambios inmediatamente
      if (selectedLanguage !== currentLanguage) {
        setLanguage(selectedLanguage);
      }
      if (selectedTheme !== currentTheme) {
        setTheme(selectedTheme);
      }

      onClose();
    } catch (error) {
      console.error("Error saving settings:", error);
      showErrorToast(
        t("common.status.error"),
        error instanceof Error ? error.message : t("common.status.error")
      );
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalClean isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-gray-800">
        <ModalHeader
          title={t("settings.title")}
          type="primary"
          icon={Settings}
          onClose={onClose}
        />
        <div className="p-6 space-y-6">
          {/* User Profile Section */}
          {userAuthData && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  {userAuthData?.avatar_url && !imgError ? (
                    <img
                      src={userAuthData.avatar_url}
                      alt="Profile"
                      className="w-12 h-12 rounded-full"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400 text-lg font-semibold">
                      {userAuthData?.email?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {userAuthData?.full_name || userAuthData?.email}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {userAuthData?.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  {t("settings.logout")}
                </button>
              </div>

              {/* User Tier Badge */}
              <div className="flex items-center justify-center">
                <UserTierBadge size="lg" />
              </div>
            </div>
          )}

          {/* Language Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t("settings.language")}
            </h3>
            <Dropdown
              options={languageOptions}
              value={selectedLanguage}
              onChange={(option) => setSelectedLanguage(option.value)}
            />
          </div>

          {/* Currency Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t("settings.defaultCurrency")}
            </h3>
            <Dropdown
              options={currencyOptions}
              value={defaultCurrency}
              onChange={handleCurrencyChange}
            />
          </div>

          {/* Theme Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t("settings.theme")}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleThemeChange("light")}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedTheme === "light"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
              >
                <Sun className="w-6 h-6 text-yellow-500 mb-2" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {t("theme.light")}
                </span>
              </button>

              <button
                onClick={() => handleThemeChange("dark")}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedTheme === "dark"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
              >
                <Moon className="w-6 h-6 text-blue-500 mb-2" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {t("theme.dark")}
                </span>
              </button>

              <button
                onClick={() => handleThemeChange("auto")}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedTheme === "auto"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
              >
                <Monitor className="w-6 h-6 text-gray-500 mb-2" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {t("theme.auto")}
                </span>
              </button>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t("settings.notifications")}
            </h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={tripReminders}
                  onChange={(e) => setTripReminders(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {t("settings.tripReminders")}
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={budgetAlerts}
                  onChange={(e) => setBudgetAlerts(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {t("settings.budgetAlerts")}
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={activityReminders}
                  onChange={(e) => setActivityReminders(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {t("settings.activityReminders")}
                </span>
              </label>
            </div>
          </div>

          {/* Version Info */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
              <span>Versión {version}</span>
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                BETA
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t("settings.close")}
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? t("common.status.loading") : t("settings.saveChanges")}
            </button>
          </div>
        </div>
      </div>
    </ModalClean>
  );
};
