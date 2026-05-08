"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical, Plus, X } from "lucide-react";
import { FIELD_TYPE_LABELS } from "@/lib/supabase/types";
import type { FormField } from "@/lib/supabase/types";
import { updateField, deleteField } from "../actions";

interface FieldListProps {
  formId: string;
  initialFields: FormField[];
}

export function FieldList({ formId, initialFields }: FieldListProps) {
  return (
    <div className="space-y-3">
      {initialFields.map((field, idx) => (
        <FieldEditor
          key={field.id}
          formId={formId}
          field={field}
          index={idx}
        />
      ))}
    </div>
  );
}

interface FieldEditorProps {
  formId: string;
  field: FormField;
  index: number;
}

function FieldEditor({ formId, field, index }: FieldEditorProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [label, setLabel] = useState(field.label);
  const [placeholder, setPlaceholder] = useState(field.placeholder ?? "");
  const [required, setRequired] = useState(field.required);
  const [options, setOptions] = useState<string[]>(field.options ?? []);

  const hasOptions = field.type === "select" || field.type === "multi_select";

  function saveField() {
    startTransition(async () => {
      await updateField(field.id, formId, {
        label,
        placeholder: placeholder || undefined,
        required,
        options: hasOptions ? options : undefined,
      });
    });
  }

  function handleToggleRequired(checked: boolean) {
    setRequired(checked);
    startTransition(async () => {
      await updateField(field.id, formId, { required: checked });
    });
  }

  function handleDelete() {
    if (!confirm(`למחוק את השדה "${field.label}"?`)) return;
    startTransition(async () => {
      await deleteField(field.id, formId);
      router.refresh();
    });
  }

  function addOption() {
    const newOptions = [...options, `אפשרות ${options.length + 1}`];
    setOptions(newOptions);
    startTransition(async () => {
      await updateField(field.id, formId, { options: newOptions });
    });
  }

  function updateOption(idx: number, value: string) {
    const newOptions = [...options];
    newOptions[idx] = value;
    setOptions(newOptions);
  }

  function removeOption(idx: number) {
    const newOptions = options.filter((_, i) => i !== idx);
    setOptions(newOptions);
    startTransition(async () => {
      await updateField(field.id, formId, { options: newOptions });
    });
  }

  function saveOptions() {
    startTransition(async () => {
      await updateField(field.id, formId, { options });
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          {/* drag handle (לא פעיל עדיין — placeholder לעתיד) */}
          <div className="text-muted-foreground/40 pt-2 cursor-not-allowed">
            <GripVertical className="h-4 w-4" />
          </div>

          <div className="flex-1 space-y-4">
            {/* Type label + index */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                שדה {index + 1} · {FIELD_TYPE_LABELS[field.type]}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 px-2 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Label */}
            <div className="space-y-2">
              <Label className="text-xs">כותרת השדה</Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onBlur={saveField}
                placeholder="מה לשאול את המועמד?"
                maxLength={200}
              />
            </div>

            {/* Placeholder (רק לשדות טקסט) */}
            {(field.type === "short_text" ||
              field.type === "long_text" ||
              field.type === "email" ||
              field.type === "phone" ||
              field.type === "number") && (
              <div className="space-y-2">
                <Label className="text-xs">טקסט עזר (placeholder)</Label>
                <Input
                  value={placeholder}
                  onChange={(e) => setPlaceholder(e.target.value)}
                  onBlur={saveField}
                  placeholder="טקסט אפור שיוצג בשדה הריק"
                  maxLength={200}
                />
              </div>
            )}

            {/* Options (רק לבחירה) */}
            {hasOptions && (
              <div className="space-y-2">
                <Label className="text-xs">אפשרויות</Label>
                <div className="space-y-2">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={opt}
                        onChange={(e) => updateOption(idx, e.target.value)}
                        onBlur={saveOptions}
                        placeholder={`אפשרות ${idx + 1}`}
                      />
                      {options.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(idx)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    type="button"
                  >
                    <Plus className="ml-2 h-3 w-3" />
                    הוסף אפשרות
                  </Button>
                </div>
              </div>
            )}

            {/* Required toggle */}
            <div className="flex items-center justify-between pt-2 border-t">
              <Label htmlFor={`req-${field.id}`} className="text-sm cursor-pointer">
                שדה חובה
              </Label>
              <Switch
                id={`req-${field.id}`}
                checked={required}
                onCheckedChange={handleToggleRequired}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
