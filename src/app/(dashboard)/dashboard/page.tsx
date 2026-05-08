import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, ArrowLeft } from "lucide-react";

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
    .maybeSingle();

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
        <p className="text-muted-foreground mt-1">ברוך הבא ל-Mechinet</p>
      </div>

      {!profile?.mechina_id && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-900">
              החשבון שלך עדיין לא משויך למכינה
            </CardTitle>
            <CardDescription className="text-amber-800">
              ייתכן שזו בעיית הרשאות זמנית. נסה לרענן את הדף, או צור קשר עם מנהל
              המערכת.
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
            <CardDescription>טפסים</CardDescription>
            <CardTitle className="text-3xl">{formsCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">סה״כ במכינה</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>סטטוס</CardDescription>
            <CardTitle className="text-lg text-emerald-600">פעיל</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">המערכת זמינה</p>
          </CardContent>
        </Card>
      </div>

      {profile?.mechina_id && (
        <Card>
          <CardHeader>
            <CardTitle>איך מתחילים</CardTitle>
            <CardDescription>שלוש פעולות פשוטות כדי להתחיל</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <div className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium">
                1
              </div>
              <div className="flex-1">
                <div className="font-medium">צור טופס מועמדות</div>
                <div className="text-sm text-muted-foreground">
                  בנה טופס בעברית עם השדות שאתם צריכים
                </div>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/forms/new">
                  <Plus className="ml-1 h-3 w-3" />
                  צור
                </Link>
              </Button>
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-4">
              <div className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium">
                2
              </div>
              <div className="flex-1">
                <div className="font-medium">פרסם וקבל קישור</div>
                <div className="text-sm text-muted-foreground">
                  שתף את הקישור הציבורי עם מועמדים בוואטסאפ או מייל
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-4">
              <div className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium">
                3
              </div>
              <div className="flex-1">
                <div className="font-medium">נהל מועמדים בדשבורד</div>
                <div className="text-sm text-muted-foreground">
                  עקוב אחר התקדמות, הוסף הערות, ועדכן סטטוסים
                </div>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/forms">
                  לטפסים
                  <ArrowLeft className="mr-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
