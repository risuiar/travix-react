import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useParams,
} from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./utils/queryClient";
import { useScrollToTopOnRouteChange } from "./components/ScrollToTop";
import { TravelList } from "./components/TravelList";
import { TravelDetail } from "./components/TravelDetail";
import { ProtectedRoute } from "./components/ProtectedRoute";
import LoginPage from "./components/LoginPage";
import AuthLogin from "./components/AuthLogin";
import Footer from "./components/Footer";
import { TravelLayout } from "./components/TravelLayout";
// TravelListProvider eliminado - usando nuevas vistas SQL
import { UserAuthProvider } from "./contexts/UserAuthProvider";
import { ToastProvider } from "./contexts/ToastProvider";
import { LanguageProvider } from "./contexts/LanguageProvider";
import { AccessProvider } from "./contexts/AccessProvider";
import { CurrencyProvider } from "./contexts/CurrencyProvider";
import { ThemeProvider } from "./contexts/ThemeProvider";
import { AnalyticsProvider } from "./components/AnalyticsProvicer";
import { CookieConsent } from "./components/CookieConsent";
import { FaviconUpdater } from "./components/FaviconUpdater";
import NotFoundPage from "./components/NotFoundPage";

import EmailVerificationPage from "./components/EmailVerificationPage";
import { TermsPage } from "./components/TermsPage";
import "./index.css";
import "./i18n";
import { Walkthrough, HelpButton } from "./components/Walkthrough";
import { useWalkthrough } from "./hooks/useWalkthrough";
import FeedbackModal from "./components/Modal/FeedbackModal";

// Lazy load HowWorks for better performance
const HowWorks = React.lazy(() => import("./components/HowWorks"));

function ScrollToTopHandler() {
  useScrollToTopOnRouteChange();
  return null;
}

function AppContent() {
  const location = useLocation();
  const { showWalkthrough, openWalkthrough, closeWalkthrough } =
    useWalkthrough();

  // Estado para el modal de feedback
  const [showFeedback, setShowFeedback] = React.useState(false);

  // Determinar la página actual para el walkthrough
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === "/travels") return "travels";
    if (path.includes("/travels/travel/")) {
      if (path.includes("/overview")) return "overview";
      if (path.includes("/daily-planner")) return "daily-planner";
      if (path.includes("/expenses")) return "expenses";
      return "travel-detail";
    }
    return "any";
  };

  // Probar conexión a Supabase al cargar la app
  React.useEffect(() => {
    import('./supabaseClient').then(mod => {
      if (mod.testSupabaseConnection) {
        mod.testSupabaseConnection();
      }
    });
  }, []);
  return (
    <div className="min-h-screen">
      <Routes>
        {/* Login */}
        <Route path="/login" element={<LoginPage />} />
        {/* Google Auth Loader */}
        <Route path="/auth/login" element={<AuthLogin />} />
        {/* Página de términos y condiciones */}
        <Route path="/terms" element={<TermsPage />} />
        {/* Página de verificación de email */}
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        {/* Health check endpoint */}
        <Route
          path="/health"
          element={<div>OK</div>}
        />

        {/* How Works page */}
        <Route
          path="/how-works"
          element={
            <React.Suspense
              fallback={
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              }
            >
              <HowWorks />
            </React.Suspense>
          }
        />
        {/* Página principal - redirige a travels si está autenticado */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/travels" replace />
            </ProtectedRoute>
          }
        />
        {/* Lista de viajes */}
        <Route
          path="/travels"
          element={
            <ProtectedRoute>
              <TravelList />
            </ProtectedRoute>
          }
        />
        {/* Detalles del viaje y subrutas */}
        <Route
          path="/travels/travel/:id"
          element={
            <ProtectedRoute>
              <TravelLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TravelDetail />} />
          <Route path="overview" element={<TravelDetail />} />
          <Route path="expenses" element={<TravelDetail />} />
          <Route path="activities" element={<TravelDetail />} />
          <Route path="daily-planner" element={<TravelDetail />} />
          {/* Nuevas rutas para días específicos */}
          <Route path="daily-planner/day/:date" element={<TravelDetail />} />
          {/* Rutas para itinerarios */}
          <Route
            path="daily-planner/itinerary/:itineraryId"
            element={<TravelDetail />}
          />
          {/* Rutas combinadas (nuevo orden: itinerary antes que day) */}
          <Route
            path="daily-planner/itinerary/:itineraryId/day/:date"
            element={<TravelDetail />}
          />
          {/* Compatibilidad con orden antiguo: redirigir al nuevo orden */}
          <Route
            path="daily-planner/day/:date/itinerary/:itineraryId"
            element={<LegacyDayItineraryRedirect />}
          />
        </Route>
        {/* Fallback 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Elementos globales fuera de <Routes> */}
      {location.pathname !== "/login" && (
        <>
          <Footer />
          <Walkthrough
            currentPage={getCurrentPage()}
            isOpen={showWalkthrough}
            onClose={closeWalkthrough}
          />
          <HelpButton onClick={openWalkthrough} />
          {/* Botón flotante para feedback */}
          <button
            className="fixed bottom-6 left-6 z-50 bg-pink-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-pink-700 transition"
            onClick={() => setShowFeedback(true)}
            aria-label="Reportar bug o dejar mensaje"
          >
            Feedback
          </button>
          <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
        </>
      )}
    </div>
  );
}

// Redirige /daily-planner/day/:date/itinerary/:itineraryId -> /daily-planner/itinerary/:itineraryId/day/:date
function LegacyDayItineraryRedirect() {
  const { id, date, itineraryId } = useParams();
  const to = `/travels/travel/${id}/daily-planner/itinerary/${itineraryId}/day/${date}`;
  return <Navigate to={to} replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ScrollToTopHandler />
        <UserAuthProvider>
          <ToastProvider>
            <ThemeProvider>
              <LanguageProvider>
                <AccessProvider>
                  <CurrencyProvider>
                    <AnalyticsProvider />
                    <CookieConsent />
                    <FaviconUpdater />
                    <AppContent />
                  </CurrencyProvider>
                </AccessProvider>
              </LanguageProvider>
            </ThemeProvider>
          </ToastProvider>
        </UserAuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
