import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * עוזר לאחד מחלקות Tailwind CSS עם תמיכה ב-conditional classes.
 * משמש בכל רכיבי shadcn/ui.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
