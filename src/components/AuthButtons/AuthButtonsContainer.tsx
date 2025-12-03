import React from "react";
import { useTranslation } from "react-i18next";
import { GoogleLoginButtons } from "./GoogleLoginButtons.tsx";
import { FacebookLoginButton } from "./FacebookLoginButton.tsx";

import { EmailAuthButtons } from "./EmailAuthButtons.tsx";

interface AuthButtonsContainerProps {
  onLoginSuccess?: () => void;
  onLoginError?: (error: Error | string) => void;
  showEmailAuth?: boolean;
  showFacebookAuth?: boolean;

}

export const AuthButtonsContainer: React.FC<AuthButtonsContainerProps> = ({
  onLoginSuccess,
  onLoginError,
  showEmailAuth = true,
  showFacebookAuth = false,

}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {/* Google Login - Always shown with account selection option */}
      <GoogleLoginButtons
        onLoginSuccess={onLoginSuccess}
        onLoginError={onLoginError}
      />

      {/* Facebook Login - Optional */}
      {showFacebookAuth && (
        <FacebookLoginButton
          onLoginSuccess={onLoginSuccess}
          onLoginError={onLoginError}
          variant="secondary"
        />
      )}

      {/* Email Auth - Optional */}
      {showEmailAuth && (
        <EmailAuthButtons
          onLoginSuccess={onLoginSuccess}
          onLoginError={onLoginError}
        />
      )}

      {/* Divider if multiple options */}
      {(showFacebookAuth || showEmailAuth) && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
              {t("login.or", "o")}
            </span>
          </div>
        </div>
      )}

      {/* Coming soon message for disabled features */}
      {(!showFacebookAuth || !showEmailAuth) && (
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t(
              "login.moreOptionsComingSoon",
              "Más opciones de login próximamente"
            )}
          </p>
        </div>
      )}
    </div>
  );
};
