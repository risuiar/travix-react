import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../supabaseClient";
import { useUserAuthContext } from "../contexts/useUserAuthContext";
import LanguageSelector from "./LanguageSelector";
import { useQueryClient } from "@tanstack/react-query";

export const TermsPage: React.FC = () => {
  const { userAuthData, refetch } = useUserAuthContext();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);

  // Verificar si el usuario ya aceptó los términos
  useEffect(() => {
    if (userAuthData?.accepted_terms) {
      navigate("/travels", { replace: true });
    }
  }, [userAuthData, navigate]);

  // Si no hay usuario, redirigir a login
  useEffect(() => {
    if (!userAuthData) {
      navigate("/login", { replace: true });
    }
  }, [userAuthData, navigate]);

  const getTermsUrl = () => {
    const currentLang = localStorage.getItem("i18nextLng") || "en";
    const langMap: { [key: string]: string } = {
      en: "https://docs.google.com/document/d/1-2-3-4-5",
      es: "https://docs.google.com/document/d/1-2-3-4-5",
      fr: "https://docs.google.com/document/d/1-2-3-4-5",
      de: "https://docs.google.com/document/d/1-2-3-4-5",
      it: "https://docs.google.com/document/d/1-2-3-4-5",
      pt: "https://docs.google.com/document/d/1-2-3-4-5",
    };
    return langMap[currentLang] || langMap.en;
  };

  const getPrivacyUrl = () => {
    const currentLang = localStorage.getItem("i18nextLng") || "en";
    const langMap: { [key: string]: string } = {
      en: "https://docs.google.com/document/d/1-2-3-4-5",
      es: "https://docs.google.com/document/d/1-2-3-4-5",
      fr: "https://docs.google.com/document/d/1-2-3-4-5",
      de: "https://docs.google.com/document/d/1-2-3-4-5",
      it: "https://docs.google.com/document/d/1-2-3-4-5",
      pt: "https://docs.google.com/document/d/1-2-3-4-5",
    };
    return langMap[currentLang] || langMap.en;
  };

  const handleAccept = async () => {
    if (!acceptTerms || !acceptPrivacy || !userAuthData) return;

    setLoading(true);
    try {
      // Usuario existente - actualizar términos aceptados
      const { error } = await supabase
        .from("profiles")
        .update({
          accepted_terms: true,
          login_count: (userAuthData.login_count || 0) + 1,
        })
        .eq("id", userAuthData.id);

      if (error) {
        console.error("Error updating profile:", error);
        return;
      }

      // Invalidar la query de userAuthData para forzar una nueva consulta
      queryClient.invalidateQueries({ queryKey: ["user", "auth-data"] });

      // Refetch inmediato para obtener los datos actualizados
      await refetch();

      // Pequeño delay para asegurar que la invalidación se procese
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Redirigir a travels
      navigate("/travels", { replace: true });
    } catch (error) {
      console.error("Error en handleAccept:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
      {/* Language Selector - Top Right */}
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t("googleTerms.title", "Términos y Condiciones")}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {t(
              "googleTerms.subtitle",
              "Para continuar con tu cuenta, debes aceptar nuestros términos y condiciones."
            )}
          </p>
          {userAuthData?.email && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {t("googleTerms.email", "Email")}: {userAuthData.email}
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
            <label
              htmlFor="terms"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
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
            <label
              htmlFor="privacy"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
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
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            {t("common.cancel", "Cancelar")}
          </button>
          <button
            onClick={handleAccept}
            disabled={!acceptTerms || !acceptPrivacy || loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? t("common.loading", "Cargando...")
              : t("googleTerms.continue", "Continuar")}
          </button>
        </div>
      </div>
    </div>
  );
};
