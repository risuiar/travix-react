import { Travel, TravelFormValues, DailyPlan } from "../types";
import { DailyPlanItem } from "../utils/dailyPlanApi";

// Tipo para el resumen del travel que devuelve la RPC
export interface TravelSummary {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  budget: number;
  total_expenses: number;
  expenses_count: number;
  total_activity_costs: number;
  activities_count: number;
  bbox?: number[]; // number[] es compatible con double precision[]
  country_codes?: Array<Record<string, string>>;
  created_at: string;
  user_id: string;
  is_closed: boolean;
  is_synced: boolean;
}

// Contexto para la lista de travels
export interface TravelListContextType {
  travels: Travel[];
  loading: boolean;
  refreshTravels: () => Promise<void>;
  createTravel: (travelData: TravelFormValues) => Promise<Travel>;
  updateTravel?: (travelData: TravelFormValues) => Promise<Travel>;
  deleteTravel: (travelId: string) => Promise<void>;
}

export interface TravelContextType {
  travel: Travel | null;
  dailyPlan: DailyPlan[];
  totalSpent: number;

  countActivities: number;
  countExpenses: number;
  isInitialized: boolean;
  updateTravel: (travelData: TravelFormValues) => Promise<Travel>;
  refreshData: () => Promise<void>;
  getDayTotals: (date: string) => {
    expenses: number;
    activities: number;
    total: number;
  };
  getDetailedItems: (date: string) => DailyPlanItem[];
  getItemById: (
    date: string,
    itemId: string,
    type: "activity" | "expense"
  ) => DailyPlanItem | undefined;
  loadDetailedItems: (date: string) => Promise<void>;
  loadMultipleDays: (dates: string[]) => Promise<void>;
  invalidateDateCache: (date: string) => void;
  clearAllTravelCache: () => void;
  invalidateCache: () => void;
}
