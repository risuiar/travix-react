import { supabase } from "../../supabaseClient";

// Tipos para el perfil de usuario
export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  default_currency: string | null;
  language: string | null;
  theme: string | null;
  trip_reminders: boolean | null;
  budget_alerts: boolean | null;
  activity_reminders: boolean | null;
  login_count: number | null;
  created_at: string;
  premium_status: string | null;
  premium_until: string | null;
  accepted_terms: boolean | null;
  email_verified: boolean | null;
  last_login: string | null;
}

// Función para obtener el perfil del usuario autenticado
export const fetchUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from("user_profile_data")
      .select()
      .single();
    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
    return data;
  } catch (error) {
    console.error("Error in fetchUserProfile:", error);
    return null;
  }
};

// Función para actualizar el perfil del usuario
export const updateUserProfile = async (profile: Partial<UserProfile>) => {
  const { error } = await supabase
    .from("profiles")
    .upsert(profile);
  if (error) {
    console.error("Error updating user profile:", error);
    return false;
  }
  return true;
};

// Función para marcar email como verificado
