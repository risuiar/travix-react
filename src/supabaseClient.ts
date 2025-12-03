// Prueba de conexión a Supabase
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('travels').select('*').limit(1);
    if (error) {
      console.error('Error conectando a Supabase:', error.message);
    } else {
      console.log('Conexión a Supabase exitosa:', data);
    }
  } catch (err) {
    console.error('Error inesperado al conectar a Supabase:', err);
  }
}
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./utils/env";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
