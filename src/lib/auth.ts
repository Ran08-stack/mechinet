import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * דורש משתמש מחובר. אם לא — מפנה ללוגין.
 * מחזיר את ה-user וה-profile (כולל mechina_id).
 *
 * הערה: אם RLS חוסם או profile חסר — זה לא יזרוק ל-login,
 * כי המשתמש Auth קיים. במקום זה נחזיר profile=null.
 */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*, mechinot(id, name, slug)")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile, supabase };
}

/**
 * דורש משתמש מחובר ושמשויך למכינה.
 * אם אין profile או אין mechina_id — מפנה לדשבורד עם הודעה.
 */
export async function requireUserWithMechina() {
  const { user, profile, supabase } = await requireUser();

  if (!profile || !profile.mechina_id) {
    redirect("/dashboard");
  }

  return { user, profile, supabase };
}
