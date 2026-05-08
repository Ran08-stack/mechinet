import Link from "next/link";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12 bg-zinc-50">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold tracking-tight">Mechinet</h1>
          </Link>
          <p className="text-sm text-muted-foreground">
            יצירת חשבון לצוות המכינה
          </p>
        </div>

        {/* Form */}
        <RegisterForm />

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          כבר יש לך חשבון?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            התחבר כאן
          </Link>
        </div>
      </div>
    </main>
  );
}
