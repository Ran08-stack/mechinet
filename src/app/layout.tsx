import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mechinet — מערכת ניהול קבלה למכינות",
  description:
    "פלטפורמה חכמה לניהול תהליך הקבלה במכינות קדם-צבאיות. בונה טפסים, דשבורד מועמדים, סיכומי AI — ההחלטה תמיד נשארת אצל הצוות.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${heebo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-white text-zinc-900">
        {children}
      </body>
    </html>
  );
}
