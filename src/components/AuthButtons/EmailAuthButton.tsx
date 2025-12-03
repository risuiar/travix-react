import React from "react";
import { useTranslation } from "react-i18next";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../../utils/env";
import { AuthButtonBase } from "./AuthButtonBase.tsx";
import { Mail } from "lucide-react";

interface EmailAuthButtonProps {
  onLoginSuccess?: () => void;
  onLoginError?: (error: Error | string) => void;
  variant?: "primary" | "secondary";
  mode?: "login" | "register";
  onClick: () => void;
}

export const EmailAuthButton: React.FC<EmailAuthButtonProps> = ({
  onLoginSuccess,
  onLoginError,
  variant = "primary",
  mode = "login",
  onClick,
}) => {
  const { t } = useTranslation();

  const isConfigured = SUPABASE_URL && SUPABASE_ANON_KEY;

  const getButtonText = () => {
    if (!isConfigured) return t("login.notConfigured", "Not configured");

    return mode === "register"
      ? t("login.registerWithEmail", "Register with Email")
      : t("login.signInWithEmail", "Sign in with Email");
  };

  return (
    <AuthButtonBase
      onLoginSuccess={onLoginSuccess}
      onLoginError={onLoginError}
      isLoading={false}
      disabled={!isConfigured}
      variant={variant}
      onClick={onClick}
      title={
        !isConfigured
          ? t("login.supabaseNotConfiguredTooltip", "Supabase not configured")
          : mode === "register"
          ? t("login.registerWithEmailTooltip", "Create account with email")
          : t("login.signInWithEmailTooltip", "Sign in with email")
      }
    >
      <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />

      <span className="hidden sm:inline">{getButtonText()}</span>
      <span className="sm:hidden">
        {mode === "register"
          ? t("login.register", "Register")
          : t("login.signIn", "Sign in")}
      </span>
    </AuthButtonBase>
  );
};
