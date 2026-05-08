import { createBrowserClient } from "@supabase/ssr";

/**
 * לקוח Supabase לצד הדפדפן (Client Components).
 * משתמשים בו לכל פעולה שצריכה לקרות בדפדפן —
 * למשל הרשמה, התחברות, ושאילתות ציבוריות.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
