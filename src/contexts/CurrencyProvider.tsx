import React, { useState, useEffect } from "react";
import { useUserAuthContext } from "./useUserAuthContext";
import { supabase } from "../supabaseClient";
import { CurrencyContext } from "./CurrencyContext";

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { userAuthData } = useUserAuthContext();
  const [userCurrency, setUserCurrencyState] = useState<string>("EUR");
  const [isLoading, setIsLoading] = useState(false);

  // Actualizar la moneda cuando se cargue el perfil
  useEffect(() => {
    if (userAuthData?.default_currency) {
      setUserCurrencyState(userAuthData.default_currency);
    } else {
      // Fallback a localStorage si no hay perfil
      const savedCurrency = localStorage.getItem("defaultCurrency");
      if (savedCurrency) {
        setUserCurrencyState(savedCurrency);
      }
    }
  }, [userAuthData]);

  // Función para cambiar la moneda
  const setUserCurrency = async (currency: string) => {
    // Actualizar estado local inmediatamente para UI responsiva
    setUserCurrencyState(currency);
    localStorage.setItem("defaultCurrency", currency);

    // Si hay un perfil activo, actualizar también en la base de datos
    if (userAuthData) {
      setIsLoading(true);
      try {
        // Usar fetch directo a la tabla profiles en lugar de la vista user_auth_data
        const { error } = await supabase
          .from("profiles")
          .update({ default_currency: currency })
          .eq("id", userAuthData.id);

        if (error) {
          throw error;
        }
      } catch (error) {
        console.error("Error updating currency in profile:", error);
        // Si falla la actualización en la DB, revertir el cambio local
        setUserCurrencyState(userAuthData.default_currency || "EUR");
        localStorage.setItem(
          "defaultCurrency",
          userAuthData.default_currency || "EUR"
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        userCurrency,
        setUserCurrency,
        isLoading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
