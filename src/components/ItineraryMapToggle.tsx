import React from "react";
import { MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ItineraryMapToggleProps {
  isVisible: boolean;
  onToggle: () => void;
}

const ItineraryMapToggle: React.FC<ItineraryMapToggleProps> = ({
  isVisible,
  onToggle,
}) => {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm"
      title={isVisible ? t("map.hideMap") : t("map.showMap")}
    >
      <MapPin className="w-4 h-4" />
      {isVisible ? t("map.hideMap") : t("map.showMap")}
    </button>
  );
};

export default ItineraryMapToggle;
