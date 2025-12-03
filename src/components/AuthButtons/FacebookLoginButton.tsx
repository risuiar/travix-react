import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthButtonBase } from "./AuthButtonBase.tsx";

interface FacebookLoginButtonProps {
  onLoginSuccess?: () => void;
  onLoginError?: (error: Error | string) => void;
  variant?: "primary" | "secondary";
}

export const FacebookLoginButton: React.FC<FacebookLoginButtonProps> = ({
  onLoginSuccess,
  onLoginError,
  variant = "primary",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // This is a placeholder for future implementation

      // Check if Supabase is configured
      if (
        !import.meta.env.VITE_SUPABASE_URL ||
        !import.meta.env.VITE_SUPABASE_ANON_KEY
      ) {
        const errorMsg = t(
          "login.supabaseNotConfigured",
          "Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
        );
        onLoginError?.(errorMsg);
        return;
      }

      // Dynamic import to prevent build issues
      const { supabase } = await import("../../supabaseClient");

      // Limpiar cualquier sesión existente antes de intentar login
      await supabase.auth.signOut();

      // Use current window location for redirection
      const redirectUrl = window.location.origin;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: redirectUrl + "/travels",
        },
      });

      if (error) {
        onLoginError?.(error);
      } else {
        onLoginSuccess?.();
      }
    } catch (error) {
      onLoginError?.(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  const isConfigured =
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

  return (
    <AuthButtonBase
      onLoginSuccess={onLoginSuccess}
      onLoginError={onLoginError}
      isLoading={isLoading}
      disabled={!isConfigured}
      variant={variant}
      onClick={handleLogin}
      title={
        !isConfigured
          ? t("login.supabaseNotConfiguredTooltip", "Supabase not configured")
          : t("login.facebookLoginTooltip", "Sign in with Facebook")
      }
    >
      {/* Facebook Icon */}
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#1877F2"
          d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
        />
      </svg>

      <span className="hidden sm:inline">
        {isLoading
          ? t("login.signingIn", "Signing in...")
          : isConfigured
          ? t("login.signInWithFacebook", "Sign in with Facebook")
          : t("login.notConfigured", "Not configured")}
      </span>
      <span className="sm:hidden">
        {isLoading
          ? t("login.signingIn", "Signing in...")
          : isConfigured
          ? t("login.signIn", "Sign in")
          : t("login.notConfigured", "Not configured")}
      </span>
    </AuthButtonBase>
  );
};
