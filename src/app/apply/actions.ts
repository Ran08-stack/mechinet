"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { FormField } from "@/lib/supabase/types";

/**
 * שליחת טופס מועמדות מהציבור.
 * המשתמש לא מחובר — RLS מאפשר insert רק לטפסים שמפורסמים.
 */
export async function submitApplication(formId: string, formData: FormData) {
  const supabase = await createClient();

  // 1. טען את הטופס + השדות שלו (גם בלי auth, כי הוא published)
  const { data: form, error: formError } = await supabase
    .from("forms")
    .select("id, mechina_id, is_published")
    .eq("id", formId)
    .eq("is_published", true)
    .single();

  if (formError || !form) {
    return { error: "הטופס לא נמצא או שאינו פעיל." };
  }

  const { data: fields } = await supabase
    .from("form_fields")
    .select("*")
    .eq("form_id", formId)
    .order("order", { ascending: true });

  if (!fields || fields.length === 0) {
    return { error: "לטופס אין שדות פעילים." };
  }

  // 2. בנה אובייקט תשובות + שדות מיוחדים (full_name, email, phone)
  const answers: Record<string, unknown> = {};
  let fullName: string | null = null;
  let email: string | null = null;
  let phone: string | null = null;

  for (const field of fields as FormField[]) {
    const raw = formData.getAll(`field_${field.id}`);
    let value: unknown;

    if (field.type === "multi_select") {
      value = raw.map((v) => String(v));
    } else {
      value = raw[0] ? String(raw[0]) : null;
    }

    // ולידציה: שדות חובה
    if (field.required) {
      const isEmpty =
        value == null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);
      if (isEmpty) {
        return { error: `שדה חובה ריק: ${field.label}` };
      }
    }

    // ולידציה: אימייל
    if (field.type === "email" && typeof value === "string" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { error: `אימייל לא תקין: ${field.label}` };
      }
    }

    answers[field.id] = value;

    // ניחוש "שדות מועמד" לפי label
    const labelLower = field.label.toLowerCase();
    if (
      !fullName &&
      typeof value === "string" &&
      (labelLower.includes("שם מלא") ||
        labelLower.includes("שם פרטי") ||
        (labelLower.includes("שם") && field.type === "short_text"))
    ) {
      fullName = value;
    }
    if (!email && field.type === "email" && typeof value === "string") {
      email = value;
    }
    if (!phone && field.type === "phone" && typeof value === "string") {
      phone = value;
    }
  }

  // 3. שמור את המועמד
  const { error: insertError } = await supabase.from("candidates").insert({
    form_id: formId,
    mechina_id: form.mechina_id,
    full_name: fullName,
    email,
    phone,
    answers,
    status: "submitted",
  });

  if (insertError) {
    console.error("Submit error:", insertError);
    return { error: "שגיאה בשליחה. נסה שוב." };
  }

  redirect("/apply/thanks");
}
