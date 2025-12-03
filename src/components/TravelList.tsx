import React, { useState, useMemo, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, TrendingUp } from "lucide-react";

import { Travel, TravelFormValues } from "../types";
import { formatCurrency, getCurrencySymbol } from "../utils/currency";
import { gradientClasses } from "../lib/utils";
import { ProgressBar } from "./ProgressBar";
import {
  calculateTotalExpenses,
  calculateRemainingBudget,
} from "../utils/budget";
import { TripModal } from "./Modal/TripModal";
import { Header } from "./Header";
import { AdBannerResponsive } from "./AdBannerResponsive";
import { useAllTravelHeaders } from "../utils/hooks/useTravelQueries";
import { useCreateTravel } from "../utils/queries";
import { useLocalizedDates } from "../hooks/useLocalizedDates";
import { useCurrency } from "../hooks/useCurrency";
import { useUserAuthContext } from "../contexts/useUserAuthContext";
import { useConfirm } from "../hooks/useConfirm";
import { ModalConfirm } from "./Modal/ModalConfirm";
import { PremiumBanner } from "./PremiumBanner";
import { useAnalytics } from "../hooks/useAnalytics";

export const TravelList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // Usar solo el hook nuevo para datos, createTrip es independiente
  const { data: newTravels, isLoading: newLoading } = useAllTravelHeaders();

  // Mapear los datos nuevos al formato esperado por el componente
  const travels = useMemo(
    () =>
      newTravels?.map((header) => ({
        id: header.id.toString(),
        name: header.name,
        start_date: header.start_date,
        end_date: header.end_date,
        budget: header.budget,
        total_expenses: header.total_expenses,
        expenses_count: header.expenses_count,
        total_activities: header.total_activities,
        activities_count: header.activities_count,
        bbox: header.bbox,
        country_codes: header.country_codes as unknown as Array<
          Record<string, string>
        >,
        created_at: header.created_at,
        user_id: header.user_id,
        is_closed: header.is_closed,
        is_synced: true,
        dailyPlans: [],
        image: undefined,
      })) || [],
    [newTravels]
  );

  // Solo usar loading del nuevo hook ya que es más rápido
  const loading = newLoading;
  const prevUserId = useRef<string | undefined>(undefined);
  const [showUserLoading, setShowUserLoading] = useState(false);

  const { userAuthData } = useUserAuthContext();
  useEffect(() => {
    if (prevUserId.current && prevUserId.current !== userAuthData?.id) {
      setShowUserLoading(true);
      // Esperar a que los datos de viajes se actualicen
      const timeout = setTimeout(() => setShowUserLoading(false), 800);
      return () => clearTimeout(timeout);
    }
    prevUserId.current = userAuthData?.id;
  }, [userAuthData?.id, newLoading]);
  const { formatDateRange } = useLocalizedDates();
  const { userCurrency } = useCurrency();
  // Eliminada declaración duplicada
  const { alert, confirmState, close } = useConfirm();
  const { trackEvent } = useAnalytics();

  // El contexto ya maneja la carga inicial, no necesitamos llamar refreshTravels aquí

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPremiumBanner, setShowPremiumBanner] = useState(true);

  const initialValues: TravelFormValues = {
    name: "",
    start_date: "",
    end_date: "",
    budget: 0,
    country_codes: [] as Array<Record<string, string>>,
  };

  const { mutate: createTravel } = useCreateTravel();

  const handleSubmitCreate = async (values: TravelFormValues) => {
    setIsSubmitting(true);
    try {
      if (!userAuthData) {
        throw new Error("No user found");
      }

      // Usar la mutation de React Query que maneja la invalidación automáticamente
      createTravel({
        name: values.name,
        start_date: values.start_date,
        end_date: values.end_date,
        budget: values.budget,
        bbox: values.bbox || [],
        country_codes: values.country_codes,
        user_id: userAuthData.id,
      });

      // Cerrar el modal inmediatamente - la mutation se encargará de actualizar la lista
      setShowCreateModal(false);

      // Track successful trip creation
      trackEvent("trip_created", {
        trip_name: values.name,
        trip_budget: values.budget,
        trip_countries: values.country_codes.length,
        user_tier: userAuthData?.premium_status || "free",
      });
    } catch (error) {
      console.error("Error creating trip:", error);

      // Track failed trip creation
      trackEvent("trip_creation_failed", {
        trip_name: values.name,
        error:
          error instanceof Error
            ? error.message
            : t("common.unknownError", "Unknown error"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  // Validar límite de viajes para usuarios free
  const handleNewTripClick = async () => {
    // Track new trip button click
    trackEvent("new_trip_button_clicked", {
      user_tier: userAuthData?.premium_status || "free",
      current_trips_count: travels.length,
      can_create:
        (userAuthData?.premium_status || "free") !== "free" ||
        travels.length < 2,
    });

    if (
      (userAuthData?.premium_status || "free") === "free" &&
      travels.length >= 2
    ) {
      await alert({
        title: t("common.freeUserLimitReached"),
        message: t("common.freeUserLimitMessage"),
        type: "warning",
      });
      return;
    }
    setShowCreateModal(true);
  };

  // Manejar upgrade a premium
  const handleUpgradeToPremium = () => {
    // Track premium upgrade click
    trackEvent("premium_upgrade_clicked", {
      user_tier: userAuthData?.premium_status || "free",
      current_trips_count: travels.length,
      location: "travel_list_banner",
    });

    // Aquí puedes agregar la lógica para redirigir a la página de upgrade
    // Por ahora, solo mostraremos un alert
    alert({
      title: t("common.upgradeToPremium"),
      message: "Redirecting to premium upgrade page...",
      type: "info",
    });
  };

  // Manejar dismiss del banner
  const handleDismissBanner = () => {
    // Track banner dismiss
    trackEvent("premium_banner_dismissed", {
      user_tier: userAuthData?.premium_status || "free",
      current_trips_count: travels.length,
    });

    setShowPremiumBanner(false);
  };

  const handleSelectTravel = (travel: Travel) => {
    // Track trip selection
    trackEvent("trip_selected", {
      trip_id: travel.id,
      trip_name: travel.name,
      trip_budget: travel.budget,
      trip_countries: travel.country_codes?.length || 0,
      user_tier: userAuthData?.premium_status || "free",
    });

    // setSelectedTravel(travel);
    navigate(`/travels/travel/${travel.id}`);
  };

  const getBudgetProgress = (travel: Travel): number => {
    // Usar el total del contexto si estamos en un viaje específico
    const totalExpenses = calculateTotalExpenses(travel);
    return Math.min((totalExpenses / travel.budget) * 100, 100);
  };

  // Calculate totals for dashboard
  const { totalBudget, totalSpent, totalRemaining } = React.useMemo(() => {
    const totalBudget = travels.reduce((sum, t) => sum + t.budget, 0);
    const totalSpent = travels.reduce((sum, t) => {
      const totalExpenses = calculateTotalExpenses(t);
      return sum + totalExpenses;
    }, 0);
    const totalRemaining = travels.reduce((sum, t) => {
      const remaining = calculateRemainingBudget(t);
      return sum + remaining;
    }, 0);

    return { totalBudget, totalSpent, totalRemaining };
  }, [travels]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {t("travelList.loadingTravels")}
          </p>
        </div>
      </div>
    );
  }

  if (showUserLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {t("travelList.loadingTravels")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header showTabs={false} />
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pb-6">
        {/* Ad Banner */}
        <AdBannerResponsive area="large" provider="custom" className="mb-1" />
        {/* Content area */}
        <div className="sm:p-6">
          {/* Dashboard Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-6 shadow-lg relative overflow-hidden">
            {/* Background decorative elements - Reducidos */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-2 right-2 w-12 h-12 sm:w-20 sm:h-20 border border-white/30 rounded-full"></div>
              <div className="absolute bottom-2 left-2 w-8 h-8 sm:w-16 sm:h-16 border border-white/20 rounded-full"></div>
            </div>
            <div className="relative z-10">
              {/* Title Section - Más compacto */}
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">
                        {t("travelList.title")}
                      </h1>
                      <p className="text-white/80 text-sm">
                        {t("travelList.subtitle")}
                      </p>
                    </div>
                  </div>

                  {/* New Trip Button - Top Right */}
                  <button
                    onClick={handleNewTripClick}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 hover:bg-white/30 transition-all duration-200 group"
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <path
                        d="M12 7v10M7 12h10"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="text-white font-medium text-sm">
                      {t("travelList.newTrip")}
                    </span>
                  </button>
                </div>
              </div>
              {/* Stats Grid - Más compacto */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white/15 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-white/20 hover:bg-white/20 transition-all duration-200 min-h-[80px] sm:min-h-[90px] flex flex-col justify-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="text-sm sm:text-lg font-bold mb-1 leading-tight">
                    {formatCurrency(totalBudget, userCurrency, false)}
                  </div>
                  <div className="text-xs opacity-90 font-medium leading-tight">
                    {t("travelList.totalBudget")}
                  </div>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-white/20 hover:bg-white/20 transition-all duration-200 min-h-[80px] sm:min-h-[90px] flex flex-col justify-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="text-lg sm:text-xl">💰</div>
                  </div>
                  <div className="text-sm sm:text-lg font-bold mb-1 leading-tight">
                    {formatCurrency(totalSpent, userCurrency, false)}
                  </div>
                  <div className="text-xs opacity-90 font-medium leading-tight">
                    {t("travelList.spent")}
                  </div>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-white/20 hover:bg-white/20 transition-all duration-200 min-h-[80px] sm:min-h-[90px] flex flex-col justify-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="text-lg sm:text-xl">💎</div>
                  </div>
                  <div className={`text-sm sm:text-lg font-bold mb-1 leading-tight ${totalRemaining < 0 ? 'text-red-300' : ''}`}>
                    {totalRemaining < 0 
                      ? (() => {
                          const formatted = formatCurrency(Math.abs(totalRemaining), userCurrency, false);
                          const symbol = getCurrencySymbol(userCurrency);
                          const numberPart = formatted.replace(symbol, '').trim();
                          return `${symbol} -${numberPart}`;
                        })()
                      : formatCurrency(totalRemaining, userCurrency, false)
                    }
                  </div>
                  <div className="text-xs opacity-90 font-medium leading-tight">
                    {totalRemaining < 0 ? t("travelList.overBudget", "Sobre presupuesto") : t("travelList.remaining")}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Quick Actions Section - Comentado para uso futuro */}
          {/*
          <div className="flex flex-wrap gap-4 mb-8">
            <Card
              className="w-full sm:flex-1 min-w-0 sm:min-w-[220px] sm:max-w-[320px] flex items-center gap-4 px-4 py-4 hover:shadow-md transition group cursor-pointer"
              onClick={() => setShowCreateModal(true)}
              hover={true}
            >
              <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <rect
                    width="24"
                    height="24"
                    rx="12"
                    fill="#e0edff"
                    className="dark:fill-blue-900/20"
                  />
                  <path
                    d="M12 7v10M7 12h10"
                    stroke="#2563eb"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="dark:stroke-blue-400"
                  />
                </svg>
              </span>
              <div className="text-left">
                <div className="font-bold text-gray-900 dark:text-gray-100 text-base">
                  {t("travelList.newTrip")}
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-sm">
                  {t("travelList.newTripDescription")}
                </div>
              </div>
            </Card>
            <Card className="w-full sm:flex-1 min-w-0 sm:min-w-[220px] sm:max-w-[320px] flex items-center gap-4 px-4 py-4">
              <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <rect
                    width="24"
                    height="24"
                    rx="12"
                    fill="#f3e8ff"
                    className="dark:fill-purple-900/20"
                  />
                  <path
                    d="M12 4v2M12 18v2M4 12h2M18 12h2M7.8 7.8l1.4 1.4M14.8 14.8l1.4 1.4M7.8 16.2l1.4-1.4M14.8 9.2l1.4-1.4"
                    stroke="#a21caf"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="dark:stroke-purple-400"
                  />
                </svg>
              </span>
              <div className="text-left">
                <div className="font-bold text-gray-900 dark:text-gray-100 text-base">
                  {t("travelList.aiSuggestions")}
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-sm">
                  {t("travelList.aiSuggestionsDescription")}
                </div>
              </div>
            </Card>
            <Card className="w-full sm:flex-1 min-w-0 sm:min-w-[220px] sm:max-w-[320px] flex items-center gap-4 px-4 py-4">
              <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <rect
                    width="24"
                    height="24"
                    rx="12"
                    fill="#d1fae5"
                    className="dark:fill-green-900/20"
                  />
                  <path
                    d="M8 7h8M8 11h8M8 15h4"
                    stroke="#059669"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="dark:stroke-green-400"
                  />
                  <rect
                    x="6"
                    y="5"
                    width="12"
                    height="14"
                    rx="2"
                    stroke="#059669"
                    strokeWidth="2"
                    className="dark:stroke-green-400"
                  />
                </svg>
              </span>
              <div className="text-left">
                <div className="font-bold text-gray-900 dark:text-gray-100 text-base">
                  {t("travelList.templates")}
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-sm">
                  {t("travelList.templatesDescription")}
                </div>
              </div>
            </Card>
          </div>
          */}
          {/* Ad Banner */}
          <AdBannerResponsive
            area="xl-large"
            provider="custom"
            className="mb-1"
          />

          {/* Premium Banner - Mostrar solo para usuarios free con 2 viajes */}
          {(userAuthData?.premium_status || "free") === "free" &&
            travels.length >= 2 &&
            showPremiumBanner && (
              <div className="mb-6">
                <PremiumBanner
                  type="trips"
                  onUpgrade={handleUpgradeToPremium}
                  onDismiss={handleDismissBanner}
                  className="w-full"
                />
              </div>
            )}

          {/* Main Content */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t("travelList.yourTrips")}
            </h2>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              {travels.length} {t("travelList.activeTrips")}
            </span>
          </div>

          {/* Travel List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {(travels as Travel[]).map((travel, idx) => {
              const remaining = calculateRemainingBudget(travel);
              const progress = getBudgetProgress(travel);
              const activitiesCount = travel.activities_count;
              const expensesCount = travel.expenses_count;

              return (
                <div
                  key={travel.id}
                  onClick={() => handleSelectTravel(travel)}
                  className="cursor-pointer overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {/* Gradient header */}
                  <div
                    className={`px-6 pt-5 pb-4 ${
                      gradientClasses[idx % gradientClasses.length]
                    }`}
                  >
                    <h3 className="text-lg font-bold text-white mb-1 truncate">
                      {travel.name}
                    </h3>
                    <div className="flex items-center text-xs text-white/90 mb-1">
                      <Calendar size={14} className="mr-1" />
                      {formatDateRange(travel.start_date, travel.end_date)}
                      <span className="mx-2">·</span>
                      <MapPin size={14} className="mr-1" />
                      {travel.country_codes && travel.country_codes.length > 0
                        ? travel.country_codes
                            .map((countryObj, index) => {
                              const [, name] = Object.entries(countryObj)[0];
                              return index === 0 ? name : `, ${name}`;
                            })
                            .join("")
                        : t("travelList.noDestinations")}
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="px-6 pt-4 pb-5">
                    <div className="flex flex-wrap gap-6 justify-between mb-2">
                      {/* Total Budget */}
                      <div className="text-center min-w-[90px]">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {formatCurrency(Number(travel.budget), userCurrency)}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {t("travelList.totalBudgetLabel")}
                        </p>
                      </div>
                      {/* Spent */}
                      <div className="text-center min-w-[90px]">
                        <p className="text-xs text-red-500 font-semibold mb-1">
                          {formatCurrency(
                            calculateTotalExpenses(travel),
                            userCurrency
                          )}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {t("travelList.spentLabel")}
                        </p>
                      </div>
                      {/* Remaining */}
                      <div className="text-center min-w-[90px]">
                        <p className="text-xs text-green-600 font-semibold mb-1">
                          {formatCurrency(Number(remaining), userCurrency)}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {t("travelList.remainingLabel")}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <ProgressBar
                      percent={progress}
                      height="h-2"
                      showLabel={true}
                      label={t("common.budgetProgress")}
                      showPercentage={true}
                    />

                    {/* Activities & Expenses & Status */}
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs">
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
                        {activitiesCount} {t("travelList.activities")}
                      </span>
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
                        {expensesCount} {t("travelList.expenses")}
                      </span>
                      <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500 ml-auto">
                        <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 inline-block"></span>
                        {t("travelList.onTrack")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Ad Banner */}
      <AdBannerResponsive area="large" provider="custom" className="mb-1" />
      {/* Create Trip Modal */}
      <TripModal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        mode="create"
        initialValues={initialValues}
        onSubmit={handleSubmitCreate}
        isSubmitting={isSubmitting}
      />
      {/* Modal Confirm para alerts */}
      <ModalConfirm {...confirmState} onClose={close} />
    </div>
  );
};
