"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Plus, Type, AlignRight, ListChecks, CheckSquare, Mail, Phone, Hash, Paperclip } from "lucide-react";
import type { FieldType } from "@/lib/supabase/types";

interface AddFieldMenuProps {
  onAdd: (type: FieldType) => void;
}

const FIELD_TYPES: Array<{
  type: FieldType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    type: "short_text",
    label: "טקסט קצר",
    description: "שורה אחת — שם, כתובת, תפקיד",
    icon: Type,
  },
  {
    type: "long_text",
    label: "טקסט ארוך",
    description: "תיאור עצמי, מוטיבציה, סיפור",
    icon: AlignRight,
  },
  {
    type: "select",
    label: "בחירה אחת",
    description: "רשימת אפשרויות, בוחרים אחת",
    icon: ListChecks,
  },
  {
    type: "multi_select",
    label: "בחירה מרובה",
    description: "רשימה, אפשר לבחור כמה",
    icon: CheckSquare,
  },
  {
    type: "email",
    label: "אימייל",
    description: "שדה אימייל עם בדיקה אוטומטית",
    icon: Mail,
  },
  {
    type: "phone",
    label: "טלפון",
    description: "מספר טלפון",
    icon: Phone,
  },
  {
    type: "number",
    label: "מספר",
    description: "גיל, ציון, וכו'",
    icon: Hash,
  },
  {
    type: "file",
    label: "העלאת קובץ",
    description: "קורות חיים, תעודות",
    icon: Paperclip,
  },
];

export function AddFieldMenu({ onAdd }: AddFieldMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default">
          <Plus className="ml-2 h-4 w-4" />
          הוסף שדה
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-72">
        <DropdownMenuLabel>בחר סוג שדה</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {FIELD_TYPES.map(({ type, label, description, icon: Icon }) => (
          <DropdownMenuItem
            key={type}
            onSelect={() => onAdd(type)}
            className="cursor-pointer flex items-start gap-3 py-2.5"
          >
            <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{label}</div>
              <div className="text-xs text-muted-foreground">{description}</div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
