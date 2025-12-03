import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../hooks/useLanguage";

interface GoogleTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  userEmail?: string;
}

export const GoogleTermsModal: React.FC<GoogleTermsModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  userEmail,
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  const getTermsUrl = () => {
    const baseUrl = "https://travix.app";
    const lang = language === "pt" ? "pt" : language;
    return `${baseUrl}/${lang}/terms`;
  };

  const getPrivacyUrl = () => {
    const baseUrl = "https://travix.app";
    const lang = language === "pt" ? "pt" : language;
    return `${baseUrl}/${lang}/privacy`;
  };

  const handleContinue = () => {
    if (acceptTerms && acceptPrivacy) {
      onAccept();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t("googleTerms.title", "Términos y Condiciones")}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {t(
              "googleTerms.subtitle",
              "Para continuar con tu cuenta de Google, debes aceptar nuestros términos y condiciones."
            )}
          </p>
          {userEmail && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {t("googleTerms.email", "Email")}: {userEmail}
            </p>
          )}
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300">
              {t("googleTerms.acceptTerms", "Acepto los")}{" "}
              <a
                href={getTermsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
              >
                {t("googleTerms.termsAndConditions", "Términos y Condiciones")}
              </a>
            </label>
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="privacy"
              checked={acceptPrivacy}
              onChange={(e) => setAcceptPrivacy(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="privacy" className="text-sm text-gray-700 dark:text-gray-300">
              {t("googleTerms.acceptPrivacy", "Acepto la")}{" "}
              <a
                href={getPrivacyUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
              >
                {t("googleTerms.privacyPolicy", "Política de Privacidad")}
              </a>
            </label>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            {t("common.cancel", "Cancelar")}
          </button>
          <button
            onClick={handleContinue}
            disabled={!acceptTerms || !acceptPrivacy}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("googleTerms.continue", "Continuar")}
          </button>
        </div>
      </div>
    </div>
  );
};
