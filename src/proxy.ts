import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Proxy של Next.js 16 (לשעבר Middleware).
 * רץ על כל בקשה לפני שהיא מגיעה לדף — ומרענן את ה-session של המשתמש.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * הפעל בכל בקשה חוץ מ:
     * - _next/static (קבצים סטטיים)
     * - _next/image (אופטימיזציית תמונות)
     * - favicon.ico
     * - תמונות שונות
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
