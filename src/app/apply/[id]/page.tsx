import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Form, FormField } from "@/lib/supabase/types";
import { ApplicationForm } from "./application-form";

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // טען טופס מפורסם בלבד
  const { data: form } = await supabase
    .from("forms")
    .select("*, mechinot(name)")
    .eq("id", id)
    .eq("is_published", true)
    .single<Form & { mechinot: { name: string } | null }>();

  if (!form) {
    notFound();
  }

  const { data: fields } = await supabase
    .from("form_fields")
    .select("*")
    .eq("form_id", id)
    .order("order", { ascending: true });

  const formFields = (fields ?? []) as FormField[];

  return (
    <main className="min-h-screen bg-zinc-50 py-8 px-4 sm:py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          {form.mechinot?.name && (
            <p className="text-sm text-muted-foreground">
              {form.mechinot.name}
            </p>
          )}
          <h1 className="text-3xl font-bold tracking-tight">{form.title}</h1>
          {form.description && (
            <p className="text-muted-foreground max-w-lg mx-auto pt-2">
              {form.description}
            </p>
          )}
        </div>

        {/* Form */}
        {formFields.length === 0 ? (
          <div className="rounded-lg border bg-white p-8 text-center text-muted-foreground">
            הטופס עדיין בהכנה. נסה שוב מאוחר יותר.
          </div>
        ) : (
          <ApplicationForm formId={form.id} fields={formFields} />
        )}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          נוצר עם{" "}
          <a
            href="/"
            className="underline-offset-4 hover:underline"
          >
            Mechinet
          </a>
        </div>
      </div>
    </main>
  );
}
