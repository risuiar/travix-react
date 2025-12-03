import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { Calendar, Users, BarChart3, RefreshCw } from "lucide-react";

interface UserProfile {
  id: string;
  full_name: string;
  premium_status: string | null;
}

interface UserCallStats {
  user: UserProfile;
  todayCalls: number;
  totalCalls: number;
  lastCallDate: string;
}

/**
 * Componente para ver y gestionar los contadores de IA de los usuarios
 * Solo visible para administradores
 */
export const AIUsageMonitor: React.FC = () => {
  const [userStats, setUserStats] = useState<UserCallStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const loadUserStats = useCallback(async () => {
    setLoading(true);
    try {
      // Obtener todos los usuarios con sus perfiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, premium_status')
        .order('full_name');

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        return;
      }

      // Obtener llamadas del día seleccionado
      const { data: todayCalls, error: callsError } = await supabase
        .from('user_daily_calls')
        .select('user_id, calls_count')
        .eq('calls_date', selectedDate);

      if (callsError) {
        console.error('Error loading daily calls:', callsError);
        return;
      }

      // Obtener totales de todos los días
      const { data: allCalls, error: allCallsError } = await supabase
        .from('user_daily_calls')
        .select('user_id, calls_count, calls_date')
        .order('calls_date', { ascending: false });

      if (allCallsError) {
        console.error('Error loading all calls:', allCallsError);
        return;
      }

      // Combinar datos
      const stats: UserCallStats[] = profiles.map(profile => {
        const todayData = todayCalls?.find(call => call.user_id === profile.id);
        const userAllCalls = allCalls?.filter(call => call.user_id === profile.id) || [];
        const totalCalls = userAllCalls.reduce((sum, call) => sum + call.calls_count, 0);
        const lastCall = userAllCalls[0];

        return {
          user: profile,
          todayCalls: todayData?.calls_count || 0,
          totalCalls,
          lastCallDate: lastCall?.calls_date || 'Nunca',
        };
      });

      // Filtrar solo usuarios que han hecho al menos una llamada
      const activeUsers = stats.filter(stat => stat.totalCalls > 0);
      setUserStats(activeUsers);
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadUserStats();
  }, [loadUserStats]);

  const resetUserDailyCount = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_daily_calls')
        .update({ calls_count: 0 })
        .eq('user_id', userId)
        .eq('calls_date', selectedDate);

      if (error) {
        console.error('Error resetting user count:', error);
        return;
      }

      await loadUserStats();
    } catch (error) {
      console.error('Error resetting user count:', error);
    }
  };

  const getTierInfo = (premiumStatus: string | null) => {
    switch (premiumStatus) {
      case 'premium':
        return { label: 'Premium', limit: 30, color: 'text-blue-600' };
      case 'ultimate':
        return { label: 'Ultimate', limit: 100, color: 'text-purple-600' };
      default:
        return { label: 'Free', limit: 10, color: 'text-gray-600' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Cargando estadísticas...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-800">
                Monitor de Uso de IA
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                />
              </div>
              <button
                onClick={loadUserStats}
                className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {userStats.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay usuarios con actividad de IA</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Usuario</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tier</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">
                      Hoy ({selectedDate})
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Total histórico</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Última actividad</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {userStats.map((stat) => {
                    const tierInfo = getTierInfo(stat.user.premium_status);
                    const usage = (stat.todayCalls / tierInfo.limit) * 100;
                    
                    return (
                      <tr key={stat.user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {stat.user.full_name || 'Usuario sin nombre'}
                            </div>
                            <div className="text-sm text-gray-500 font-mono">
                              {stat.user.id.substring(0, 8)}...
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-medium ${tierInfo.color}`}>
                            {tierInfo.label}
                          </span>
                          <div className="text-xs text-gray-500">
                            Límite: {tierInfo.limit}/día
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className={`font-bold text-lg ${
                              stat.todayCalls >= tierInfo.limit ? 'text-red-600' : 
                              usage > 80 ? 'text-amber-600' : 'text-green-600'
                            }`}>
                              {stat.todayCalls}
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className={`h-2 rounded-full ${
                                  usage >= 100 ? 'bg-red-500' :
                                  usage > 80 ? 'bg-amber-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(usage, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-semibold text-gray-700 text-lg">
                            {stat.totalCalls}
                          </span>
                          <div className="text-xs text-gray-500">
                            consultas totales
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-sm text-gray-600">
                            {stat.lastCallDate}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {stat.todayCalls > 0 && (
                            <button
                              onClick={() => resetUserDailyCount(stat.user.id)}
                              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              Reset hoy
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Uso normal (&lt;80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span>Uso alto (80-99%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Límite alcanzado (100%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
