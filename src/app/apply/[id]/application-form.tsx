"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FormField } from "@/lib/supabase/types";
import { submitApplication } from "../actions";

interface ApplicationFormProps {
  formId: string;
  fields: FormField[];
}

export function ApplicationForm({ formId, fields }: ApplicationFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitApplication(formId, formData);
      if (result?.error) {
        setError(result.error);
        // גלילה לראש הדף כדי שהמשתמש יראה את השגיאה
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {fields.map((field) => (
            <FieldRenderer key={field.id} field={field} disabled={isPending} />
          ))}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? "שולח..." : "שליחת הטופס"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

interface FieldRendererProps {
  field: FormField;
  disabled?: boolean;
}

function FieldRenderer({ field, disabled }: FieldRendererProps) {
  const inputName = `field_${field.id}`;
  const isLtrField =
    field.type === "email" || field.type === "phone" || field.type === "number";

  return (
    <div className="space-y-2">
      <Label htmlFor={inputName} className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-destructive mr-1">*</span>}
      </Label>

      {field.type === "short_text" && (
        <Input
          id={inputName}
          name={inputName}
          type="text"
          placeholder={field.placeholder ?? ""}
          required={field.required}
          disabled={disabled}
          maxLength={500}
        />
      )}

      {field.type === "long_text" && (
        <Textarea
          id={inputName}
          name={inputName}
          placeholder={field.placeholder ?? ""}
          required={field.required}
          disabled={disabled}
          rows={5}
          maxLength={5000}
        />
      )}

      {field.type === "email" && (
        <Input
          id={inputName}
          name={inputName}
          type="email"
          placeholder={field.placeholder ?? "name@example.com"}
          required={field.required}
          disabled={disabled}
          dir="ltr"
          className="text-right"
        />
      )}

      {field.type === "phone" && (
        <Input
          id={inputName}
          name={inputName}
          type="tel"
          placeholder={field.placeholder ?? "050-1234567"}
          required={field.required}
          disabled={disabled}
          dir="ltr"
          className="text-right"
        />
      )}

      {field.type === "number" && (
        <Input
          id={inputName}
          name={inputName}
          type="number"
          placeholder={field.placeholder ?? ""}
          required={field.required}
          disabled={disabled}
          dir="ltr"
          className="text-right"
        />
      )}

      {field.type === "select" && (
        <SelectField
          name={inputName}
          options={field.options ?? []}
          required={field.required}
          disabled={disabled}
        />
      )}

      {field.type === "multi_select" && (
        <div className="space-y-2">
          {(field.options ?? []).map((opt, idx) => (
            <label
              key={idx}
              className="flex items-center gap-2 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                name={inputName}
                value={opt}
                disabled={disabled}
                className="h-4 w-4 rounded border-zinc-300"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      )}

      {field.type === "file" && (
        <Input
          id={inputName}
          name={inputName}
          type="file"
          required={field.required}
          disabled
          className="text-muted-foreground"
        />
      )}

      {field.type === "file" && (
        <p className="text-xs text-muted-foreground">
          העלאת קבצים תהיה זמינה בקרוב
        </p>
      )}
    </div>
  );
}

/**
 * רכיב Select מנוהל — מעביר את הערך כ-input מוסתר
 * (כי shadcn Select לא מחזיק `name` משלו).
 */
function SelectField({
  name,
  options,
  required,
  disabled,
}: {
  name: string;
  options: string[];
  required: boolean;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");

  return (
    <>
      <Select
        value={value}
        onValueChange={setValue}
        disabled={disabled}
        required={required}
      >
        <SelectTrigger>
          <SelectValue placeholder="בחר..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt, idx) => (
            <SelectItem key={idx} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input type="hidden" name={name} value={value} />
    </>
  );
}
