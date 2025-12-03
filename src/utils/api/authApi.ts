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

    const { data, error } = await supabase
      .from("user_auth_data")
      .select(
        `
        id,
        email,
        email_confirmed_at,
        created_at,
        updated_at,
        last_sign_in_at,
        full_name,
        avatar_url,
        default_currency,
        language,
        theme,
        trip_reminders,
        budget_alerts,
        activity_reminders,
        login_count,
        premium_status,
        premium_until,
        accepted_terms,
        email_verified,
        last_login
      `
      )
      .single();
    if (error) {
      console.error("Error fetching user auth data:", error);
      return null;
    }
    return data;
  } catch (error) {
    console.error("Error in fetchUserAuthData:", error);
    return null;
  }
};
