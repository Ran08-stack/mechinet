// סקריפט בדיקה — מוודא שהחיבור ל-Supabase עובד והטבלאות קיימות
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
const key = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

if (!url || !key) {
  console.error("❌ חסרים משתני סביבה");
  process.exit(1);
}

console.log("🔌 מתחבר ל-Supabase...");
console.log(`   URL: ${url}`);
console.log(`   Key: ${key.substring(0, 20)}...`);

const supabase = createClient(url, key);

// בדיקה 1: טבלת mechinot
console.log("\n📋 בודק טבלאות...");
const tables = ["mechinot", "users", "forms", "form_fields", "candidates", "notes"];

for (const table of tables) {
  const { error, count } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  if (error) {
    console.log(`   ❌ ${table}: ${error.message}`);
  } else {
    console.log(`   ✓ ${table} (${count ?? 0} שורות)`);
  }
}

console.log("\n✅ בדיקה הושלמה");
