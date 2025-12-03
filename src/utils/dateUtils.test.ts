import {
  parseDateString,
  formatDateForForm,
  formatDateForDisplay,
  getDayName,
  getTripDayNumber,
  getTravelOverviewDayInfo,
  isValidDateString,
  getTodayDate,
  getNextWeekDate
} from "../utils/dateUtils";

describe("dateUtils UTC consistency", () => {
  it("parseDateString should create UTC date", () => {
    const d = parseDateString("2025-10-01");
    expect(d.getUTCFullYear()).toBe(2025);
    expect(d.getUTCMonth()).toBe(9); // October is 9
    expect(d.getUTCDate()).toBe(1);
  });

  it("formatDateForForm should output YYYY-MM-DD in UTC", () => {
    const d = new Date(Date.UTC(2025, 9, 1));
    expect(formatDateForForm(d)).toBe("2025-10-01");
  });

  it("formatDateForDisplay should be consistent across TZ", () => {
    const str = formatDateForDisplay("2025-10-01", "en-GB");
    // English format is "Month Day, Year" (e.g., "Oct 1, 2025")
    expect(str).toMatch(/Oct\s1,\s2025/);
  });

  it("getDayName returns correct weekday in UTC", () => {
    expect(getDayName("2025-10-01", "en-US")).toMatch(/Wednesday|Miércoles/);
  });

  it("getTripDayNumber returns 1 for same day", () => {
    expect(getTripDayNumber("2025-10-01", "2025-10-01")).toBe(1);
  });

  it("getTripDayNumber returns correct diff", () => {
    expect(getTripDayNumber("2025-10-01", "2025-10-10")).toBe(10);
  });

  it("getTravelOverviewDayInfo returns correct info for future trip", () => {
    const info = getTravelOverviewDayInfo("2099-01-01");
    expect(info.isFutureTrip).toBe(true);
    expect(info.dayNumber).toBe(1);
  });

  it("isValidDateString validates leap years and invalid dates", () => {
    expect(isValidDateString("2024-02-29")).toBe(true);
    expect(isValidDateString("2023-02-29")).toBe(false);
    expect(isValidDateString("2025-13-01")).toBe(false);
    expect(isValidDateString("2025-00-10")).toBe(false);
    expect(isValidDateString("2025-10-32")).toBe(false);
  });

  it("getTodayDate and getNextWeekDate are in UTC", () => {
    const today = getTodayDate();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const nextWeek = getNextWeekDate();
    expect(nextWeek).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
