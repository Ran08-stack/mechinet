// תיקון חד-פעמי: משייך משתמשים שעדיין לא משויכים למכינה הראשונה
// המשתמש הראשון = admin, השאר = staff
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

const supabase = createClient(
  getEnv("NEXT_PUBLIC_SUPABASE_URL"),
  getEnv("SUPABASE_SERVICE_ROLE_KEY")
);

// 1. מצא את המכינה הראשונה
const { data: mechina } = await supabase
  .from("mechinot")
  .select("id, name")
  .order("created_at", { ascending: true })
  .limit(1)
  .single();

if (!mechina) {
  console.error("❌ אין מכינה במסד הנתונים");
  process.exit(1);
}

console.log(`✓ מכינה: ${mechina.name}`);

// 2. מצא משתמשים לא משויכים
const { data: unassigned } = await supabase
  .from("users")
  .select("id, email, full_name")
  .is("mechina_id", null)
  .order("created_at", { ascending: true });

if (!unassigned || unassigned.length === 0) {
  console.log("✓ אין משתמשים לא משויכים");
  process.exit(0);
}

console.log(`📋 ${unassigned.length} משתמשים לא משויכים:`);

// 3. בדוק אם יש כבר admin במכינה
const { count: adminCount } = await supabase
  .from("users")
  .select("*", { count: "exact", head: true })
  .eq("mechina_id", mechina.id)
  .eq("role", "admin");

let nextRole = (adminCount ?? 0) === 0 ? "admin" : "staff";

for (const user of unassigned) {
  const { error } = await supabase
    .from("users")
    .update({ mechina_id: mechina.id, role: nextRole })
    .eq("id", user.id);

  if (error) {
    console.log(`   ❌ ${user.email}: ${error.message}`);
  } else {
    console.log(`   ✓ ${user.email} → ${mechina.name} (${nextRole})`);
    // אחרי הראשון — כולם staff
    nextRole = "staff";
  }
}

console.log("\n✅ הושלם");
