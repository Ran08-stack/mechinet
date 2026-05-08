import Link from "next/link";
import { requireUserWithMechina } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, FileText, ExternalLink } from "lucide-react";

export default async function FormsPage() {
  const { profile, supabase } = await requireUserWithMechina();

  const { data: forms } = await supabase
    .from("forms")
    .select("id, title, description, is_published, created_at")
    .eq("mechina_id", profile.mechina_id)
    .order("created_at", { ascending: false });

  // ספירת מועמדים לכל טופס
  const { data: candidatesByForm } = await supabase
    .from("candidates")
    .select("form_id")
    .eq("mechina_id", profile.mechina_id);

  const candidateCounts = (candidatesByForm ?? []).reduce<Record<string, number>>(
    (acc, c) => {
      acc[c.form_id] = (acc[c.form_id] ?? 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">טפסים</h1>
          <p className="text-muted-foreground mt-1">
            ניהול כל טפסי המועמדות של המכינה
          </p>
        </div>
        <Button asChild>
          <Link href="/forms/new">
            <Plus className="ml-2 h-4 w-4" />
            טופס חדש
          </Link>
        </Button>
      </div>

      {!forms || forms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">עדיין אין טפסים</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              צור טופס מועמדות ראשון בכמה דקות. אפשר להוסיף שדות, לפרסם
              ולקבל מועמדים מיד.
            </p>
            <Button asChild>
              <Link href="/forms/new">
                <Plus className="ml-2 h-4 w-4" />
                צור טופס ראשון
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => {
            const count = candidateCounts[form.id] ?? 0;
            return (
              <Link key={form.id} href={`/forms/${form.id}`} className="block">
                <Card className="hover:border-foreground/30 transition-colors h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base line-clamp-2">
                        {form.title}
                      </CardTitle>
                      {form.is_published ? (
                        <Badge variant="default" className="shrink-0">
                          פורסם
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="shrink-0">
                          טיוטה
                        </Badge>
                      )}
                    </div>
                    {form.description && (
                      <CardDescription className="line-clamp-2">
                        {form.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {count} {count === 1 ? "מועמד" : "מועמדים"}
                      </span>
                      <span className="text-xs">
                        {new Date(form.created_at).toLocaleDateString("he-IL")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
