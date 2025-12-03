// Utility functions for time formatting and manipulation

// Utility function to convert time to a numerical value for sorting,
// considering that the day may cross midnight.
export const timeToSortValue = (time: string): number => {
  if (!time || time.trim() === "") return 0;

  const parts = time.split(":").map(Number);
  const hours = parts[0];
  const minutes = parts[1] || 0;
  const seconds = parts[2] || 0;

  // If the hour is less than 6 (early morning), add 24 so it
  // positions after night hours (20, 21, 23).
  const adjustedHours = hours < 6 ? hours + 24 : hours;
  return adjustedHours * 3600 + minutes * 60 + seconds;
};

// Format time for display (e.g., "14:30" -> "2:30 PM")
export const formatTimeForDisplay = (
  time: string,
  currentLanguage: string
): string => {
  if (!time || time.trim() === "") return "";

  // Remove seconds if present (e.g., "01:00:00" -> "01:00")
  let cleanTime = time;
  if (time.includes(":")) {
    const parts = time.split(":");
    if (parts.length === 3) {
      cleanTime = `${parts[0]}:${parts[1]}`;
    }
  }

  const is24Hour =
    currentLanguage === "de" ||
    currentLanguage === "fr" ||
    currentLanguage === "it";

  if (is24Hour) {
    return cleanTime; // Already in 24h format
  } else {
    // Convert to 12h format
    const [hours, minutes] = cleanTime.split(":").map(Number);
    const displayHour = hours > 12 ? hours - 12 : hours;
    const ampm = hours >= 12 ? "PM" : "AM";
    return `${displayHour}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  }
};

// Utility function to sort activities by time chronologically
export const sortActivitiesByTime = <T extends { time?: string | null }>(
  activities: T[]
): T[] => {
  return activities.sort((a, b) => {
    const timeA = a.time || "";
    const timeB = b.time || "";
    const valorA = timeToSortValue(timeA);
    const valorB = timeToSortValue(timeB);
    return valorA - valorB;
  });
};
