import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useUserAuthContext } from "./useUserAuthContext";
import { supabase } from "../supabaseClient";
import { LanguageContext } from "./LanguageContext";

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { i18n } = useTranslation();
  const { userAuthData } = useUserAuthContext();
  const [currentLanguage, setCurrentLanguage] = useState<string>("es");
  const [isLoading, setIsLoading] = useState(true);
  const isInitialized = React.useRef(false);

  // Función para cambiar el idioma de manera sincronizada
  const setLanguage = async (language: string) => {
    const normalizedLanguage = language.split("-")[0];
    const supportedLanguages = ["es", "en", "de", "it", "fr", "pt"];

    // Verificar que el idioma esté soportado
    if (!supportedLanguages.includes(normalizedLanguage)) {
      console.warn(
        `Idioma no soportado: ${language}, usando español por defecto`
      );
      return;
    }

    // Solo cambiar si es diferente
    if (normalizedLanguage !== currentLanguage) {
      try {
        // Actualizar i18n
        await i18n.changeLanguage(normalizedLanguage);

        // Actualizar localStorage
        localStorage.setItem("i18nextLng", normalizedLanguage);

        // Actualizar estado local
        setCurrentLanguage(normalizedLanguage);

        // Actualizar en la base de datos si hay usuario (sin esperar respuesta)
        if (userAuthData) {
          supabase
            .from("profiles")
            .update({ language: normalizedLanguage })
            .eq("id", userAuthData.id);
        }
      } catch (error) {
        console.error("Error changing language:", error);
      }
    }
  };

  // Inicializar idioma al cargar la aplicación (solo una vez)
  useEffect(() => {
    if (isInitialized.current) return;

    const initializeLanguage = async () => {
      try {
        let language = localStorage.getItem("i18nextLng");

        // Si no hay idioma en localStorage, intentar obtener del perfil del usuario
        if (!language && userAuthData?.language) {
          language = userAuthData.language;
        }

        // Si aún no hay idioma, usar el idioma actual de i18n o español por defecto
        if (!language) {
          language = i18n.language || "es";
        }

        // Normalizar el idioma y verificar que esté soportado
        const normalizedLanguage = language.split("-")[0];
        const supportedLanguages = ["es", "en", "de", "it", "fr", "pt"];
        const finalLanguage = supportedLanguages.includes(normalizedLanguage)
          ? normalizedLanguage
          : "es";

        // Asegurar que el idioma esté sincronizado solo si es diferente
        if (i18n.language !== finalLanguage) {
          try {
            await i18n.changeLanguage(finalLanguage);
          } catch {
            // Ignore errors in test environment
          }
        }

        setCurrentLanguage(finalLanguage);
        setIsLoading(false);
        isInitialized.current = true;
      } catch {
        // Fallback a español
        const fallbackLanguage = "es";
        try {
          if (i18n.language !== fallbackLanguage) {
            await i18n.changeLanguage(fallbackLanguage);
          }
        } catch {
          // Ignore errors in test environment
        }
        setCurrentLanguage(fallbackLanguage);
        setIsLoading(false);
        isInitialized.current = true;
      }
    };

    initializeLanguage();
  }, [i18n]);

  return (
    <LanguageContext.Provider
      value={{ currentLanguage, setLanguage, isLoading }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
