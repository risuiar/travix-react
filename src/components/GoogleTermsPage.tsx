import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, X, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface GoogleTermsPageProps {
  onBack?: () => void;
}

export const GoogleTermsPage: React.FC<GoogleTermsPageProps> = ({ onBack }) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { t, i18n } = useTranslation();

  const getTermsUrl = () => {
    const currentLanguage = i18n.language;
    const languageMap: { [key: string]: string } = {
      es: "https://travix.app/es/terms",
      en: "https://travix.app/terms",
      fr: "https://travix.app/fr/terms",
      de: "https://travix.app/de/terms",
      it: "https://travix.app/it/terms",
      pt: "https://travix.app/pt/terms",
    };
    return languageMap[currentLanguage] || languageMap.en;
  };

  const getPrivacyUrl = () => {
    const currentLanguage = i18n.language;
    const languageMap: { [key: string]: string } = {
      es: "https://travix.app/es/privacy",
      en: "https://travix.app/privacy",
      fr: "https://travix.app/fr/privacy",
      de: "https://travix.app/de/privacy",
      it: "https://travix.app/it/privacy",
      pt: "https://travix.app/pt/privacy",
    };
    return languageMap[currentLanguage] || languageMap.en;
  };

  const handleContinue = () => {
    if (!acceptedTerms || !acceptedPrivacy) {
      setError(
        t(
          "googleTerms.bothRequired",
          "Debes aceptar tanto los términos como la política de privacidad"
        )
      );
      return;
    }

    setError(null);

    // Simular el proceso de registro con Google

    // TODO: Aquí se implementaría la autenticación real con Google
    // Por ahora simulamos el proceso

    // Mostrar mensaje de éxito
    alert(
      t(
        "googleTerms.registrationSuccess",
        "Registro con Google exitoso! Tu cuenta ha sido creada."
      )
    );

    // Redirigir a la página principal
    window.location.href = "/travels";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-2xl">
        {/* Botón de regreso */}
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label={t("common.back", "Back")}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24">
              <path
                fill="#FFFFFF"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#FFFFFF"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FFFFFF"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#FFFFFF"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("googleTerms.title", "Registro con Google")}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t(
              "googleTerms.subtitle",
              "Para continuar con el registro usando tu cuenta de Google, debes aceptar nuestros términos y condiciones"
            )}
          </p>
        </div>

        <div className="space-y-6">
          {/* Checkbox de términos y condiciones */}
          <div className="flex items-start space-x-3">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="text-sm">
              <label
                htmlFor="terms"
                className="text-gray-700 dark:text-gray-300"
              >
                {t("googleTerms.acceptTerms", "Acepto los")}{" "}
                <a
                  href={getTermsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline inline-flex items-center"
                >
                  {t(
                    "googleTerms.termsAndConditions",
                    "términos y condiciones"
                  )}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </label>
            </div>
          </div>

          {/* Checkbox de política de privacidad */}
          <div className="flex items-start space-x-3">
            <div className="flex items-center h-5">
              <input
                id="privacy"
                name="privacy"
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="text-sm">
              <label
                htmlFor="privacy"
                className="text-gray-700 dark:text-gray-300"
              >
                {t("googleTerms.acceptPrivacy", "Acepto la")}{" "}
                <a
                  href={getPrivacyUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline inline-flex items-center"
                >
                  {t("googleTerms.privacyPolicy", "política de privacidad")}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </label>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <X className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700 dark:text-red-400">
                {error}
              </span>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={handleContinue}
              disabled={!acceptedTerms || !acceptedPrivacy}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <Check className="w-5 h-5 mr-2" />
              {t("googleTerms.continueWithGoogle", "Continuar con Google")}
            </button>

            <Link
              to="/register"
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
            >
              {t("googleTerms.backToRegister", "Volver al registro")}
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t(
              "googleTerms.info",
              "Al continuar, autorizas a Travix a acceder a la información básica de tu cuenta de Google (nombre, email y foto de perfil) para crear tu cuenta."
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
