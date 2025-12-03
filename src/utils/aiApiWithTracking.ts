import React from 'react';
import { withAIUsageTracking, AIEndpoint } from '../utils/api/aiUsageApi';
import { callAIApi as originalCallAIApi } from '../utils/aiApi';

/**
 * Wrapper para callAIApi con seguimiento automático de uso
 */
export const callAIApiWithTracking = async (
  formData: Record<string, unknown>,
  endpoint: AIEndpoint = 'generate_itinerary'
) => {
  return withAIUsageTracking(
    endpoint,
    async () => {
      return originalCallAIApi(formData);
    },
    {
      estimatedTokens: estimateTokensFromRequest(formData),
      estimatedCost: estimateCostFromRequest(formData),
      includeRequestData: {
        destination: formData.destination,
        dates: `${formData.startDate} - ${formData.endDate}`,
        hasExistingActivities: Boolean(formData.existingActivities),
      }
    }
  );
};

/**
 * Estima tokens basado en el contenido de la request
 */
function estimateTokensFromRequest(formData: Record<string, unknown>): number {
  // Estimación básica - puedes ajustar según tu experiencia
  let tokens = 500; // Base prompt tokens
  
  if (formData.interests && typeof formData.interests === 'string') {
    tokens += formData.interests.length / 4; // ~4 chars per token
  }
  
  if (formData.existingActivities && Array.isArray(formData.existingActivities)) {
    tokens += formData.existingActivities.length * 20; // ~20 tokens per activity
  }
  
  if (formData.description && typeof formData.description === 'string') {
    tokens += formData.description.length / 4;
  }
  
  return Math.round(tokens);
}

/**
 * Estima costo basado en tokens estimados
 */
function estimateCostFromRequest(formData: Record<string, unknown>): number {
  const estimatedTokens = estimateTokensFromRequest(formData);
  // OpenAI GPT-4 pricing aproximado: $0.03 per 1K tokens input + $0.06 per 1K tokens output
  // Asumiendo output similar al input
  const costPerToken = (0.03 + 0.06) / 1000;
  return estimatedTokens * costPerToken;
}

/**
 * Hook para verificar límites antes de mostrar el modal de IA
 */
export const useAIModalPermission = () => {
  const [canOpenModal, setCanOpenModal] = React.useState(true);
  const [limitMessage, setLimitMessage] = React.useState<string | null>(null);
  
  const checkPermission = async () => {
    try {
      const { checkAIUsageLimit } = await import('../utils/api/aiUsageApi');
      const limitCheck = await checkAIUsageLimit();
      
      if (!limitCheck?.can_make_request) {
        setCanOpenModal(false);
        setLimitMessage(
          `Has alcanzado tu límite diario de ${limitCheck?.daily_limit || 0} consultas de IA. ` +
          `Mejora tu plan para más consultas.`
        );
      } else {
        setCanOpenModal(true);
        setLimitMessage(null);
      }
      
      return limitCheck;
    } catch (error) {
      console.error('Error checking AI permission:', error);
      setCanOpenModal(true); // Allow on error
      return null;
    }
  };
  
  return {
    canOpenModal,
    limitMessage,
    checkPermission,
  };
};
