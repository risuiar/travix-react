import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useTravelHeader,
  useTravelDailyPlanItems,
} from "../utils/hooks/useTravelQueries";
import { useUpdateTravel } from "../utils/queries";
import { Travel, TravelFormValues } from "../types";
import { useAnalytics } from "../hooks/useAnalytics";
import Overview from "./Tabs/Overview";
import DailyPlanner from "./Tabs/DailyPlanner";
import Expenses from "./Tabs/Expenses";
import { Header } from "./Header";
import { TripModal } from "./Modal/TripModal";
import {
  getDailyPlannerUrl,
  getDayUrl,
  getItineraryUrl,
  getDayItineraryUrl,
} from "../utils/navigation";

export const TravelDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { date, itineraryId } = useParams(); // Extraer parámetros de la URL
  const { t } = useTranslation();
  const { trackPageView, trackEvent } = useAnalytics();

  // Obtener el travelId de la URL
  const travelId = location.pathname.split("/")[3]; // /travels/travel/{id}/...

  // Usar nuevos hooks para obtener datos
  const { data: headerData } = useTravelHeader(parseInt(travelId));
  const { data: dailyPlanData } = useTravelDailyPlanItems(parseInt(travelId));
  const updateTravelMutation = useUpdateTravel();

  // Crear un objeto travel compatible con el tipo existente
  const travelToUse = useMemo(() => {
    if (!headerData) return null;

    return {
      id: headerData.id.toString(),
      name: headerData.name,
      start_date: headerData.start_date,
      end_date: headerData.end_date,
      budget: headerData.budget,
      total_expenses: headerData.total_expenses,
      expenses_count: headerData.expenses_count,
      total_activities: headerData.total_activities,
      activities_count: headerData.activities_count,
      bbox: headerData.bbox,
      country_codes: headerData.country_codes as unknown as Array<
        Record<string, string>
      >,
      created_at: headerData.created_at,
      user_id: headerData.user_id,
      is_closed: headerData.is_closed,
      is_synced: true,
      dailyPlans:
        dailyPlanData?.daily_items?.map((item) => ({
          day: item.date,
          city_id: null,
          name: null,
          notes: null,
          activities_count:
            item.items?.filter((i) => i.type === "activity").length || 0,
          expenses_count:
            item.items?.filter((i) => i.type === "expense").length || 0,
          total_spent:
            item.items?.reduce((sum, i) => sum + (i.cost || 0), 0) || 0,
          bbox: undefined,
          lat: undefined,
          lng: undefined,
        })) || [],
      image: undefined,
    } as Travel;
  }, [headerData, dailyPlanData]);

  // Función para detectar el tab desde la URL
  const getInitialTab = () => {
    const pathSegments = location.pathname.split("/");
    if (pathSegments.includes("daily-planner")) {
      return "daily-planner";
    } else if (pathSegments.includes("overview")) {
      return "overview";
    } else if (pathSegments.includes("expenses")) {
      return "expenses";
    } else if (pathSegments.includes("activities")) {
      return "activities";
    }
    return "overview"; // default
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [showMenu, setShowMenu] = useState(false);
  const [editMenuOpen, setEditMenuOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const [currentDate, setCurrentDate] = useState<string | undefined>(date);
  const [currentItineraryId, setCurrentItineraryId] = useState<
    string | undefined
  >(itineraryId);

  const editMenuRef = useRef<HTMLDivElement>(null);
  const prevLocationRef = useRef(location.pathname);

  // Sincronizar activeTab con la URL y trackear analytics
  useEffect(() => {
    // Solo actualizar si la ruta realmente cambió
    if (prevLocationRef.current === location.pathname) return;
    prevLocationRef.current = location.pathname;

    const pathSegments = location.pathname.split("/");

    // Batch todas las actualizaciones de estado
    const updates = {
      date: date,
      itineraryId: itineraryId,
      tab: "overview" as string, // default
    };

    // Detectar tab actual
    if (pathSegments.includes("daily-planner")) {
      updates.tab = "daily-planner";
    } else if (pathSegments.includes("overview")) {
      updates.tab = "overview";
    } else if (pathSegments.includes("expenses")) {
      updates.tab = "expenses";
    } else if (pathSegments.includes("activities")) {
      updates.tab = "activities";
    }

    // Solo actualizar estados si realmente han cambiado
    if (currentDate !== updates.date) {
      setCurrentDate(updates.date);
    }
    if (currentItineraryId !== updates.itineraryId) {
      setCurrentItineraryId(updates.itineraryId);
    }
    if (activeTab !== updates.tab) {
      setActiveTab(updates.tab);
    }

    // Track page view for analytics
    if (travelToUse) {
      const currentPath = `/travels/travel/${travelToUse.id}/${updates.tab}`;
      trackPageView(currentPath);
    }
  }, [location.pathname, date, itineraryId, travelToUse, trackPageView, currentDate, currentItineraryId, activeTab]);

  // Combined click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Handle main menu
      if (showMenu && !target.closest(".menu-container")) {
        setShowMenu(false);
      }

      // Handle edit menu
      if (
        editMenuOpen &&
        editMenuRef.current &&
        !editMenuRef.current.contains(target as Node)
      ) {
        setEditMenuOpen(false);
      }
    };

    if (showMenu || editMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu, editMenuOpen]);

  // Función para manejar el cambio de tab y navegar
  const handleTabChange = useCallback((tab: string) => {
    // Evitar re-render si ya estamos en el tab
    if (tab === activeTab) return;

    trackEvent("tab_changed", {
      trip_id: travelToUse?.id || '',
      from_tab: activeTab,
      to_tab: tab,
    });
    setActiveTab(tab);

    // Limpiar parámetros de fecha e itinerario al cambiar de tab
    if (tab !== "daily-planner") {
      setCurrentDate(undefined);
      setCurrentItineraryId(undefined);
      navigate(`/travels/travel/${travelToUse?.id}/${tab}`, { replace: true });
    } else {
      // Para daily-planner, mantener los parámetros si existen respetando el esquema de rutas
      let url = getDailyPlannerUrl(travelToUse?.id || '');
      if (currentDate && currentItineraryId) {
        url = getDayItineraryUrl(
          travelToUse?.id || '',
          currentDate,
          currentItineraryId
        );
      } else if (currentItineraryId) {
        url = getItineraryUrl(travelToUse?.id || '', currentItineraryId);
      } else if (currentDate) {
        url = getDayUrl(travelToUse?.id || '', currentDate);
      }
      navigate(url, { replace: true });
    }
  }, [activeTab, travelToUse?.id, navigate, trackEvent, currentDate, currentItineraryId]);

  const handleAddExpense = useCallback(() => {
    trackEvent("click_add_expense", {
      trip_id: travelToUse?.id || '',
      tab: activeTab,
    });
  }, [trackEvent, travelToUse?.id, activeTab]);

  const handleEditTrip = useCallback(() => {
    trackEvent("click_edit_trip", {
      trip_id: travelToUse?.id || '',
      tab: activeTab,
    });
    setShowEditModal(true);
  }, [trackEvent, travelToUse?.id, activeTab]);

  const handleBack = useCallback(() => {
    trackEvent("click_back_to_travels", {
      trip_id: travelToUse?.id || '',
      tab: activeTab,
    });

    // Si estamos en daily-planner con un día específico, volver al itinerario
    if (activeTab === "daily-planner" && currentDate && currentItineraryId) {
      navigate(getItineraryUrl(travelToUse?.id || '', currentItineraryId));
    } else if (activeTab === "daily-planner" && currentDate) {
      // Si solo hay fecha sin itinerario, volver al daily-planner base
      navigate(getDailyPlannerUrl(travelToUse?.id || ''));
    } else {
      // En otros casos, volver a la lista de viajes
      navigate("/travels");
    }
  }, [trackEvent, travelToUse?.id, activeTab, currentDate, currentItineraryId, navigate]);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
  }, []);

  const handleSubmitEditTrip = useCallback(async (values: TravelFormValues) => {
    if (!travelToUse) return;
    
    setIsSubmittingEdit(true);
    try {
      await updateTravelMutation.mutateAsync({
        id: travelToUse.id,
        updates: {
          name: values.name,
          start_date: values.start_date,
          end_date: values.end_date,
          budget: values.budget,
          bbox: values.bbox || [],
          country_codes: values.country_codes,
        },
      });
      
      trackEvent("trip_edit_success", {
        trip_id: travelToUse.id,
        trip_name: values.name,
        budget_amount: values.budget,
        countries_count: values.country_codes.length,
      });
      
      setShowEditModal(false);
      
      // Data will be updated automatically by React Query
    } catch (error) {
      console.error("Error updating trip:", error);
      trackEvent("trip_edit_failed", {
        trip_id: travelToUse.id,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSubmittingEdit(false);
    }
  }, [travelToUse, updateTravelMutation, trackEvent]);

  // Memoizar el componente activo para evitar re-renders innecesarios
  const activeComponent = useMemo(() => {
    if (!travelToUse) return null;
    
    const commonProps = {
      travel: travelToUse,
      onEditTrip: handleEditTrip,
    };

    switch (activeTab) {
      case "overview":
        return (
          <Overview
            {...commonProps}
            onNavigateTab={handleTabChange}
          />
        );
      case "daily-planner":
        return (
          <DailyPlanner
            {...commonProps}
            onBack={handleBack}
            selectedDate={currentDate}
            selectedItinerary={currentItineraryId}
          />
        );
      case "expenses":
        return (
          <Expenses
            {...commonProps}
            onAddExpense={handleAddExpense}
          />
        );
      default:
        return (
          <Overview
            {...commonProps}
            onNavigateTab={handleTabChange}
          />
        );
    }
  }, [
    activeTab,
    travelToUse,
    handleEditTrip,
    handleTabChange,
    handleBack,
    handleAddExpense,
    currentDate,
    currentItineraryId,
  ]);

  if (!travelToUse) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {t("travelDetail.loadingTravel")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Agregar estilos para transiciones suaves */}
      <style>{`
        @view-transition {
          navigation: auto;
        }
        
        ::view-transition-old(root),
        ::view-transition-new(root) {
          animation-duration: 0.2s;
        }
        
        .tab-transition {
          transition: opacity 0.15s ease-in-out;
          will-change: opacity;
        }
        
        .travel-card,
        .overview-card,
        .expense-item {
          contain: layout style paint;
        }
        
        .daily-planner-container,
        .expenses-container {
          contain: layout;
        }
      `}</style>

      <Header
        currentView={activeTab}
        onViewChange={handleTabChange}
        showTabs={true}
      />
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pb-6">
        <div className="sm:p-6 tab-transition">
          {activeComponent}
        </div>
      </div>
      
      {/* Edit Trip Modal */}
      {travelToUse && (
        <TripModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          mode="edit"
          editTrip={travelToUse}
          onSubmit={handleSubmitEditTrip}
          isSubmitting={isSubmittingEdit}
        />
      )}
    </div>
  );
};

export default TravelDetail;
