import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ספירת מועמדים, טפסים — אם המשתמש שייך למכינה
  const { data: profile } = await supabase
    .from("users")
    .select("mechina_id")
    .eq("id", user!.id)
    .single();

  let candidatesCount = 0;
  let formsCount = 0;

  if (profile?.mechina_id) {
    const [{ count: c1 }, { count: c2 }] = await Promise.all([
      supabase
        .from("candidates")
        .select("*", { count: "exact", head: true })
        .eq("mechina_id", profile.mechina_id),
      supabase
        .from("forms")
        .select("*", { count: "exact", head: true })
        .eq("mechina_id", profile.mechina_id),
    ]);
    candidatesCount = c1 ?? 0;
    formsCount = c2 ?? 0;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">דשבורד</h1>
        <p className="text-muted-foreground mt-1">
          ברוך הבא ל-Mechinet
        </p>
      </div>

      {!profile?.mechina_id && (
        <Card>
          <CardHeader>
            <CardTitle>החשבון שלך עדיין לא משויך למכינה</CardTitle>
            <CardDescription>
              בקרוב נוסיף תהליך להגדרת המכינה. בינתיים — צור קשר עם מנהל המערכת.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>מועמדים</CardDescription>
            <CardTitle className="text-3xl">{candidatesCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">סה״כ במערכת</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>טפסים פעילים</CardDescription>
            <CardTitle className="text-3xl">{formsCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">טפסים שיצרת</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>סטטוס</CardDescription>
            <CardTitle className="text-lg text-emerald-600">פעיל</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              שלב 1 — Auth מושלם
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>הצעדים הבאים</CardTitle>
          <CardDescription>
            המערכת תהיה מוכנה לשימוש מלא בעוד כמה שלבים
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600">✓</span>
            <span>הקמת תשתית (Next.js + Supabase)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-600">✓</span>
            <span>מערכת התחברות והרשמה</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>○</span>
            <span>בונה טפסים</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>○</span>
            <span>קבלת מועמדים מטופס ציבורי</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>○</span>
            <span>Pipeline שלבי קבלה</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>○</span>
            <span>סיכום AI לכל מועמד</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
