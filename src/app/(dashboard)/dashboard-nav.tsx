"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "../(auth)/actions";

interface DashboardNavProps {
  userName: string;
  mechinaName: string | null;
}

export function DashboardNav({ userName, mechinaName }: DashboardNavProps) {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-bold">
            Mechinet
          </Link>
          {mechinaName && (
            <span className="text-sm text-muted-foreground">
              · {mechinaName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{userName}</span>
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
