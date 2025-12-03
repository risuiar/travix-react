import { DailyPlan } from "../types";

export interface ItineraryGroup {
  name: string | null;
  days: DailyPlan[];
  totalActivities: number;
  totalExpenses: number;
  totalSpent: number;
  startDate: string;
  endDate: string;
}

export const groupDaysByItinerary = (
  dailyPlan: DailyPlan[]
): ItineraryGroup[] => {
  const groups: Map<string | null, DailyPlan[]> = new Map();

  // Filtrar datos malformados y agrupar días por nombre de ciudad
  const validDays = dailyPlan.filter((day) => {
    // Verificar que day.day sea una fecha válida
    const isValidDate =
      day.day &&
      typeof day.day === "string" &&
      day.day.match(/^\d{4}-\d{2}-\d{2}$/);
    if (!isValidDate) {
      console.warn("⚠️ Skipping malformed day data:", day);
      return false;
    }
    return true;
  });

  validDays.forEach((day) => {
    // Handle multiple itinerary names separated by commas
    if (day.name && day.name.includes(", ")) {
      // Split by comma and use the first one as the primary group
      const names = day.name.split(", ");
      const primaryName = names[0].trim();

      if (!groups.has(primaryName)) {
        groups.set(primaryName, []);
      }
      (groups.get(primaryName) ?? []).push(day);
    } else {
      const key = day.name || "sin-itinerarios";
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      (groups.get(key) ?? []).push(day);
    }
  });

  // Convertir a array y calcular totales
  const result = Array.from(groups.entries())
    .map(([name, days]) => {
      const sortedDays = days.sort(
        (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime()
      );

      return {
        name: name === "sin-itinerarios" ? null : name,
        days: sortedDays,
        totalActivities: days.reduce(
          (sum, day) => sum + day.activities_count,
          0
        ),
        totalExpenses: days.reduce((sum, day) => sum + day.expenses_count, 0),
        totalSpent: days.reduce((sum, day) => sum + day.total_spent, 0),
        startDate: sortedDays[0]?.day || "",
        endDate: sortedDays[sortedDays.length - 1]?.day || "",
      };
    })
    .sort((a, b) => {
      // "Sin itinerario" (name: null) siempre va primero
      if (a.name === null && b.name !== null) return -1;
      if (a.name !== null && b.name === null) return 1;

      // Para el resto, ordenar por fecha de inicio
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

  return result;
};

export const getItineraryDisplayName = (
  name: string | null,
  t?: (key: string, fallback?: string) => string
): string => {
  if (!name) {
    if (t) {
      return t("dailyPlanner.withoutItinerary");
    }
    return "Sin Itinerario";
  }
  return name;
};
