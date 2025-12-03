import React from "react";
import { supabase } from "../../supabaseClient";

export interface AIUsageStats {
  total_requests: number;
  total_tokens: number;
  total_cost: number;
  requests_today: number;
  tokens_today: number;
  cost_today: number;
  endpoint_breakdown: Record<string, {
    count: number;
    tokens: number;
    cost: number;
  }>;
}

export interface AIUsageLimit {
  can_make_request: boolean;
  requests_today: number;
  daily_limit: number;
  user_tier: 'free' | 'premium' | 'ultimate';
  remaining_requests: number;
}

export type AIEndpoint = 
  | 'generate_itinerary'
  | 'chat_assistance'
  | 'location_suggestions'
  | 'activity_recommendations'
  | 'travel_tips'
  | 'expense_categorization';

// Límites por tier de usuario
export const AI_DAILY_LIMITS = {
  free: 10,
  premium: 30,
  ultimate: 100,
} as const;

// Error personalizado para límite alcanzado
export class AILimitReachedError extends Error {
  constructor(
    public limitInfo: AIUsageLimit,
    message?: string
  ) {
    super(message || `AI daily limit reached: ${limitInfo.requests_today}/${limitInfo.daily_limit}`);
    this.name = 'AILimitReachedError';
  }
}

/**
 * Verifica si el usuario puede hacer una consulta de IA
 * Usa la tabla profiles para el tier y user_daily_calls para el contador
 */
export const checkAIUsageLimit = async (): Promise<AIUsageLimit | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Obtener el perfil del usuario para saber su tier
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('premium_status')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error getting user profile:', profileError);
      return null;
    }

    // Determinar el tier del usuario
    const userTier = profile?.premium_status || 'free';
    const dailyLimit = AI_DAILY_LIMITS[userTier as keyof typeof AI_DAILY_LIMITS];

    // Obtener el contador de consultas de hoy
    const today = new Date().toISOString().split('T')[0];
    const { data: dailyCalls, error: callsError } = await supabase
      .from('user_daily_calls')
      .select('calls_count')
      .eq('user_id', user.id)
      .eq('calls_date', today)
      .single();

    if (callsError && callsError.code !== 'PGRST116') {
      console.error('Error getting daily calls:', callsError);
      return null;
    }

    const requestsToday = dailyCalls?.calls_count || 0;
    const remainingRequests = Math.max(0, dailyLimit - requestsToday);
    const canMakeRequest = requestsToday < dailyLimit;

    return {
      can_make_request: canMakeRequest,
      requests_today: requestsToday,
      daily_limit: dailyLimit,
      user_tier: userTier as 'free' | 'premium' | 'ultimate',
      remaining_requests: remainingRequests,
    };
  } catch (error) {
    console.error('Error in checkAIUsageLimit:', error);
    return null;
  }
};

/**
 * Registra una consulta de IA en el sistema de seguimiento
 * Usa la tabla user_daily_calls para incrementar el contador diario
 * Y actualiza el contador total en profiles
 */
export const logAIUsage = async (
  endpoint: AIEndpoint,
  options: {
    tokens?: number;
    cost?: number;
    requestData?: Record<string, unknown>;
    responseData?: Record<string, unknown>;
    success?: boolean;
    errorMessage?: string;
  } = {}
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const today = new Date().toISOString().split('T')[0];

    // Primero intentar incrementar el contador diario existente
    const { data: existingCall, error: getError } = await supabase
      .from('user_daily_calls')
      .select('id, calls_count')
      .eq('user_id', user.id)
      .eq('calls_date', today)
      .single();

    if (getError && getError.code !== 'PGRST116') {
      console.error('Error getting existing daily calls:', getError);
      return false;
    }

    if (existingCall) {
      // Incrementar contador diario existente
      const { error: updateError } = await supabase
        .from('user_daily_calls')
        .update({ calls_count: existingCall.calls_count + 1 })
        .eq('id', existingCall.id);

      if (updateError) {
        console.error('Error updating daily calls count:', updateError);
        return false;
      }
    } else {
      // Crear nuevo registro para hoy
      const { error: insertError } = await supabase
        .from('user_daily_calls')
        .insert({
          user_id: user.id,
          calls_date: today,
          calls_count: 1,
        });

      if (insertError) {
        console.error('Error creating daily calls record:', insertError);
        return false;
      }
    }

    // Actualizar contador total en profiles
    // Nota: Necesitarás agregar la columna 'total_ai_calls' a la tabla profiles
    // O podemos calcularlo sumando todos los registros de user_daily_calls
    await updateTotalAICallsCount(user.id);

    console.log(`✅ AI usage logged for endpoint: ${endpoint}`, options);
    return true;
  } catch (error) {
    console.error('Error in logAIUsage:', error);
    return false;
  }
};

/**
 * Actualiza el contador total de llamadas de IA en el perfil del usuario
 * Suma todos los registros de user_daily_calls para obtener el total
 */
