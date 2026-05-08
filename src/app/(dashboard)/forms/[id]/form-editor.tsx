"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Plus, Eye, Copy, Check } from "lucide-react";
import type { Form, FormField } from "@/lib/supabase/types";
import { updateForm, togglePublish, addField } from "../actions";
import { FieldList } from "./field-list";
import { AddFieldMenu } from "./add-field-menu";

interface FormEditorProps {
  form: Form;
  initialFields: FormField[];
}

export function FormEditor({ form, initialFields }: FormEditorProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [title, setTitle] = useState(form.title);
  const [description, setDescription] = useState(form.description ?? "");
  const [isPublished, setIsPublished] = useState(form.is_published);
  const [savingDetails, setSavingDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/apply/${form.id}`
      : "";

  // שמירה אוטומטית של פרטי הטופס
  function saveDetails() {
    setSavingDetails(true);
    startTransition(async () => {
      await updateForm(form.id, { title, description });
      setTimeout(() => setSavingDetails(false), 800);
    });
  }

  function handleTogglePublish(checked: boolean) {
    setIsPublished(checked);
    startTransition(async () => {
      await togglePublish(form.id, checked);
    });
  }

  function handleAddField(type: FormField["type"]) {
    const defaultLabels: Record<string, string> = {
      short_text: "שדה טקסט",
      long_text: "תשובה ארוכה",
      select: "בחירה אחת",
      multi_select: "בחירה מרובה",
      file: "העלאת קובץ",
      email: "אימייל",
      phone: "טלפון",
      number: "מספר",
    };

    startTransition(async () => {
      await addField(form.id, {
        type,
        label: defaultLabels[type] ?? "שדה חדש",
        required: false,
        options: type === "select" || type === "multi_select" ? ["אפשרות 1"] : undefined,
      });
      router.refresh();
    });
  }

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Header עם כותרת ו-toggle פרסום */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveDetails}
            className="text-2xl font-bold border-0 px-0 shadow-none focus-visible:ring-0 h-auto py-1"
            placeholder="כותרת הטופס"
            maxLength={120}
          />
          {savingDetails && (
            <p className="text-xs text-muted-foreground mt-1">שומר...</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            disabled={!form.is_published && initialFields.length === 0}
          >
            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
              <Eye className="ml-2 h-4 w-4" />
              תצוגה מקדימה
            </a>
          </Button>
        </div>
      </div>

      {/* תיאור הטופס */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">תיאור (אופציונלי)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={saveDetails}
              placeholder="תיאור קצר שיופיע לעיני המועמדים בראש הטופס"
              rows={3}
              maxLength={500}
            />
          </div>
        </CardContent>
      </Card>

      {/* פרסום */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="publish-toggle" className="text-base font-medium">
                פרסום הטופס
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {isPublished
                  ? "הטופס פעיל ומקבל מועמדים"
                  : "הטופס במצב טיוטה — מועמדים לא יכולים למלא"}
              </p>
            </div>
            <Switch
              id="publish-toggle"
              checked={isPublished}
              onCheckedChange={handleTogglePublish}
              disabled={initialFields.length === 0}
            />
          </div>
        </CardHeader>
        {isPublished && (
          <CardContent className="pt-0">
            <Separator className="mb-4" />
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                קישור ציבורי לשיתוף
              </Label>
              <div className="flex gap-2">
                <Input
                  value={publicUrl}
                  readOnly
                  dir="ltr"
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyLink}
                  type="button"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* שדות */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">שדות הטופס</h2>
          <span className="text-sm text-muted-foreground">
            {initialFields.length}{" "}
            {initialFields.length === 1 ? "שדה" : "שדות"}
          </span>
        </div>

        {initialFields.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Plus className="h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-1">עדיין אין שדות</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                הוסף שדות כדי להתחיל לקבל פרטים מהמועמדים
              </p>
              <AddFieldMenu onAdd={handleAddField} />
            </CardContent>
          </Card>
        ) : (
          <>
            <FieldList
              formId={form.id}
              initialFields={initialFields}
            />
            <div className="mt-4 flex justify-center">
              <AddFieldMenu onAdd={handleAddField} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
