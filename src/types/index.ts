export interface Travel {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  budget: number;
  image?: string;
  total_expenses: number;
  expenses_count: number;
  total_activities: number;
  activities_count: number;
  dailyPlans: DailyPlan[];
  bbox: number[];
  updated_at?: string;
  created_at: string;
  user_id: string;
  is_closed: boolean;
  is_synced: boolean;
  country_codes?: Array<Record<string, string>>; // [{ "de": "Alemania" }, { "es": "España" }]
}

export interface Expense {
  id: string;
  title: string;
  cost: number;
  currency: string;
  category: ExpenseCategory;
  date: string | null;
  location?: string;
  notes?: string;
  photo?: string;
  lat?: number;
  lng?: number;
  place_id?: string;
  address?: string;
  google_category?: string;
  itinerary_id?: string;
  // Para accommodations con rangos de fechas
  startDate?: string | null;
  endDate?: string | null;
}

export interface Activity {
  id: string;
  travelId?: string;
  title: string;
  description: string;
  date: string | null;
  time?: string;
  cost: number;
  category: ExpenseCategory;
  priority: "high" | "medium" | "low";
  completed: boolean;
  lat?: number;
  lng?: number;
  rating?: number;
  reviews_count?: number;
  address?: string;
  google_category?: string;
  duration?: string;
  location?: string;
  place_id?: string;
  itinerary_id?: string;
}

// Import Category type
import { Category } from "../data/categories";

// Unified category type for both activities and expenses
export type ExpenseCategory = Category;

export type Currency = "EUR" | "USD" | "JPY" | "GBP" | "ARS";

export type ViewMode =
  | "travels"
  | "create-travel"
  | "trip-detail"
  | "add-expense"
  | "add-activity"
  | "daily-planner"
  | "edit-daily-plan";

export interface TravelFormValues {
  name: string;
  start_date: string;
  end_date: string;
  budget: number;
  bbox?: number[];
  country_codes: Array<Record<string, string>>; // [{ "de": "Alemania" }, { "es": "España" }]
}

export interface TravelItinerary {
  id?: string;
  travel_id: string;
  name: string;
  start_date: string;
  end_date: string;
  notes?: string;
  place_type: "city" | "place";
  lat?: number;
  lng?: number;
  place_id?: string;
  bbox?: number[];
  created_at?: string;
}

export interface DailyPlan {
  day: string;
  city_id: number | null;
  name: string | null;
  notes?: string | null;
  activities_count: number;
  expenses_count: number;
  total_spent: number;
  bbox?: number[];
  lat?: number;
  lng?: number;
}
