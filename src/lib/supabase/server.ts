import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * לקוח Supabase לצד השרת (Server Components, Route Handlers, Server Actions).
 * משתמשים בו לכל פעולה רגישה — קריאות מאובטחות, שינויים, וכו'.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // קריאה מ-Server Component — אפשר להתעלם אם middleware מטפל ב-session
          }
        },
      },
    }
  );
}
