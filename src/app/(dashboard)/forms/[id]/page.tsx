import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUserWithMechina } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { FormEditor } from "./form-editor";
import type { Form, FormField } from "@/lib/supabase/types";

export default async function EditFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile, supabase } = await requireUserWithMechina();

  const { data: form, error } = await supabase
    .from("forms")
    .select("*")
    .eq("id", id)
    .single<Form>();

  if (error || !form) {
    notFound();
  }

  // וידוא שהטופס שייך למכינה של המשתמש
  if (form.mechina_id !== profile.mechina_id) {
    redirect("/forms");
  }

  const { data: fields } = await supabase
    .from("form_fields")
    .select("*")
    .eq("form_id", id)
    .order("order", { ascending: true });

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-mr-3">
        <Link href="/forms">
          <ArrowRight className="ml-2 h-4 w-4" />
          חזרה לרשימה
        </Link>
      </Button>

      <FormEditor form={form} initialFields={(fields ?? []) as FormField[]} />
    </div>
  );
}
