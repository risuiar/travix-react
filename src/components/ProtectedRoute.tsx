import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useUserAuthContext } from "../contexts/useUserAuthContext";
import { useAccess } from "../hooks/useAccess";
import { useTranslation } from "react-i18next";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { userAuthData, isLoading: loading, error } = useUserAuthContext();
  const { hasAccess, accessChecked, checkingAccess, accessError } = useAccess();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Verificar términos antes de permitir acceso
  useEffect(() => {
    if (userAuthData && userAuthData.accepted_terms !== true) {
      navigate("/terms", { replace: true });
    }
  }, [userAuthData, navigate]);

  // Función para manejar el retry de manera más inteligente
  const handleRetry = async () => {
    try {
      // Si es un error de configuración, recargar la página
      if (error && error.message === "Configuration error") {
        window.location.reload();
        return;
      }

      // Si es un error de autenticación, limpiar la sesión y redirigir a login
      if (
        error &&
        (error.message === "Authentication error" ||
          error.message === "Failed to initialize authentication")
      ) {
        const { supabase } = await import("../supabaseClient");
        await supabase.auth.signOut();
        navigate("/login", { replace: true });
        return;
      }

      // Para otros errores, intentar recargar
      window.location.reload();
    } catch (retryError) {
      console.error("Error during retry:", retryError);
      // Si falla el retry, redirigir a login como fallback
      navigate("/login", { replace: true });
    }
  };

  // Si hay un error de configuración o autenticación, mostrar error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {t("common.error", "Error")}
          </h1>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {error.message === "Authentication error" ||
            error.message === "Failed to initialize authentication"
              ? t("login.signIn", "Login")
              : t("common.retry", "Retry")}
          </button>
        </div>
      </div>
    );
  }

  if (loading || checkingAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {checkingAccess
              ? t("login.checkingAccess", "Checking access...")
              : t("common.loading", "Loading...")}
          </p>
        </div>
      </div>
    );
  }

  if (!userAuthData) {
    return <Navigate to="/login" replace />;
  }

  // Si no tiene términos aceptados (null, undefined, o false), no renderizar nada mientras redirige
  if (userAuthData.accepted_terms !== true) {
    return null;
  }

  // Si ya verificamos el acceso y no tiene permisos, mostrar mensaje
  if (accessChecked && hasAccess === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⛔️</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {t("login.accessDenied", "Access Denied")}
          </h1>
          <p className="text-gray-600 mb-4">
            {accessError ||
              t(
                "login.noAccessMessage",
                "Your email doesn't have access to this application."
              )}
          </p>
          <button
            onClick={async () => {
              const { supabase } = await import("../supabaseClient");
              await supabase.auth.signOut();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("login.backToLogin", "Back to Login")}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
