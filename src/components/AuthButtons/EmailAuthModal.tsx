import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ModalClean from "../Modal/ModalClean";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { sendVerificationEmail } from "../../utils/emailApi";

interface EmailAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "register";
  onSuccess: () => void;
  onError: (error: Error | string) => void;
}

type AuthStep = "form" | "success";

export const EmailAuthModal: React.FC<EmailAuthModalProps> = ({
  isOpen,
  onClose,
  mode,
  onSuccess,
  onError,
}) => {
  const [currentStep, setCurrentStep] = useState<AuthStep>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, i18n } = useTranslation();

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
    setError(null);
    setCurrentStep("form");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    if (!email || !password) {
      setError(
        t("login.emailAndPasswordRequired", "Email y contraseña son requeridos")
      );
      return false;
    }

    if (!email.includes("@")) {
      setError(t("login.invalidEmail", "Email inválido"));
      return false;
    }

    if (password.length < 6) {
      setError(
        t(
          "login.passwordTooShort",
          "La contraseña debe tener al menos 6 caracteres"
        )
      );
      return false;
    }

    if (mode === "register") {
      if (!fullName.trim()) {
        setError(t("login.fullNameRequired", "Nombre completo es requerido"));
        return false;
      }

      if (password !== confirmPassword) {
        setError(
          t("login.passwordsDoNotMatch", "Las contraseñas no coinciden")
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { supabase } = await import("../../supabaseClient");

      if (mode === "register") {
        // Crear usuario en Supabase primero
        const { data: signUpData, error: signUpError } =
          await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              },
            },
          });

        if (signUpError) {
          setError(signUpError.message);
          onError(signUpError);
          return;
        }

        if (!signUpData.user) {
          const error = new Error(
            t("login.INTERNAL_SERVER_ERROR", "Internal server error")
          );
          setError(error.message);
          onError(error);
          return;
        }

        // Enviar email de verificación con userId e idioma
        const emailResult = await sendVerificationEmail(
          email,
          signUpData.user.id,
          fullName,
          i18n.language
        );

        if (!emailResult.success) {
          const error = new Error(
            emailResult.error ||
              t("login.EMAIL_SEND_ERROR", "Error sending email")
          );
          setError(error.message);
          onError(error);
          return;
        }

        // Mostrar mensaje de éxito (sin timeout automático)
        setCurrentStep("success");
      } else {
        // Inicio de sesión con verificación de email
        try {
          // 1. Hacer login con Supabase
          const {
            error,
          } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            if (error.message.includes("Invalid login credentials")) {
              setError(t("login.invalidCredentials", "Invalid credentials"));
              onError(error);
            } else if (error.message.includes("Email not confirmed")) {
              setError(
                t(
                  "login.emailNotConfirmed",
                  "Please verify your email before signing in"
                )
              );
              onError(error);
            } else {
              setError(error.message);
              onError(error);
            }
            return;
          }

          // Login exitoso: redirigir sin verificar email manualmente
          onSuccess();
          handleClose();
        } catch (error) {
          console.error("Error en login:", error);
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          setError(errorMessage);
          onError(error instanceof Error ? error : new Error(errorMessage));
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  const renderForm = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 relative">
      {/* Botón cerrar */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        aria-label={t("login.close", "Close")}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {mode === "register"
            ? t("login.createAccount", "Create Account")
            : t("login.signIn", "Sign In")}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          {mode === "register"
            ? t(
                "login.createAccountDescription",
                "Create your account to start planning trips"
              )
            : t("login.signInDescription", "Access your account to continue")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("login.fullName", "Full Name")}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder={t(
                  "login.fullNamePlaceholder",
                  "Enter your full name"
                )}
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t("login.email", "Email")}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder={t("login.emailPlaceholder", "Enter your email")}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t("login.password", "Password")}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder={t(
                "login.passwordPlaceholder",
                "Enter your password"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {mode === "register" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("login.confirmPassword", "Confirm Password")}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder={t(
                  "login.confirmPasswordPlaceholder",
                  "Confirm your password"
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700 dark:text-red-400">
              {error}
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {mode === "register"
                ? t("login.creatingAccount", "Creating account...")
                : t("login.signingIn", "Signing in...")}
            </span>
          ) : mode === "register" ? (
            t("login.createAccount", "Create Account")
          ) : (
            t("login.signIn", "Sign In")
          )}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t(
            "login.privacyNotice",
            "By continuing, you agree to our terms of service and privacy policy"
          )}
        </p>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 relative">
      {/* Botón cerrar */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        aria-label={t("login.close", "Close")}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t("login.success", "Success!")}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {mode === "register"
            ? t(
                "login.checkEmailToActivate",
                "Check your email inbox to activate your account"
              )
            : t("login.signInSuccess", "You have signed in successfully")}
        </p>

        {/* Botón para cerrar manualmente */}
        <button
          onClick={handleClose}
          className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          {t("login.close", "Close")}
        </button>
      </div>
    </div>
  );

  return (
    <ModalClean isOpen={isOpen} onClose={handleClose} className="max-w-md">
      {currentStep === "form" && renderForm()}
      {currentStep === "success" && renderSuccess()}
    </ModalClean>
  );
};
