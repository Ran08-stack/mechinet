import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "./dashboard-nav";

/**
 * Layout מוגן — מי שלא מחובר מועבר ל-/login.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // טוען נתוני משתמש מורחבים מהטבלה הציבורית
  // maybeSingle כדי לא לקרוס אם RLS מחזיר 0 rows
  const { data: profile } = await supabase
    .from("users")
    .select("*, mechinot(name, slug)")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-zinc-50">
      <DashboardNav
        userName={profile?.full_name ?? user.email ?? ""}
        mechinaName={profile?.mechinot?.name ?? null}
      />
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </div>
  );
}
