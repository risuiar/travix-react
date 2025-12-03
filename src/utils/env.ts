// Utilitario para manejar variables de entorno
// Depuración: mostrar todas las variables de entorno disponibles
// Mostrar todas las variables de entorno disponibles
console.log('import.meta.env:', import.meta.env);

// Exportar variables directamente de import.meta.env
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const AI_API_URL = import.meta.env.VITE_AI_API_URL;
export const AI_API_KEY = import.meta.env.VITE_AI_API_KEY;
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
export const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
export const BACKEND_TRAVIX = import.meta.env.VITE_BACKEND_TRAVIX;
export const REDIRECT_URL = import.meta.env.VITE_REDIRECT_URL;
export const API_TOKEN = import.meta.env.VITE_API_TOKEN;

// Para producción en Coolify, asegúrate de definir las variables VITE_ en el panel de variables de entorno de Coolify
// Ejemplo: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, etc.
