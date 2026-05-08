"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * הרשמה — יוצר משתמש חדש ב-Supabase Auth.
 * ה-Trigger במסד הנתונים יוצר אוטומטית רשומה ב-public.users.
 */
export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  if (!email || !password || !fullName) {
    return { error: "כל השדות חובה" };
  }

  if (password.length < 6) {
    return { error: "הסיסמה חייבת להיות לפחות 6 תווים" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // אם Supabase דורש אישור אימייל — לא תהיה session
  if (!data.session) {
    redirect("/login?confirm=1");
  }

  // שיוך אוטומטי למכינה הראשונה (בשלב הפיילוט יש רק אחת — רעות)
  // התנהגות זו תוחלף בעתיד ב"בחירת מכינה" או "יצירת מכינה חדשה"
  if (data.user) {
    const { data: firstMechina } = await supabase
      .from("mechinot")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (firstMechina) {
      // משתמש ראשון במכינה הופך ל-admin, השאר staff
      const { count } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("mechina_id", firstMechina.id);

      const role = (count ?? 0) === 0 ? "admin" : "staff";

      await supabase
        .from("users")
        .update({ mechina_id: firstMechina.id, role })
        .eq("id", data.user.id);
    }
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/**
 * התחברות — מחבר משתמש קיים.
 */
export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "אימייל וסיסמה חובה" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "אימייל או סיסמה שגויים" };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/**
 * התנתקות.
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
