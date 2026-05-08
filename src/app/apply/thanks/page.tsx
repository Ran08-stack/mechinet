import { CheckCircle2 } from "lucide-react";

export default function ThanksPage() {
  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-emerald-100 p-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            הטופס נשלח בהצלחה
          </h1>
          <p className="text-muted-foreground">
            תודה רבה. הצוות יבדוק את הטופס שלך וייצור קשר אם תעבור לשלב הבא.
          </p>
        </div>

        <div className="text-xs text-muted-foreground pt-4">
          נוצר עם{" "}
          <a href="/" className="underline-offset-4 hover:underline">
            Mechinet
          </a>
        </div>
      </div>
    </main>
  );
}
