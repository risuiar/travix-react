import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../hooks/useTheme";
import {
  Plane,
  MapPin,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  Plus,
  Calendar,
  Compass,
  Clock,
} from "lucide-react";

interface TravelLoadingAnimationProps {
  message?: string;
  isCompleted?: boolean;
  hasError?: boolean;
  activitiesCount?: number;
  onRetry?: () => void;
  completionMessages?: string[];
  showActivityBreakdown?: boolean;
  onClose?: () => void;
}

const TravelLoadingAnimation: React.FC<TravelLoadingAnimationProps> = ({
  message = "Crafting your perfect itinerary...",
  isCompleted = false,
  hasError = false,
  activitiesCount = 0,
  onRetry,
  completionMessages = [],
  showActivityBreakdown = false,
  onClose,
}) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();

  // Error State
  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="relative">
          {/* Error background circles */}
          <div className="absolute inset-0 -m-20">
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-red-200 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-orange-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 right-0 w-28 h-28 bg-red-200 rounded-full opacity-20 animate-pulse delay-500"></div>
          </div>

          {/* Main content container */}
          <div
            className={`relative rounded-3xl shadow-2xl p-12 max-w-lg mx-auto ${
              isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
            }`}
          >
            {/* Error icon */}
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 border-2 border-red-300 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <AlertCircle className="w-16 h-16 text-red-600 animate-pulse" />
              </div>
            </div>

            {/* Error text */}
            <div className="text-center">
              <h2
                className={`text-2xl font-bold mb-4 ${
                  isDarkMode ? "text-gray-100" : "text-gray-800"
                }`}
              >
                {t("loading.oopsError")}
              </h2>
              <p
                className={`mb-8 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {t("loading.errorMessage")}
              </p>

              {/* Retry button */}
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-full text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>{t("common.tryAgain")}</span>
                </button>
              )}

              {/* Close button */}
              {onClose && (
                <button
                  onClick={onClose}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-full text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl mt-4"
                >
                  {t("common.close")}
                </button>
              )}

              {/* Error indicators */}
              <div className="flex justify-center space-x-6 text-red-400 mt-6">
                <AlertCircle className="w-6 h-6" />
                <RefreshCw className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Error floating elements */}
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-red-400 rounded-full opacity-70 animate-ping"></div>
          <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-orange-400 rounded-full opacity-70 animate-ping delay-500"></div>
        </div>
      </div>
    );
  }

  // Success State
  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="relative">
          {/* Success background circles */}
          <div className="absolute inset-0 -m-20">
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-emerald-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 right-0 w-28 h-28 bg-teal-200 rounded-full opacity-20 animate-pulse delay-500"></div>
          </div>

          {/* Main content container */}
          <div
            className={`relative rounded-3xl shadow-2xl p-12 max-w-lg mx-auto ${
              isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
            }`}
          >
            {/* Success checkmark */}
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 border-2 border-green-300 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-green-600 animate-bounce" />
              </div>
            </div>

            {/* Success text */}
            <div className="text-center">
              <h2
                className={`text-2xl font-bold mb-4 ${
                  isDarkMode ? "text-gray-100" : "text-gray-800"
                }`}
              >
                {t("loading.itineraryComplete")}
              </h2>

              {/* Main activity count */}
              <p className="text-lg text-green-600 font-semibold mb-6">
                {activitiesCount}{" "}
                {activitiesCount === 1
                  ? t("common.activity")
                  : t("common.activities")}{" "}
                {activitiesCount === 1 ? t("common.has") : t("common.have")}{" "}
                {t("common.been")} {t("common.added")}
              </p>

              {/* Custom completion messages */}
              {completionMessages.length > 0 && (
                <div className="mb-6 space-y-3">
                  {completionMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-center space-x-2 text-sm rounded-lg py-2 px-4 animate-fade-in ${
                        isDarkMode
                          ? "text-gray-300 bg-green-900/20"
                          : "text-gray-600 bg-green-50"
                      }`}
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <Plus className="w-4 h-4 text-green-500" />
                      <span>{msg}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Activity breakdown */}
              {showActivityBreakdown && completionMessages.length > 0 && (
                <div
                  className={`mb-6 p-4 rounded-lg ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <Calendar
                      className={`w-5 h-5 ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {t("loading.activitySummary")}
                    </span>
                  </div>
                  <div
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {completionMessages.length}{" "}
                    {completionMessages.length === 1
                      ? t("common.day")
                      : t("common.days")}{" "}
                    {t("common.planned")}
                  </div>
                </div>
              )}

              {/* Success indicators */}
              <div className="flex justify-center space-x-6 text-green-500 mb-6">
                <MapPin className="w-6 h-6" />
                <Plane className="w-6 h-6" />
                <Compass className="w-6 h-6" />
              </div>

              {/* Botón de cerrar */}
              {onClose && (
                <button
                  onClick={onClose}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-full text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl mt-2"
                >
                  {t("common.close")}
                </button>
              )}
            </div>
          </div>

          {/* Success floating elements */}
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-400 rounded-full opacity-70 animate-ping"></div>
          <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-emerald-400 rounded-full opacity-70 animate-ping delay-500"></div>
        </div>
      </div>
    );
  }

  // Loading State
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        {/* Animated background circles */}
        <div className="absolute inset-0 -m-20">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-0 w-28 h-28 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-500"></div>
        </div>

        {/* Main content container */}
        <div
          className={`relative rounded-3xl shadow-2xl p-12 max-w-md mx-auto ${
            isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
          }`}
        >
          {/* Animated plane flying in circular path */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 border-2 border-dashed border-blue-300 rounded-full animate-spin-slow"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Plane className="w-8 h-8 text-blue-600 animate-bounce" />
            </div>
          </div>

          {/* Animated location pins */}
          <div className="flex justify-center space-x-4 mb-8">
            <div className="animate-pulse">
              <MapPin className="w-6 h-6 text-red-500" />
            </div>
            <div className="animate-pulse delay-300">
              <MapPin className="w-6 h-6 text-green-500" />
            </div>
            <div className="animate-pulse delay-600">
              <MapPin className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="animate-pulse delay-900">
              <MapPin className="w-6 h-6 text-purple-500" />
            </div>
          </div>

          {/* Loading text */}
          <div className="text-center">
            <h2
              className={`text-2xl font-bold mb-4 animate-pulse ${
                isDarkMode ? "text-gray-100" : "text-gray-800"
              }`}
            >
              {t("loading.title")}
            </h2>
            <p
              className={`mb-6 animate-pulse ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {message}
            </p>

            {/* Progress dots */}
            <div className="flex justify-center space-x-2 mb-6">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-200"></div>
            </div>

            {/* Additional icons */}
            <div className="flex justify-center space-x-6 text-gray-400">
              <Compass className="w-5 h-5 animate-spin" />
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full opacity-70 animate-ping"></div>
        <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400 rounded-full opacity-70 animate-ping delay-500"></div>
      </div>

      {/* Bottom status */}
      <div className="mt-8 text-center">
        <div
          className={`flex items-center justify-center space-x-2 ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full animate-pulse ${
              isDarkMode ? "bg-gray-500" : "bg-gray-300"
            }`}
          ></div>
          <span className="text-sm">{t("loading.analyzing")}</span>
          <div
            className={`w-2 h-2 rounded-full animate-pulse delay-200 ${
              isDarkMode ? "bg-gray-500" : "bg-gray-300"
            }`}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TravelLoadingAnimation;
