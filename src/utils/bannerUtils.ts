/**
 * Retorna true con una probabilidad dada en porcentaje.
 * @param percent Número entre 0 y 100
 */
export function shouldShow(percent: number): boolean {
  return Math.random() * 100 < percent;
}

// Función principal para determinar si mostrar banner
export function shouldShowBanner(): boolean {
  // Placeholder for actual logic based on loginCount, userTier, isPremium
  // This function is now a placeholder and needs the actual logic to be implemented.
  // For now, it will always return true to avoid breaking existing calls.
  return true;
}

/**
 * Función para determinar si mostrar banner basado en umbral
 */
export function shouldShowFallbackBanner(
  loginCount: number,
  visibleBanners: string[],
  fallbackBannerId: string = "fallback-banner"
): boolean {
  // Si ya hay banners visibles, no mostrar el fallback
  if (visibleBanners.length > 0) {
    return false;
  }

  // Si no hay banners visibles, mostrar el fallback con alta probabilidad
  const fallbackProbability = Math.min(loginCount * 2 + 20, 80); // Mínimo 20%, máximo 80%

  const seed = fallbackBannerId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seededRandom = (seed * loginCount) % 100;

  return seededRandom < fallbackProbability;
}

// Función para mostrar mensaje de soporte
export const showSupportMessage = () => {
  // Implementación del mensaje de soporte
  console.log("Support message");
};
