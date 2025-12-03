import React, { useState } from "react";
import { User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUserAuthContext } from "../contexts/useUserAuthContext";
import { SettingsModal } from "./Modal/SettingsModal";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { UserTierBadge } from "./UserTierBadge";
import logoImage from "../assets/images/logo.webp";

interface HeaderProps {
  currentView?: string;
  onViewChange?: (view: string) => void;
  showTabs?: boolean;
}

export function Header({
  currentView,
  onViewChange,
  showTabs = true,
}: HeaderProps) {
  const [showSettings, setShowSettings] = useState(false);
  const { userAuthData } = useUserAuthContext();
  const { t } = useTranslation();

  const views = [
    { id: "overview", label: t("tabs.overview"), icon: "📊" },
    {
      id: "daily-planner",
      label: t("tabs.dailyPlanner"),
      icon: "📅",
    },
    { id: "expenses", label: t("tabs.expenses"), icon: "💰" },
  ];

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-3 sticky top-0 z-40 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
      <div className="relative flex items-center w-full">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <a href="https://travix.app" className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center" title="Ir a viajes">
            <img
              src={logoImage}
              alt="Travix Logo"
              className="w-full h-full object-contain cursor-pointer"
            />
          </a>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {t("common.appName")}
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("header.tagline")}
              </p>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                BETA
              </span>
            </div>
          </div>
          <div className="sm:hidden">
            <h1 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {t("common.appName")}
            </h1>
            <div className="flex items-center gap-1">
              <span className="inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                BETA
              </span>
            </div>
          </div>
        </div>

        {/* Always show tabs above, responsive: only icons on mobile, icon+text on desktop */}
        {showTabs && (
          <nav className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-2xl p-2">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => onViewChange?.(view.id)}
                className={`flex items-center justify-center gap-2 px-4 xl:px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  currentView === view.id
                    ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/20 scale-105"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-gray-600/50"
                }`}
              >
                <span className="text-lg">{view.icon}</span>
                <span className="hidden lg:inline text-sm font-semibold">
                  {view.label}
                </span>
              </button>
            ))}
          </nav>
        )}
        {/* User and notifications always right */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-3">
          {userAuthData ? (
            <div className="flex items-center gap-2">
              <UserTierBadge size="sm" className="hidden sm:inline-flex" />
              <button
                onClick={() => {
                  setShowSettings(true);
                }}
                className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden p-0 border-0 focus:outline-none"
                aria-label="Profile"
              >
                {userAuthData?.avatar_url ? (
                  <img
                    src={userAuthData.avatar_url}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          ) : (
            <GoogleLoginButton
              onLoginSuccess={() => {
                // Login successful
              }}
              onLoginError={(error) => {
                console.error("Login error:", error);
              }}
            />
          )}
        </div>
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </header>
  );
}
