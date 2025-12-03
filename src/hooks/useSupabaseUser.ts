import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export function useSupabaseUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const checkUser = async () => {
      try {
        if (
          !import.meta.env.VITE_SUPABASE_URL ||
          !import.meta.env.VITE_SUPABASE_ANON_KEY
        ) {
          setLoading(false);
          return;
        }
        const { supabase } = await import("../supabaseClient");

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!ignore) {
          setUser(user);
          setLoading(false);
        }

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          if (!ignore) {
            setUser(session?.user ?? null);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    checkUser();

    return () => {
      ignore = true;
    };
  }, []);

  return { user, loading };
}
