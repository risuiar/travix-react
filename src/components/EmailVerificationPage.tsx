import React, { useLayoutEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { verifyToken } from "../utils/emailApi";

const EmailVerificationPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const hasVerifiedRef = useRef(false);

  const verifyEmail = useCallback(
    async (token: string) => {
      if (hasVerifiedRef.current) return;
      hasVerifiedRef.current = true;

      try {
        const result = await verifyToken(token);
        if (result.success) {
          setStatus("success");
          // Si el backend envía una clave, la traducimos
          const msgKey = result.message;
          if (msgKey && /^[A-Z0-9_]+$/.test(msgKey)) {
            setMessage(t(`login.${msgKey}`));
          } else {
            setMessage(msgKey || t("login.emailVerified", "Email verified successfully"));
          }
        } else {
          setStatus("error");
          const msgKey = result.message;
          if (msgKey && /^[A-Z0-9_]+$/.test(msgKey)) {
            setMessage(t(`login.${msgKey}`));
          } else {
            setMessage(msgKey || t("login.verificationError", "Verification failed"));
          }
        }
      } catch (error) {
        setStatus("error");
        // Si el error es una clave del backend, traducir
        if (error && typeof error === "object" && "error" in error && typeof error.error === "string" && /^[A-Z0-9_]+$/.test(error.error)) {
          setMessage(t(`login.${error.error}`));
        } else if (error instanceof Error) {
          setMessage(error.message);
        } else {
          setMessage(t("login.verificationError", "Verification failed"));
        }
      }
    },
    [t]
  );

  useLayoutEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      verifyEmail(token);
    }
  }, [searchParams, verifyEmail]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center">
          {status === "loading" && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t("login.verifyingEmail", "Verifying email...")}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {t("login.pleaseWait", "Please wait...")}
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto mb-4 w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t("login.verificationComplete", "Verification complete")}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{message}</p>

              {/* Botón para ir al login */}
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {t("login.backToLogin", "Go to Login")}
              </button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto mb-4 w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
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
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {/* Si el mensaje es una clave, usa la traducción como título también */}
                {message && /^[A-Z0-9_]+$/.test(message)
                  ? t(`login.${message}`)
                  : t("login.verificationFailed", "Verification failed")}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {/* Si el mensaje es una clave, no mostramos nada debajo. Si es texto literal, intentamos traducirlo si coincide con un error conocido. */}
                {message && /^[A-Z0-9_]+$/.test(message)
                  ? ""
                  : message === "Failed to verify token"
                  ? t("login.TOKEN_INVALID_OR_USED")
                  : message}
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {t("login.backToLogin", "Back to login")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
