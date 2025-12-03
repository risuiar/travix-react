import { useEffect } from "react";
import {
  Crown,
  X,
  Sparkles,
  Infinity as InfinityIcon,
  FileText,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAnalytics } from "../hooks/useAnalytics";

interface PremiumBannerProps {
  type: "ads" | "trips" | "ai" | "export";
  onUpgrade: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function PremiumBanner({
  type,
  onUpgrade,
  onDismiss,
  className = "",
}: PremiumBannerProps) {
  const { t } = useTranslation();
  const { trackEvent } = useAnalytics();

  // Track banner impression when component mounts
  useEffect(() => {
    trackEvent("premium_banner_shown", {
      banner_type: type,
      position: className,
    });
  }, [type, className, trackEvent]);

  // Handle upgrade click with tracking
  const handleUpgrade = () => {
    trackEvent("premium_banner_upgrade_clicked", {
      banner_type: type,
      position: className,
    });
    onUpgrade();
  };

  // Handle dismiss click with tracking
  const handleDismiss = () => {
    trackEvent("premium_banner_dismissed", {
      banner_type: type,
      position: className,
    });
    if (onDismiss) {
      onDismiss();
    }
  };

  const getBannerContent = () => {
    switch (type) {
      case "ads":
        return {
          icon: Crown,
          title: t("premiumBanner.removeAds.title"),
          subtitle: t("premiumBanner.removeAds.subtitle"),
          cta: t("premiumBanner.removeAds.cta"),
          gradient: "from-purple-500 to-pink-500",
        };
      case "trips":
        return {
          icon: InfinityIcon,
          title: t("premiumBanner.unlimitedTrips.title"),
          subtitle: t("premiumBanner.unlimitedTrips.subtitle"),
          cta: t("premiumBanner.unlimitedTrips.cta"),
          gradient: "from-blue-500 to-purple-500",
        };
      case "ai":
        return {
          icon: Sparkles,
          title: t("premiumBanner.unlimitedAI.title"),
          subtitle: t("premiumBanner.unlimitedAI.subtitle"),
          cta: t("premiumBanner.unlimitedAI.cta"),
          gradient: "from-indigo-500 to-purple-500",
        };
      case "export":
        return {
          icon: FileText,
          title: t("premiumBanner.exportPDF.title"),
          subtitle: t("premiumBanner.exportPDF.subtitle"),
          cta: t("premiumBanner.exportPDF.cta"),
          gradient: "from-green-500 to-blue-500",
        };
    }
  };

  const content = getBannerContent();
  const Icon = content.icon;

  return (
    <div
      className={`bg-gradient-to-r ${content.gradient} text-white rounded-xl p-4 shadow-lg relative overflow-hidden ${className}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-2 right-2 w-16 h-16 border border-white/30 rounded-full"></div>
        <div className="absolute bottom-2 left-2 w-12 h-12 border border-white/20 rounded-full"></div>
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm sm:text-base">
              {content.title}
            </h3>
            <p className="text-white/80 text-xs sm:text-sm">
              {content.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleUpgrade}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105"
          >
            {content.cta}
          </button>
          {onDismiss && (
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
