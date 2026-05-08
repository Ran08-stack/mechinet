import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16 bg-zinc-50">
      <div className="w-full max-w-2xl space-y-12 text-center">
        {/* Logo / Title */}
        <div className="space-y-3">
          <div className="inline-block rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600">
            גרסת בטא · קוד פתוח
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900 sm:text-6xl">
            Mechinet
          </h1>
          <p className="text-lg text-zinc-500">
            מערכת ניהול קבלה למכינות קדם-צבאיות
          </p>
        </div>

        {/* Tagline */}
        <div className="space-y-4">
          <p className="text-2xl font-medium text-zinc-800 leading-relaxed">
            הצוות מחליט. אנחנו רק עוזרים לסדר.
          </p>
          <p className="text-base text-zinc-600 leading-relaxed mx-auto max-w-lg">
            בונים טופס מועמדות תוך 10 דקות, מנהלים מאות מועמדים בדשבורד אחד,
            ומקבלים סיכומי AI שמקצרים ימים של עבודה לשעות.
          </p>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-center gap-3">
          {user ? (
            <Button asChild size="lg">
              <Link href="/dashboard">לדשבורד</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg">
                <Link href="/register">הירשמו עכשיו</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">התחברות</Link>
              </Button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-xs text-zinc-400">
          קוד פתוח · רישיון MIT · נבנה למכינת רעות (תנועת החלוץ)
        </div>
      </div>
    </main>
  );
}
