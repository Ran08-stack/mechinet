import Link from "next/link";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ confirm?: string }>;
}) {
  const params = await searchParams;
  const showConfirmMessage = params.confirm === "1";

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12 bg-zinc-50">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold tracking-tight">Mechinet</h1>
          </Link>
          <p className="text-sm text-muted-foreground">
            התחברות לצוות המכינה
          </p>
        </div>

        {/* Confirm Message */}
        {showConfirmMessage && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <div className="font-medium mb-1">החשבון נוצר בהצלחה!</div>
            <div className="text-emerald-700">
              שלחנו אליך מייל לאישור. לחץ על הקישור במייל ואז התחבר כאן.
            </div>
          </div>
        )}

        {/* Form */}
        <LoginForm />

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          עוד לא נרשמת?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            הירשם כאן
          </Link>
        </div>
      </div>
    </main>
  );
}
