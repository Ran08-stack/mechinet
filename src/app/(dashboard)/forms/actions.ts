"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUserWithMechina } from "@/lib/auth";
import type { FieldType } from "@/lib/supabase/types";

/**
 * יצירת טופס חדש (ריק) ותחילת עריכה.
 */
export async function createForm(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();

  if (!title) {
    return { error: "חייב להיות כותרת" };
  }

  const { profile, supabase } = await requireUserWithMechina();

  const { data, error } = await supabase
    .from("forms")
    .insert({
      mechina_id: profile.mechina_id,
      title,
      is_published: false,
    })
    .select()
    .single();

  if (error || !data) {
    return { error: error?.message ?? "שגיאה ביצירת טופס" };
  }

  revalidatePath("/forms");
  redirect(`/forms/${data.id}`);
}

/**
 * עדכון פרטי טופס (כותרת/תיאור).
 */
export async function updateForm(
  formId: string,
  data: { title?: string; description?: string }
) {
  const { supabase } = await requireUserWithMechina();

  const { error } = await supabase
    .from("forms")
    .update(data)
    .eq("id", formId);

  if (error) return { error: error.message };

  revalidatePath(`/forms/${formId}`);
  revalidatePath("/forms");
  return { success: true };
}

/**
 * Toggle פרסום טופס. כשמפרסמים — הקישור הציבורי הופך זמין.
 */
export async function togglePublish(formId: string, isPublished: boolean) {
  const { supabase } = await requireUserWithMechina();

  const { error } = await supabase
    .from("forms")
    .update({ is_published: isPublished })
    .eq("id", formId);

  if (error) return { error: error.message };

  revalidatePath(`/forms/${formId}`);
  revalidatePath("/forms");
  return { success: true };
}

/**
 * מחיקת טופס (יחד עם כל המועמדים והשדות שלו).
 */
export async function deleteForm(formId: string) {
  const { supabase } = await requireUserWithMechina();

  const { error } = await supabase.from("forms").delete().eq("id", formId);

  if (error) return { error: error.message };

  revalidatePath("/forms");
  redirect("/forms");
}

// =====================================================
// פעולות על שדות
// =====================================================

/**
 * הוספת שדה חדש בסוף הטופס.
 */
export async function addField(
  formId: string,
  data: {
    type: FieldType;
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
  }
) {
  const { supabase } = await requireUserWithMechina();

  // מצא את ה-order הבא
  const { data: existingFields } = await supabase
    .from("form_fields")
    .select("order")
    .eq("form_id", formId)
    .order("order", { ascending: false })
    .limit(1);

  const nextOrder = existingFields?.[0]?.order != null ? existingFields[0].order + 1 : 0;

  const { error } = await supabase.from("form_fields").insert({
    form_id: formId,
    type: data.type,
    label: data.label,
    placeholder: data.placeholder ?? null,
    required: data.required ?? false,
    options: data.options ?? null,
    order: nextOrder,
  });

  if (error) return { error: error.message };

  revalidatePath(`/forms/${formId}`);
  return { success: true };
}

/**
 * עדכון שדה קיים.
 */
export async function updateField(
  fieldId: string,
  formId: string,
  data: {
    type?: FieldType;
    label?: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
  }
) {
  const { supabase } = await requireUserWithMechina();

  const { error } = await supabase
    .from("form_fields")
    .update(data)
    .eq("id", fieldId);

  if (error) return { error: error.message };

  revalidatePath(`/forms/${formId}`);
  return { success: true };
}

/**
 * מחיקת שדה.
 */
export async function deleteField(fieldId: string, formId: string) {
  const { supabase } = await requireUserWithMechina();

  const { error } = await supabase
    .from("form_fields")
    .delete()
    .eq("id", fieldId);

  if (error) return { error: error.message };

  revalidatePath(`/forms/${formId}`);
  return { success: true };
}

/**
 * שינוי סדר שדות (drag & drop).
 * מקבל מערך של { id, order } חדשים.
 */
export async function reorderFields(
  formId: string,
  newOrder: { id: string; order: number }[]
) {
  const { supabase } = await requireUserWithMechina();

  // עדכון מקבילי של כל השדות
  await Promise.all(
    newOrder.map((item) =>
      supabase
        .from("form_fields")
        .update({ order: item.order })
        .eq("id", item.id)
    )
  );

  revalidatePath(`/forms/${formId}`);
  return { success: true };
}
