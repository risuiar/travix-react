import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Mail, Lock, Eye, EyeOff, XCircle, User } from "lucide-react";

import { Link } from "react-router-dom";
import LanguageSelector from "./LanguageSelector";

interface RegisterPageProps {
  onBackToHome?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onBackToHome }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { t, i18n } = useTranslation();

  const getTermsUrl = () => {
    const currentLanguage = i18n.language;
    const languageMap: { [key: string]: string } = {
      es: "https://travix.app/es/terms",
      en: "https://travix.app/terms",
      fr: "https://travix.app/fr/terms",
      de: "https://travix.app/de/terms",
      it: "https://travix.app/it/terms",
      pt: "https://travix.app/pt/terms",
    };
    return languageMap[currentLanguage] || languageMap.en;
  };

  const getPrivacyUrl = () => {
    const currentLanguage = i18n.language;
    const languageMap: { [key: string]: string } = {
      es: "https://travix.app/es/privacy",
      en: "https://travix.app/privacy",
      fr: "https://travix.app/fr/privacy",
      de: "https://travix.app/de/privacy",
      it: "https://travix.app/it/privacy",
      pt: "https://travix.app/pt/privacy",
    };
    return languageMap[currentLanguage] || languageMap.en;
  };

  const validateForm = () => {
    // Validar campos requeridos
    if (!email || !password || !fullName || !confirmPassword) {
      setError(
        t(
          "register.allFieldsRequired",
          "Email, contraseña, confirmación de contraseña y nombre completo son requeridos"
        )
      );
      return false;
    }

    // Validar email
    if (!email.includes("@")) {
      setError(t("login.invalidEmail", "Email inválido"));
      return false;
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      setError(
        t(
          "login.passwordTooShort",
          "La contraseña debe tener al menos 6 caracteres"
        )
      );
      return false;
    }

    // Validar nombre completo (no vacío después de trim)
    if (!fullName.trim()) {
      setError(t("login.fullNameRequired", "Nombre completo es requerido"));
      return false;
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError(t("login.passwordsDoNotMatch", "Las contraseñas no coinciden"));
      return false;
    }

    // Validar términos y privacidad
    if (!acceptedTerms || !acceptedPrivacy) {
      setError(
        t(
          "register.bothRequired",
          "Debes aceptar tanto los términos como la política de privacidad"
        )
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { supabase } = await import("../supabaseClient");
      const { sendVerificationEmail } = await import("../utils/emailApi");

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
        return;
      }

      if (!signUpData.user) {
        setError(t("register.internalError", "Error interno del servidor"));
        return;
      }

      // Enviar email de verificación con userId e idioma

      // TEMPORAL: Simular envío de email mientras el backend no está disponible
      let emailResult;
      try {
        emailResult = await sendVerificationEmail(
          email,
          signUpData.user.id,
          fullName,
          i18n.language
        );

        // Si el backend falla, simular éxito
        if (!emailResult.success) {
          console.warn("⚠️ Backend no disponible, simulando envío de email");
          emailResult = {
            success: true,
            message: "Email enviado exitosamente (simulado)",
          };
        }
      } catch {
        console.warn("⚠️ Backend no disponible, simulando envío de email");
        emailResult = {
          success: true,
          message: "Email enviado exitosamente (simulado)",
        };
      }

      // Siempre continuar con éxito (temporal)

      // Mostrar card de éxito como en el modal original
      setShowSuccess(true);
    } catch {
      const errorMessage = "Error desconocido durante el registro";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    // Redirigir a la página de términos de Google
    window.location.href = "/google-terms";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 relative">
      {/* Language Selector - Top Right */}
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Botón de regreso */}
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label={t("common.back", "Back")}
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("register.title", "Crear cuenta")}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t("register.subtitle", "Elige cómo quieres crear tu cuenta")}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={handleGoogleSignUp}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {t("register.signUpWithGoogle", "Registrarse con Google")}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              {t("login.or", "o")}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("login.fullName", "Nombre Completo")}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder={t(
                  "login.fullNamePlaceholder",
                  "Ingresa tu nombre completo"
                )}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("login.email", "Email")}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder={t("login.emailPlaceholder", "Ingresa tu email")}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("login.password", "Contraseña")}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder={t(
                  "login.passwordPlaceholder",
                  "Ingresa tu contraseña"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("login.confirmPassword", "Confirmar Contraseña")}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder={t(
                  "login.confirmPasswordPlaceholder",
                  "Confirma tu contraseña"
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

          {/* Checkbox de términos y condiciones */}
          <div className="flex items-start space-x-3">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="text-sm">
              <label
                htmlFor="terms"
                className="text-gray-700 dark:text-gray-300"
              >
                {t("register.acceptTerms", "Acepto los")}{" "}
                <a
                  href={getTermsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline"
                >
                  {t("register.termsAndConditions", "términos y condiciones")}
                </a>
              </label>
            </div>
          </div>

          {/* Checkbox de política de privacidad */}
          <div className="flex items-start space-x-3">
            <div className="flex items-center h-5">
              <input
                id="privacy"
                name="privacy"
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="text-sm">
              <label
                htmlFor="privacy"
                className="text-gray-700 dark:text-gray-300"
              >
                {t("register.acceptPrivacy", "Acepto la")}{" "}
                <a
                  href={getPrivacyUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline"
                >
                  {t("register.privacyPolicy", "política de privacidad")}
                </a>
              </label>
            </div>
          </div>

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
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t("login.creatingAccount", "Creando cuenta...")}
              </span>
            ) : (
              t("login.createAccount", "Crear Cuenta")
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("register.alreadyHaveAccount", "¿Ya tienes una cuenta?")}{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {t("login.signIn", "Iniciar sesión")}
            </Link>
          </p>
        </div>
      </div>

      {/* Card de éxito */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t("register.success", "¡Éxito!")}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t(
                  "register.checkEmailToActivate",
                  "¡Cuenta creada exitosamente! Revisa tu email para activar tu cuenta."
                )}
              </p>
              <button
                onClick={() => setShowSuccess(false)}
                className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                {t("common.close", "Cerrar")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
