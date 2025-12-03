import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAnalytics } from "../hooks/useAnalytics";

export const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // Mostrar banner solo si no hay consentimiento guardado
      setVisible(true);
      // Consent Mode v2 por defecto (denied) - ya configurado en AnalyticsProvider
    } else if (consent === "granted") {
      // Si ya hay consentimiento, actualizar gtag con Consent Mode v2
      if (window.gtag) {
        window.gtag("consent", "update", {
          ad_storage: "granted",
          analytics_storage: "granted",
          functionality_storage: "granted",
          personalization_storage: "granted",
        });
      }
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie_consent", "granted");
    setVisible(false);

    // Track cookie consent granted
    trackEvent("cookie_consent_granted", {
      consent_type: "all",
      user_action: "accepted"
    });

    // Actualizar consentimiento en gtag con Consent Mode v2
    if (window.gtag) {
      window.gtag("consent", "update", {
        ad_storage: "granted",
        analytics_storage: "granted",
        functionality_storage: "granted",
        personalization_storage: "granted",
      });
    }
  };

  const declineCookies = () => {
    localStorage.setItem("cookie_consent", "denied");
    setVisible(false);

    // Track cookie consent denied
    trackEvent("cookie_consent_denied", {
      consent_type: "all",
      user_action: "declined"
    });

    // Mantener consentimiento denegado en gtag con Consent Mode v2
    if (window.gtag) {
      window.gtag("consent", "update", {
        ad_storage: "denied",
        analytics_storage: "denied",
        functionality_storage: "denied",
        personalization_storage: "denied",
      });
    }
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#333",
        color: "#fff",
        padding: "1rem",
        zIndex: 9999,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
      }}
    >
      <span style={{ flex: 1, minWidth: "200px" }}>
        {t("common.cookieConsent.message")}
      </span>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          onClick={declineCookies}
          style={{
            padding: "0.5rem 1rem",
            background: "#666",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {t("common.cookieConsent.decline")}
        </button>
        <button
          onClick={acceptCookies}
          style={{
            padding: "0.5rem 1rem",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {t("common.cookieConsent.accept")}
        </button>
      </div>
    </div>
  );
};
