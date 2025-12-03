import React, { useState, useEffect } from "react";
import { useUserAuthContext } from "./useUserAuthContext";
import { supabase } from "../supabaseClient";
import { ThemeContext } from "./ThemeContext";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { userAuthData } = useUserAuthContext();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark" | "auto">(
    "auto"
  );

  // Función para aplicar el tema al DOM
  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setIsDarkMode(dark);
  };

  // Función para obtener la preferencia del sistema
  const getSystemPreference = () => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  // Función para cambiar el tema
  const setTheme = async (theme: "light" | "dark" | "auto") => {
    setCurrentTheme(theme);

    let isDark = false;

    if (theme === "auto") {
      isDark = getSystemPreference();
    } else {
      isDark = theme === "dark";
    }

    applyTheme(isDark);

    // Actualizar en el perfil si hay usuario
    if (userAuthData) {
      try {
        await supabase
          .from("profiles")
          .update({ theme })
          .eq("id", userAuthData.id);
      } catch (error) {
        console.error("Error updating theme in profile:", error);
      }
    }

    // Guardar en localStorage como fallback
    localStorage.setItem("theme", theme);
  };

  // Función para alternar el tema
  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setTheme(newTheme);
  };

  // Escuchar cambios en la preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (currentTheme === "auto") {
        applyTheme(getSystemPreference());
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [currentTheme]);

  // Inicializar tema al cargar
  useEffect(() => {
    // Prioridad: 1. Perfil del usuario, 2. localStorage, 3. Preferencia del sistema
    let theme: "light" | "dark" | "auto" = "auto";

    if (userAuthData?.theme) {
      theme = userAuthData.theme as "light" | "dark" | "auto";
    } else {
      const savedTheme = localStorage.getItem("theme") as
        | "light"
        | "dark"
        | "auto";
      if (savedTheme) {
        theme = savedTheme;
      }
    }

    setCurrentTheme(theme);

    let isDark = false;
    if (theme === "auto") {
      isDark = getSystemPreference();
    } else {
      isDark = theme === "dark";
    }

    applyTheme(isDark);
  }, [userAuthData?.theme]);

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        setTheme,
        currentTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
