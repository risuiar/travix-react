import { supabase } from "../supabaseClient";
import React, { ReactNode } from "react";
import { useUserAuthData } from "../utils/hooks/useTravelQueries";
import type { UserAuthData } from "../utils/api/authApi";
import { UserAuthContext } from "./UserAuthContext";

interface UserAuthProviderProps {
  children: ReactNode;
}

export const UserAuthProvider: React.FC<UserAuthProviderProps> = ({
  children,
}) => {
  const { data: userAuthData, isLoading, error, refetch } = useUserAuthData();

  // Calcular userTier basado en el perfil
  const determineUserTier = (profile: UserAuthData | null | undefined): string => {
    if (!profile) return "free";
    const { premium_status, premium_until } = profile;
    if (!premium_status) return "free";
    if (premium_until) {
      const now = new Date();
      const untilDate = new Date(premium_until);
      if (untilDate <= now) return "free";
    }
    return premium_status;
  };

  const userTier = determineUserTier(userAuthData);
  const userProfile = userAuthData;

  // Sincronizar perfil en Supabase tras login
  React.useEffect(() => {
    if (userAuthData && userAuthData.id) {
      const syncProfile = async () => {
        // Obtener la sesión actual para acceder a los metadatos de Google
        const { data: { session } } = await supabase.auth.getSession();
        
        // Usar avatar de Google si está disponible, sino mantener el actual
        const googleAvatar = session?.user?.user_metadata?.avatar_url;
        const avatarUrl = googleAvatar || userAuthData.avatar_url;
        
        const fullName = userAuthData.full_name || userAuthData.email || "";
        const currentLanguage = localStorage.getItem("i18nextLng") || "es";
        
        const updateData = {
          id: userAuthData.id,
          full_name: fullName,
          avatar_url: avatarUrl,
          language: currentLanguage,
        };
        
        await supabase.from("profiles").upsert(updateData);
      };
      syncProfile();
    }
  }, [userAuthData]);

  // Suscribirse a cambios de sesión de Supabase para forzar refetch
  React.useEffect(() => {
    let lastUserId: string | null = null;
    
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUserId = session?.user?.id || null;
      
      // Solo hacer refetch si realmente cambió el usuario
      if (currentUserId !== lastUserId) {
        lastUserId = currentUserId;
        refetch();
      }
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [refetch]);

  const value = {
  userAuthData,
  userProfile,
  userTier,
  isLoading,
  error,
  refetch,
  };

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  );
};
