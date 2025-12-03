/**
 * Utilidades de navegación para las rutas de la aplicación
 */

export const getDayUrl = (travelId: string, date: string): string => {
  return `/travels/travel/${travelId}/daily-planner/day/${date}`;
};

export const getItineraryUrl = (
  travelId: string,
  itineraryId: string
): string => {
  return `/travels/travel/${travelId}/daily-planner/itinerary/${itineraryId}`;
};

export const getDayItineraryUrl = (
  travelId: string,
  date: string,
  itineraryId: string
): string => {
  // Always place itinerary before day
  return `/travels/travel/${travelId}/daily-planner/itinerary/${itineraryId}/day/${date}`;
};

export const getDailyPlannerUrl = (travelId: string): string => {
  return `/travels/travel/${travelId}/daily-planner`;
};

export const getOverviewUrl = (travelId: string): string => {
  return `/travels/travel/${travelId}/overview`;
};

export const getExpensesUrl = (travelId: string): string => {
  return `/travels/travel/${travelId}/expenses`;
};

// Función para extraer parámetros de la URL
