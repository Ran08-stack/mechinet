// בודק מצב הנתונים: מכינות, משתמשים, ושיוכים
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

if (!serviceKey) {
  console.error("❌ חסר SUPABASE_SERVICE_ROLE_KEY ב-.env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

console.log("\n📋 מכינות:");
const { data: mechinot } = await supabase.from("mechinot").select("*");
console.log(mechinot);

console.log("\n👥 משתמשים:");
const { data: users } = await supabase.from("users").select("id, email, full_name, mechina_id, role");
console.log(users);
