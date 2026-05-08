/**
 * טיפוסי TypeScript לטבלאות במסד הנתונים.
 * מתאים לסכמה ב-supabase/migrations/0001_initial_schema.sql
 */

export type FieldType =
  | "short_text"
  | "long_text"
  | "select"
  | "multi_select"
  | "file"
  | "email"
  | "phone"
  | "number";

export type CandidateStatus =
  | "submitted"
  | "reviewed"
  | "interview"
  | "group_day"
  | "accepted"
  | "waitlist"
  | "rejected";

export type UserRole = "admin" | "staff";

export interface Mechina {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  mechina_id: string | null;
  role: UserRole;
  created_at: string;
}

export interface Form {
  id: string;
  mechina_id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface FormField {
  id: string;
  form_id: string;
  type: FieldType;
  label: string;
  placeholder: string | null;
  required: boolean;
  options: string[] | null;
  order: number;
  created_at: string;
}

export interface Candidate {
  id: string;
  form_id: string;
  mechina_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  status: CandidateStatus;
  answers: Record<string, unknown>;
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  candidate_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

/**
 * תיוגים בעברית לסטטוסים
 */
export const STATUS_LABELS: Record<CandidateStatus, string> = {
  submitted: "נשלח",
  reviewed: "נבדק",
  interview: "ראיון",
  group_day: "יום מיון",
  accepted: "התקבל",
  waitlist: "המתנה",
  rejected: "נדחה",
};

/**
 * תיוגים בעברית לסוגי שדות
 */
export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  short_text: "טקסט קצר",
  long_text: "טקסט ארוך",
  select: "בחירה אחת",
  multi_select: "בחירה מרובה",
  file: "קובץ",
  email: "אימייל",
  phone: "טלפון",
  number: "מספר",
};
