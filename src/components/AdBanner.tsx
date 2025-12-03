import React, { useEffect } from "react";

type BannerSize =
  | "728x90"
  | "970x90"
  | "300x250"
  | "300x100"
  | "336x280"
  | "160x600"
  | "468x60";
type AdProvider = "adsense" | "propeller" | "custom";
type AdPlacement =
  | "homepage-top"
  | "planner-side"
  | "dashboard-bottom"
  | "small"
  | "planner-under-1"
  | "planner-under-2"
  | "planner-under-3"
  | "xl-large-left"
  | "xl-large-right"
  | "xl-large-center"
  | "xl-small-top"
  | "xl-small-bottom"
  | "medium-wide"
  | "medium-narrow"
  | "medium-mobile"
  | "xl-mobile"
  | "footer-fixed";

interface AdBannerProps {
  size: BannerSize;
  placement: AdPlacement;
  provider?: AdProvider;
  className?: string;
  containerStyle?: React.CSSProperties;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  size,
  placement,
  provider = "adsense",
  className = "",
  containerStyle = {},
}) => {
  // Mapa de tamaños
  const sizeMap: Record<BannerSize, { width: number; height: number }> = {
    "728x90": { width: 728, height: 90 },
    "970x90": { width: 970, height: 90 },
    "300x250": { width: 300, height: 250 },
    "300x100": { width: 300, height: 100 },
    "336x280": { width: 336, height: 280 },
    "160x600": { width: 160, height: 600 },
    "468x60": { width: 468, height: 60 },
  };

  // Mapa interno de adUnitId por ubicación
  const adUnitMap: Record<AdPlacement, string> = {
    "homepage-top": "1234567890",
    "planner-side": "2345678901",
    "dashboard-bottom": "3456789012",
    "planner-under-1": "4567890123",
    "planner-under-2": "5678901234",
    "planner-under-3": "6789012345",
    "xl-large-left": "7890123456",
    "xl-large-right": "8901234567",
    "xl-large-center": "9012345678",
    "xl-small-top": "0123456789",
    "xl-small-bottom": "1122334455",
    "medium-wide": "2233445566",
    "medium-narrow": "3344556677",
    "medium-mobile": "4455667788",
    small: "5566778899",
    "xl-mobile": "6677889900",
    "footer-fixed": "7788990011",
  };

  const adClientId = "ca-pub-XXXXXXXXXXXXXX"; // ← tu ID de cliente AdSense real
  const adUnitId = adUnitMap[placement];
  const style = sizeMap[size];

  useEffect(() => {
    if (provider === "adsense") {
      const scriptId = "adsense-script";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src =
          "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
        script.async = true;
        script.setAttribute("data-ad-client", adClientId);
        document.head.appendChild(script);
      } else {
        // Para reactivar adsbygoogle en render dinámico
        // @ts-expect-error - adsbygoogle is a global variable added by Google AdSense script
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    }
  }, [provider]);

  const renderAd = () => {
    switch (provider) {
      case "adsense":
        return (
          <ins
            className="adsbygoogle"
            style={{
              display: "inline-block",
              width: style.width,
              height: style.height,
            }}
            data-ad-client={adClientId}
            data-ad-slot={adUnitId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        );
      case "propeller":
        return (
          <div
            id={`propeller-ad-${placement}`}
            style={{
              width: style.width,
              height: style.height,
              backgroundColor: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #ddd",
            }}
          >
            <span style={{ color: "#666" }}>
              Propeller Ad - {placement} ({size})
            </span>
          </div>
        );
      case "custom":
      default:
        return (
          <div
            style={{
              width: style.width,
              height: style.height,
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
        );
    }
  };

  return (
    <div className={className} style={containerStyle}>
      {renderAd()}
    </div>
  );
};
