"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "../(auth)/actions";
import { cn } from "@/lib/utils";

interface DashboardNavProps {
  userName: string;
  mechinaName: string | null;
}

const navLinks = [
  { href: "/dashboard", label: "דשבורד" },
  { href: "/forms", label: "טפסים" },
];

export function DashboardNav({ userName, mechinaName }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-bold">
            Mechinet
          </Link>
          {mechinaName && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
              · {mechinaName}
            </span>
          )}
          <div className="flex items-center gap-1 mr-4">
            {navLinks.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm transition-colors",
                    active
                      ? "bg-zinc-100 text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-zinc-50"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {userName}
          </span>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">
              התנתק
            </Button>
          </form>
        </div>
      </div>
    </nav>
  );
}
