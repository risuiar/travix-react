import React from "react";
import { useTranslation } from "react-i18next";
import { useUserAuthContext } from "../contexts/useUserAuthContext";

export const AdSupportMessage: React.FC = () => {
  const { t } = useTranslation();
  const { userAuthData } = useUserAuthContext();

  // Solo mostrar para usuarios free
  if ((userAuthData?.premium_status || "free") !== "free") {
    return null;
  }

  // Si no hay usuario o perfil, no mostrar
  if (!userAuthData) {
    return null;
  }

  // Verificar si es mobile
  const isMobile = window.innerWidth <= 768;

  // En mobile, no mostrar este mensaje (dejar que se muestren banners normales)
  if (isMobile) {
    return null;
  }

  return (
    <div
      className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center"
      style={{
        width: "728px",
        height: "90px", // Altura fija exacta
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0, // Evitar que se comprima
      }}
    >
      <div className="flex items-center justify-center">
        <svg
          className="w-5 h-5 text-gray-500 mr-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-700 mb-1">
            {t("common.supportTravix")}
          </h3>
          <p className="text-xs text-gray-600">
            {t("common.travixFreeMessage")}
          </p>
        </div>
      </div>
    </div>
  );
};
