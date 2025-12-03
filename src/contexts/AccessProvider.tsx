import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { useUserAuthContext } from "./useUserAuthContext";
import { AccessContext } from "./AccessContext";

export const AccessProvider = ({ children }: { children: React.ReactNode }) => {
  const { userAuthData } = useUserAuthContext();
  const { t } = useTranslation();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [accessChecked, setAccessChecked] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);

  // Ref para evitar múltiples llamadas
  const isChecking = useRef(false);

  const checkAccess = useCallback(async () => {
    if (!userAuthData || isChecking.current) {
      return;
    }

    isChecking.current = true;
    setCheckingAccess(true);
    setAccessError(null);

    try {
      // Verificar si el usuario está confirmado
      if (userAuthData.email_confirmed_at) {
        setHasAccess(true);
        setAccessError(null);
      } else {
        setHasAccess(false);
        setAccessError(
          t(
            "login.emailNotVerified",
            "Please verify your email before accessing the application."
          )
        );
      }
    } catch {
      // En caso de error, dar acceso por defecto para evitar bloqueos
      setHasAccess(true);
      setAccessError(null);
    } finally {
      setCheckingAccess(false);
      setAccessChecked(true);
      isChecking.current = false;
    }
  }, [userAuthData, t]);

  // Verificar acceso cuando el usuario esté disponible (solo una vez)
  useEffect(() => {
    if (userAuthData && !accessChecked && !isChecking.current) {
      checkAccess();
    }
  }, [userAuthData, accessChecked, checkAccess]);

  // Reset cuando el usuario cambie
  useEffect(() => {
    if (!userAuthData) {
      setHasAccess(null);
      setAccessChecked(false);
      setAccessError(null);
      isChecking.current = false;
    }
  }, [userAuthData]);

  return (
    <AccessContext.Provider
      value={{
        hasAccess,
        accessChecked,
        checkingAccess,
        accessError,
        checkAccess,
      }}
    >
      {children}
    </AccessContext.Provider>
  );
};
