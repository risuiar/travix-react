import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useConfirm } from "./useConfirm";
import { withAIUsageTracking, AIEndpoint, AILimitReachedError } from "../utils/api/aiUsageApi";

/**
 * Hook que integra el sistema de IA con alertas de límite usando modales
 */
export const useAIWithAlert = () => {
  const { t } = useTranslation();
  const { alert } = useConfirm();

  /**
   * Ejecuta una función de IA con manejo automático de límites y alertas
   */
  const callAIWithAlert = useCallback(async <T>(
    endpoint: AIEndpoint,
    aiFunction: () => Promise<T>,
    options: {
      estimatedTokens?: number;
      estimatedCost?: number;
      includeRequestData?: Record<string, unknown>;
    } = {}
  ): Promise<T | null> => {
    try {
      // Ejecutar la función con tracking
      const result = await withAIUsageTracking(endpoint, aiFunction, options);
      return result;
    } catch (error) {
      // Si es un error de límite alcanzado, mostrar alerta personalizada
      if (error instanceof AILimitReachedError) {
        const limitInfo = error.limitInfo;
        
        // Mostrar alerta usando el sistema de modal
        await alert({
          title: t("aiUsage.limitReachedTitle"),
          message: t("aiUsage.limitReachedMessage", { 
            count: limitInfo.requests_today 
          }),
          type: "warning",
        });
        
        return null; // Retornar null para indicar que no se ejecutó
      }
      
      // Re-lanzar otros errores
      throw error;
    }
  }, [t, alert]);

  return {
    callAIWithAlert,
  };
};

/**
 * Función helper para usar en componentes sin hook
 */
export const showAILimitAlert = async (
  alertFn: (options: { title: string; message: string; type: "warning" }) => Promise<void>,
  t: (key: string, options?: { [key: string]: string | number }) => string,
  limitInfo: { requests_today: number; daily_limit: number; user_tier: string }
) => {
  await alertFn({
    title: t("aiUsage.limitReachedTitle"),
    message: t("aiUsage.limitReachedMessage", { 
      count: limitInfo.requests_today 
    }),
    type: "warning",
  });
};
