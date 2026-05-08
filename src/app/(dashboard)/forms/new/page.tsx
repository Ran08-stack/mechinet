import Link from "next/link";
import { requireUserWithMechina } from "@/lib/auth";
import { CreateFormCard } from "./create-form-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default async function NewFormPage() {
  await requireUserWithMechina();

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Button asChild variant="ghost" size="sm" className="-mr-3">
        <Link href="/forms">
          <ArrowRight className="ml-2 h-4 w-4" />
          חזרה לרשימה
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">טופס חדש</h1>
        <p className="text-muted-foreground mt-1">
          תן לטופס שם, ואחר כך נוסיף שדות
        </p>
      </div>

      <CreateFormCard />
    </div>
  );
}
