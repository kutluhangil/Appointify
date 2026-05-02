import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    "[Appointify] Supabase env değişkenleri eksik. .env dosyasında VITE_SUPABASE_URL ve VITE_SUPABASE_PUBLISHABLE_KEY olduğundan emin olun.",
  );
}

export const supabase = createClient<Database>(
  SUPABASE_URL ?? "",
  SUPABASE_PUBLISHABLE_KEY ?? "",
  {
    auth: {
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
    global: {
      headers: { "X-Client-Info": "appointify-web@0.1.0" },
    },
  },
);
