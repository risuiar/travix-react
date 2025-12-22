import { describe, it, expect } from "vitest";
import { getCurrencySymbol, getCurrencyName, formatCurrency } from "./currency";

describe("currency utils", () => {
  describe("getCurrencySymbol", () => {
    it("should return the correct symbol for known currencies", () => {
      expect(getCurrencySymbol("EUR")).toBe("€");
      expect(getCurrencySymbol("USD")).toBe("$");
      expect(getCurrencySymbol("JPY")).toBe("¥");
    });

    it("should return the code if currency is unknown", () => {
      expect(getCurrencySymbol("UNKNOWN")).toBe("UNKNOWN");
    });
  });

  describe("getCurrencyName", () => {
    it("should return the correct name for known currencies", () => {
      expect(getCurrencyName("EUR")).toBe("Euro");
      expect(getCurrencyName("USD")).toBe("US Dollar");
    });

    it("should return the code if currency is unknown", () => {
      expect(getCurrencyName("UNKNOWN")).toBe("UNKNOWN");
    });
  });

  describe("formatCurrency", () => {
    it('should return "-" for invalid or zero amounts', () => {
      expect(formatCurrency(0, "EUR")).toBe("-");
      // @ts-expect-error - testing invalid input
      expect(formatCurrency(null, "EUR")).toBe("-");
      expect(formatCurrency(NaN, "EUR")).toBe("-");
    });

    it("should format currency correctly without cents by default", () => {
      const result = formatCurrency(100, "EUR");
      // Intl might use non-breaking spaces or different formatting depending on environment
      // We just check if it contains the symbol and the number
      expect(result).toContain("€");
      expect(result).toContain("100");
    });

    it("should format currency with cents when requested", () => {
      const result = formatCurrency(100.5, "EUR", true);
      expect(result).toContain("100.50");
    });
  });
});
