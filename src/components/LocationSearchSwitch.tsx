import React from "react";
import { useTranslation } from "react-i18next";

interface LocationSearchSwitchProps {
  locationMode: "place" | "address";
  onModeChange: (mode: "place" | "address") => void;
  className?: string;
}

export const LocationSearchSwitch: React.FC<LocationSearchSwitchProps> = ({
  locationMode,
  onModeChange,
  className = "",
}) => {
  const { t } = useTranslation();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {t("placeholders.place")}
      </span>
      <button
        type="button"
        onClick={() =>
          onModeChange(locationMode === "place" ? "address" : "place")
        }
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          locationMode === "address"
            ? "bg-blue-600"
            : "bg-gray-200 dark:bg-gray-700"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            locationMode === "address" ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {t("placeholders.address")}
      </span>
    </div>
  );
};
