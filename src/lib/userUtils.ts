import type { User } from "@supabase/supabase-js";

export type UserTier = "free" | "premium" | "ultimate";

export interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  userTier: UserTier;
  userProfile: Record<string, unknown> | null;
}
