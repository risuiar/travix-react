import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";

interface ChangeAccountButtonProps {
  onLoginSuccess?: () => void;
  onLoginError?: (error: Error | string) => void;
}

export const ChangeAccountButton: React.FC<ChangeAccountButtonProps> = ({
  onLoginSuccess,
  onLoginError,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const handleChangeAccount = async () => {
    setIsLoading(true);
    try {
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

      // Limpiar la sesión de Google OAuth para forzar selección de cuenta
      try {
        if (window.google?.accounts?.id?.disableAutoSelect) {
          window.google.accounts.id.disableAutoSelect();
        }
      } catch {
        // Google OAuth cleanup not available
      }

      // Use current window location for redirection
      const redirectUrl = window.location.origin;

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl + "/travels",
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (authError) {
        onLoginError?.(authError);
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
    <button
      onClick={handleChangeAccount}
      disabled={isLoading || !isConfigured}
      className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-gray-200"
      title={t(
        "login.changeAccountTooltip",
        "Select a different Google account"
      )}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-2.5 w-2.5 border-b-2 border-gray-600"></div>
      ) : (
        <RefreshCw className="w-2.5 h-2.5" />
      )}
    </button>
  );
};