const updateTotalAICallsCount = async (userId: string): Promise<void> => {
  try {
    // Obtener la suma total de todas las llamadas del usuario
    const { data: totalCalls, error: sumError } = await supabase
      .from('user_daily_calls')
      .select('calls_count')
      .eq('user_id', userId);

    if (sumError) {
      console.error('Error getting total calls sum:', sumError);
      return;
    }

    const totalCount = totalCalls?.reduce((sum, call) => sum + call.calls_count, 0) || 0;

    // Actualizar el perfil con el total
    // Nota: Esto requiere que agregues la columna 'total_ai_calls' a profiles
    // Por ahora comentamos esta línea hasta que agregues la columna
    /*
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ total_ai_calls: totalCount })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating total AI calls in profile:', updateError);
    }
    */

    console.log(`📊 Total AI calls for user ${userId}: ${totalCount}`);
  } catch (error) {
    console.error('Error updating total AI calls:', error);
  }
};

/**
 * Obtiene el contador total de llamadas de IA del usuario (sin fecha)
 */
export const getTotalAIUsage = async (): Promise<number> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    // Sumar todas las llamadas del usuario de todos los días
    const { data: allCalls, error } = await supabase
      .from('user_daily_calls')
      .select('calls_count')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error getting total AI usage:', error);
      return 0;
    }

    const totalCalls = allCalls?.reduce((sum, call) => sum + call.calls_count, 0) || 0;
    return totalCalls;
  } catch (error) {
    console.error('Error in getTotalAIUsage:', error);
    return 0;
  }
};

/**
 * Obtiene estadísticas de uso de IA del usuario
 * Usa la tabla user_daily_calls para obtener el historial
 */
export const getAIUsageStats = async (daysBack: number = 30): Promise<AIUsageStats | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const { data: dailyCalls, error } = await supabase
      .from('user_daily_calls')
      .select('calls_count, calls_date')
      .eq('user_id', user.id)
      .gte('calls_date', startDate.toISOString().split('T')[0])
      .lte('calls_date', endDate.toISOString().split('T')[0])
      .order('calls_date', { ascending: false });

    if (error) {
      console.error('Error getting AI usage stats:', error);
      return null;
    }

    const today = new Date().toISOString().split('T')[0];
    const todayData = dailyCalls?.find(call => call.calls_date === today);

    const totalRequests = dailyCalls?.reduce((sum, call) => sum + call.calls_count, 0) || 0;

    return {
      total_requests: totalRequests,
      total_tokens: 0, // No rastreamos tokens en este modelo simplificado
      total_cost: 0,   // No rastreamos costos en este modelo simplificado
      requests_today: todayData?.calls_count || 0,
      tokens_today: 0,
      cost_today: 0,
      endpoint_breakdown: {}, // No rastreamos por endpoint en este modelo simplificado
    };
  } catch (error) {
    console.error('Error in getAIUsageStats:', error);
    return null;
  }
};

/**
 * Wrapper para hacer consultas de IA con seguimiento automático
 */
export const withAIUsageTracking = async <T>(
  endpoint: AIEndpoint,
  aiFunction: () => Promise<T>,
  options: {
    estimatedTokens?: number;
    estimatedCost?: number;
    includeRequestData?: Record<string, unknown>;
  } = {}
): Promise<T> => {
  // Verificar límite antes de hacer la consulta
  const limitCheck = await checkAIUsageLimit();
  
  if (!limitCheck?.can_make_request) {
    // Lanzar error personalizado con información del límite
    if (!limitCheck) {
      throw new Error('Unable to check AI usage limit');
    }
    throw new AILimitReachedError(limitCheck, 
      `Has alcanzado tu límite diario de consultas de IA (${limitCheck.daily_limit}). ` +
      `Tu plan ${limitCheck.user_tier} permite ${limitCheck.daily_limit} consultas por día.`
    );
  }

  let result: T;

  try {
    // Ejecutar la función de IA
    result = await aiFunction();
    
    // Registrar uso exitoso
    await logAIUsage(endpoint, {
      tokens: options.estimatedTokens,
      cost: options.estimatedCost,
      requestData: options.includeRequestData,
      responseData: typeof result === 'object' ? result : { success: true },
      success: true,
    });

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Registrar uso fallido solo si no es un error de límite
    if (!(error instanceof AILimitReachedError)) {
      await logAIUsage(endpoint, {
        tokens: 0, // No tokens consumidos en caso de error
        cost: 0,
        requestData: options.includeRequestData,
        success: false,
        errorMessage,
      });
    }

    throw error;
  }
};

/**
 * Hook personalizado para obtener el estado de uso de IA
 */
export const useAIUsageStatus = () => {
  const [usageLimit, setUsageLimit] = React.useState<AIUsageLimit | null>(null);
  const [usageStats, setUsageStats] = React.useState<AIUsageStats | null>(null);
  const [totalUsage, setTotalUsage] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);

  const refreshUsage = async () => {
    setLoading(true);
    try {
      const [limit, stats, total] = await Promise.all([
        checkAIUsageLimit(),
        getAIUsageStats(),
        getTotalAIUsage(),
      ]);
      setUsageLimit(limit);
      setUsageStats(stats);
      setTotalUsage(total);
    } catch (error) {
      console.error('Error refreshing AI usage status:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    refreshUsage();
  }, []);

  return {
    usageLimit,
    usageStats,
    totalUsage,
    loading,
    refreshUsage,
    canMakeRequest: usageLimit?.can_make_request ?? false,
    remainingRequests: usageLimit?.remaining_requests ?? 0,
    dailyLimit: usageLimit?.daily_limit ?? 0,
    userTier: usageLimit?.user_tier ?? 'free',
  };
};
