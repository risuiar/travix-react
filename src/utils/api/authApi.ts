import { supabase } from "../../supabaseClient";

// Tipos para datos completos del usuario autenticado
export interface UserAuthData {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  created_at: string;
  updated_at: string | null;
  last_sign_in_at: string | null;
  full_name: string | null;
  avatar_url: string | null;
  default_currency: string | null;
  language: string | null;
  theme: string | null;
  trip_reminders: boolean | null;
  budget_alerts: boolean | null;
  activity_reminders: boolean | null;
  login_count: number | null;
  premium_status: string | null;
  premium_until: string | null;
  accepted_terms: boolean | null;
  email_verified: boolean | null;
  last_login: string | null;
  app_metadata?: {
    provider?: string;
  };
  user_metadata?: {
    picture?: string;
  };
}

// Función para obtener datos completos del usuario autenticado
export const fetchUserAuthData = async (): Promise<UserAuthData | null> => {
  try {
    // Depuración: Verificar usuario y claves
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log("Usuario actual:", user);
    if (userError) console.error("Error de usuario:", userError);

    // Verificar sesión y token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log("Session:", session);
    if (sessionError) console.error("Error de sesión:", sessionError);
    if (session?.access_token) {
      console.log("Access token:", session.access_token);
    } else {
      console.warn("No hay access_token. El usuario no está autenticado.");
    }

    // Verificar claves Supabase
    // @ts-expect-error - Debug log for development
    console.log("SUPABASE_URL:", supabase?.url);
    // @ts-expect-error - Debug log for development
    console.log("SUPABASE_ANON_KEY:", supabase?.key);

    if (!user) {
      console.warn("No auth user found.");
      return null;
    }

    // Obtener los datos del perfil desde la tabla segura
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Error fetching user profile data:", profileError);
    }

    const authData: UserAuthData = {
      id: user.id,
      email: user.email || "",
      email_confirmed_at: user.email_confirmed_at || null,
      created_at: user.created_at,
      updated_at: user.updated_at || null,
      last_sign_in_at: user.last_sign_in_at || null,
      app_metadata: user.app_metadata,
      user_metadata: user.user_metadata,
      full_name: profileData?.full_name || null,
      avatar_url: profileData?.avatar_url || null,
      default_currency: profileData?.default_currency || null,
      language: profileData?.language || null,
      theme: profileData?.theme || null,
      trip_reminders: profileData?.trip_reminders ?? null,
      budget_alerts: profileData?.budget_alerts ?? null,
      activity_reminders: profileData?.activity_reminders ?? null,
      login_count: profileData?.login_count ?? null,
      premium_status: profileData?.premium_status || null,
      premium_until: profileData?.premium_until || null,
      accepted_terms: profileData?.accepted_terms ?? null,
      email_verified: profileData?.email_verified ?? null,
      last_login: profileData?.last_login || null,
    };

    return authData;
  } catch (error) {
    console.error("Error in fetchUserAuthData:", error);
    return null;
  }
};
