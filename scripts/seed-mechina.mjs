// סקריפט: יוצר את מכינת רעות במסד הנתונים (פעם אחת)
// משתמש ב-service_role key כדי לעקוף RLS
//
// שימוש:
//   1. הוסף ל-.env.local: SUPABASE_SERVICE_ROLE_KEY=...
//   2. הרץ: node scripts/seed-mechina.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env.local");
const env = readFileSync(envPath, "utf-8");

const getEnv = (key) => {
  const match = env.match(new RegExp(`^${key}=(.+)$`, "m"));
  return match?.[1]?.trim();
};

const url = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

if (!url || !serviceKey) {
  console.error("❌ חסר NEXT_PUBLIC_SUPABASE_URL או SUPABASE_SERVICE_ROLE_KEY ב-.env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

console.log("🌱 יוצר מכינת רעות...");

const { data, error } = await supabase
  .from("mechinot")
  .upsert(
    {
      name: "מכינת רעות",
      slug: "reut",
      description: "מכינה קדם-צבאית חצי-שנתית של תנועת החלוץ",
    },
    { onConflict: "slug" }
  )
  .select()
  .single();

if (error) {
  console.error("❌ שגיאה:", error.message);
  process.exit(1);
}

console.log("✅ מכינה נוצרה:", data);
