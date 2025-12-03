import React from "react";
import { useUserAuthContext } from "../contexts/useUserAuthContext";

import { AdSupportMessage } from "./AdSupportMessage";
import { shouldShowBanner } from "../utils/bannerUtils";

interface AdBannerManagerProps {
  size:
    | "728x90"
    | "970x90"
    | "300x250"
    | "300x100"
    | "336x280"
    | "160x600"
    | "468x60";
  placement:
    | "homepage-top"
    | "planner-side"
    | "dashboard-bottom"
    | "small"
    | "planner-under-1"
    | "planner-under-2"
    | "planner-under-3"
    | "xl-large-left"
    | "xl-large-center"
    | "xl-large-right"
    | "xl-small-top"
    | "xl-small-bottom"
    | "xl-mobile"
    | "medium-wide"
    | "medium-narrow"
    | "medium-mobile"
    | "footer-fixed"; // Nuevo placement para banner fijo
  provider?: "adsense" | "propeller" | "custom";
  className?: string;
  containerStyle?: React.CSSProperties;
  forceShow?: boolean; // Para forzar mostrar (ej: footer)
  useSupportMessage?: boolean; // Para usar mensaje de soporte en lugar de banner
}

export const AdBannerManager: React.FC<AdBannerManagerProps> = ({
  size,
  placement,
  className = "",
  containerStyle = {},
  forceShow = false,
  useSupportMessage = false,
}) => {
  const { userAuthData } = useUserAuthContext();

  // Función para determinar si mostrar banner según el tier del usuario
  const shouldShowBannerByTier = (tier: string): boolean => {
    switch (tier) {
      case "premium":
        return false; // Los usuarios premium no ven banners
      case "ultimate":
        return false; // Los usuarios ultimate no ven banners
      default:
        return true;
    }
  };

  // Si el usuario no debe ver banners por su tier, no renderizar nada
  if (!shouldShowBannerByTier(userAuthData?.premium_status || "free")) {
    return null;
  }

  // Si no hay usuario o perfil, no mostrar banner (excepto si es forzado)
  if (!userAuthData) {
    return null;
  }

  // Contenedor con altura fija para evitar layout shift
  const containerStyleWithHeight = {
    ...containerStyle,
    height: "90px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  // Si es un banner fijo (footer), siempre mostrarlo
  if (forceShow || placement === "footer-fixed") {
    return (
      <div
        className={`flex justify-center mt-4 ${className}`}
        style={containerStyleWithHeight}
      >
        <div
          style={{
            width: "728px",
            height: "90px",
            backgroundColor: "#f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #ddd",
          }}
        >
          <span style={{ color: "#666" }}>
            Custom Ad - {placement} ({size})
          </span>
        </div>
      </div>
    );
  }

  // Si se debe usar mensaje de soporte en lugar de banner (solo para homepage-top en desktop)
  if (useSupportMessage && placement === "homepage-top") {
    const shouldShowMessage = Math.random() < 0.25; // 25% de probabilidad usando Math.random()

    return (
      <div
        className={`flex justify-center mt-4 ${className}`}
        style={containerStyleWithHeight}
      >
        {shouldShowMessage ? (
          <AdSupportMessage />
        ) : (
          <div
            style={{
              width: "728px",
              height: "90px",
              backgroundColor: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #ddd",
            }}
          >
            <span style={{ color: "#666" }}>
              Custom Ad - {placement} ({size})
            </span>
          </div>
        )}
      </div>
    );
  }

  if (!shouldShowBanner()) {
    return null;
  }

  // Mostrar el banner
  return (
    <div
      className={`flex justify-center mt-4 ${className}`}
      style={containerStyleWithHeight}
    >
      <div
        style={{
          width: "728px",
          height: "90px",
          backgroundColor: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #ddd",
        }}
      >
        <span style={{ color: "#666" }}>
          Custom Ad - {placement} ({size})
        </span>
      </div>
    </div>
  );
};
