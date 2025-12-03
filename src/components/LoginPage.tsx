import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useUserAuthContext } from "../contexts/useUserAuthContext";
import { queryClient } from "../utils/queryClient";
import { AuthButtonsContainer } from "./AuthButtons/AuthButtonsContainer.tsx";
import LanguageSelector from "./LanguageSelector";
import { useLanguage } from "../hooks/useLanguage";
import { useAnalytics } from "../hooks/useAnalytics";
import { useVersion } from "../hooks/useVersion";

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const { trackEvent } = useAnalytics();
  const version = useVersion();
  const { refetch } = useUserAuthContext();

  const handleLoginSuccess = () => {
    // Track successful login
    console.log("handleLoginSuccess called: esperando actualización de usuario");
    trackEvent("login_successful", {
      method: "oauth", // o "email" dependiendo del método usado
      user_language: currentLanguage,
    });
    // Refrescar datos de usuario y esperar actualización antes de navegar
    if (refetch) {
      refetch();
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["travel"] });
        navigate("/travels");
      }, 400);
    } else {
      navigate("/travels");
    }
  };

  const handleLoginError = (error: Error | string) => {
    // Track login error
    trackEvent("login_failed", {
      error: error instanceof Error ? error.message : String(error),
      user_language: currentLanguage,
    });

    console.error("Error en login:", error);
    // Mostrar el error como alert por ahora
    alert(error instanceof Error ? error.message : error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 relative">
      {/* Language Selector - Top Right */}
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>

      <div className="max-w-md w-full">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 mt-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("login.welcome", "Bienvenido a Travix")}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t("login.subtitle", "Tu compañero de viaje inteligente")}
          </p>
        </div>

        {/* Card de login */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t("login.signIn", "Iniciar sesión")}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {t("login.description", "Accede a tu cuenta para continuar")}
            </p>
          </div>

          {/* Botones de autenticación */}
          <AuthButtonsContainer
            onLoginSuccess={handleLoginSuccess}
            onLoginError={handleLoginError}
            showFacebookAuth={false}
            showEmailAuth={true}
          />

          {/* Información adicional */}
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {t(
                "login.privacyNotice",
                "Al continuar, aceptas nuestros términos de servicio y política de privacidad"
              )}{" "}
              <a
                href={`https://travix.app${
                  currentLanguage === "en" ? "" : `/${currentLanguage}`
                }/terms`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {t("footer.termsOfService", "Términos de Servicio")}
              </a>{" "}
              {t("common.and", "y")}{" "}
              <a
                href={`https://travix.app${
                  currentLanguage === "en" ? "" : `/${currentLanguage}`
                }/privacy`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {t("footer.privacyPolicy", "Política de Privacidad")}
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("login.version", "Versión")} {version}{" "}
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              BETA
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
