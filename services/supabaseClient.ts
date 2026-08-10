import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabaseProjectRef = (() => {
  if (!supabaseUrl) {
    return null;
  }

  try {
    return new URL(supabaseUrl).hostname.split(".")[0] ?? null;
  } catch {
    return null;
  }
})();

if (process.env.NODE_ENV !== "production") {
  console.log("[QueueCast] Supabase client configuration:", {
    configured: isSupabaseConfigured,
    projectRef: supabaseProjectRef,
    urlVariable: "EXPO_PUBLIC_SUPABASE_URL",
    keyVariable: "EXPO_PUBLIC_SUPABASE_ANON_KEY",
  });
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        storage: Platform.OS === "web" ? undefined : AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === "web",
      },
    })
  : null;
