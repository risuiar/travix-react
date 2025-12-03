import React, { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../utils/env";
import type { User } from "@supabase/supabase-js";
import type { UserTier } from "../lib/userUtils";
import { UserContext } from "./UserContext";

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [userTier, setUserTier] = useState<UserTier>("free");
  const isInitialized = useRef(false);
  const profileSynced = useRef(false);

  // Función consolidada para obtener el perfil completo del usuario
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.warn("Error fetching user profile:", error);
        return null;
      }

      return profile;
    } catch (error) {
      console.warn("Error fetching user profile:", error);
      return null;
    }
  };

  // Función para determinar el tipo de usuario basado en el perfil
  const determineUserTier = (
    profile: Record<string, unknown> | null
  ): UserTier => {
    if (!profile) return "free";

    const { premium_status, premium_until } = profile;

    // Si no hay status premium, es usuario free
    if (!premium_status) {
      return "free";
    }

    // Si hay premium_until, verificar que no haya expirado
    if (premium_until) {
      const now = new Date();
      const untilDate = new Date(premium_until as string);

      if (untilDate <= now) {
        // Premium expirado, volver a free
        return "free";
      }
    }

    // Si el status es válido y no ha expirado, usar el status
    return premium_status as UserTier;
  };

  // Función para limpiar el estado de autenticación
  const clearAuthState = () => {
    setUser(null);
    setError(null);
    setLoading(false);
    isInitialized.current = false;
    setUserTier("free");
    setUserProfile(null);
    profileSynced.current = false;
  };

  // Función consolidada para sincronizar perfil y verificar términos
  const syncProfileAndCheckTerms = useCallback(async (user: User) => {
    console.log('🔄 SYNC PROFILE INICIADO - user.id:', user.id);
    console.log('SYNC PROFILE - user:', user);
    // Evitar sincronización duplicada
    if (profileSynced.current) {
      console.log('SYNC PROFILE - ya sincronizado, skip');
      return;
    }

    if (user) {
      try {
        // Obtener el perfil completo en una sola consulta
        let profile = await fetchUserProfile(user.id);
        console.log('SYNC PROFILE - perfil:', profile);
        
        // Guardar avatar_url y datos del usuario
        const avatarUrl = user.user_metadata.avatar_url;
        const fullName = user.user_metadata.full_name || user.user_metadata.name || user.user_metadata.email || "";
        
        console.log('DEBUG - user.user_metadata:', user.user_metadata);
        console.log('DEBUG - avatarUrl extraído:', avatarUrl);
        console.log('DEBUG - fullName extraído:', fullName);

        if (!profile) {
          // Si no existe, crear con valores por defecto
          const default_currency = "EUR";
          const default_theme = "auto";
          // Obtener idioma actual del localStorage o usar español por defecto
          const default_language = localStorage.getItem("i18nextLng") || "es";
          
          const upsertObj = {
            id: user.id,
            full_name: fullName,
            avatar_url: avatarUrl,
            default_currency,
            theme: default_theme,
            language: default_language,
          };
          console.log('UPSERT PROFILE OBJ (create):', upsertObj);
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .upsert(upsertObj)
            .select()
            .single();

          if (createError) {
            console.error("Error creating profile:", createError);
            return;
          }

          profile = newProfile;
        } else {
          // Si ya existe, actualizar nombre/avatar/idioma y incrementar login_count
          const currentLanguage = localStorage.getItem("i18nextLng") || "es";
          const upsertObj = {
            id: user.id,
            full_name: fullName,
            avatar_url: avatarUrl,
            language: currentLanguage,
            login_count: (profile?.login_count || 0) + 1,
          };
          console.log('UPSERT PROFILE OBJ (update):', upsertObj);
          const { error: updateError } = await supabase
            .from("profiles")
            .upsert(upsertObj);

          if (updateError) {
            console.error("Error updating profile:", updateError);
          }
        }

        // Guardar el perfil en el estado
        setUserProfile(profile);

        // Determinar y establecer el tipo de usuario
        const userTier = determineUserTier(profile);
        setUserTier(userTier);

        // Marcar como sincronizado
        profileSynced.current = true;

        // Verificar términos y redirigir si es necesario
        if (!profile.accepted_terms) {
          window.location.href = "/terms";
          return;
        }
      } catch (err) {
        console.error("Exception during profile sync:", err);
      }
    }
  }, []);

  useEffect(() => {
    console.log('🚀 useEffect de UserProvider iniciado');
    let ignore = false;

    const checkUser = async () => {
      try {
        // Check if Supabase is configured
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
          setError("Configuration error");
          setLoading(false);
          return;
        }

        // Get initial session
        const {
          data: { session },
          error: authError,
        } = await supabase.auth.getSession();

        if (authError) {
          if (
            authError.message?.includes("JWT expired") ||
            authError.message?.includes("Invalid refresh token")
          ) {
            // Token inválido o expirado, limpiar sesión
            await supabase.auth.signOut();
            if (!ignore) {
              clearAuthState();
            }
            return;
          }

          // Si es "Auth session missing", no es un error real, solo significa que no hay usuario logueado
          if (authError.message?.includes("Auth session missing")) {
            if (!ignore) {
              setUser(null);
              setLoading(false);
              isInitialized.current = true;
            }
            return;
          }

          if (!ignore) {
            setError(`Authentication error: ${authError.message}`);
            setLoading(false);
          }
          return;
        }

        if (!ignore) {
          setUser(session?.user ?? null);
          console.log('EFFECT - session user:', session?.user);
          // Sincronizar perfil y verificar términos si hay usuario
          if (session?.user) {
            await syncProfileAndCheckTerms(session.user);
          }

          setLoading(false);
          isInitialized.current = true;
        }

        // Listen for auth changes
        console.log('📡 Configurando listener de auth changes...');
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          console.log('🔥 AUTH STATE CHANGE - event:', event, 'user:', session?.user?.id);
          console.log('🔍 profileSynced.current:', profileSynced.current);
          console.log('🔍 ignore:', ignore);
          if (!ignore) {
            setUser(session?.user ?? null);

            // Sync profile when user signs in (solo si no se ha sincronizado)
            if (
              event === "SIGNED_IN" &&
              session?.user &&
              !profileSynced.current
            ) {
              console.log('🔄 Ejecutando syncProfile desde AUTH_STATE_CHANGE');
              syncProfileAndCheckTerms(session.user);
            } else {
              console.log('❌ No se ejecuta sync porque:', {
                event,
                hasUser: !!session?.user,
                profileSynced: profileSynced.current
              });
            }

            // También verificar en sesión inicial (solo si no se ha sincronizado)
            if (
              event === "INITIAL_SESSION" &&
              session?.user &&
              !profileSynced.current
            ) {
              syncProfileAndCheckTerms(session.user);
            }

            // Clear error when user signs in successfully
            if (event === "SIGNED_IN") {
              setError(null);
            }

            // Handle sign out
            if (event === "SIGNED_OUT") {
              clearAuthState();
            }
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch {
        if (!ignore) {
          setError("Failed to initialize authentication");
          setLoading(false);
        }
      }
    };

    if (!isInitialized.current) {
      checkUser();
    }

    return () => {
      ignore = true;
    };
  }, [syncProfileAndCheckTerms]);

  return (
    <UserContext.Provider
      value={{ user, loading, error, userTier, userProfile }}
    >
      {children}
    </UserContext.Provider>
  );
};
