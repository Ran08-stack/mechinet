"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createForm } from "../actions";

export function CreateFormCard() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createForm(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">שם הטופס</Label>
            <Input
              id="title"
              name="title"
              type="text"
              required
              autoFocus
              maxLength={120}
              placeholder="למשל: טופס מועמדות 2026"
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              זה השם שיופיע למועמדים ובדשבורד
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "יוצר..." : "צור והמשך"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
