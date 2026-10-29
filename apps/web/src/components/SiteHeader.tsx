"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const links = [
  { href: "/restaurant", label: "Restaurant", icon: "◈" },
  { href: "/dashboard", label: "Analytics", icon: "▥" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-surface/90 backdrop-blur-xl">
      <div className="mx-auto flex h-17 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-3 rounded-lg"
          aria-label="Demo Kitchen home"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-pine text-sm font-bold text-white shadow-sm transition-transform group-hover:scale-[1.03]">
            DK
          </span>

          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold tracking-tight text-ink sm:text-base">
              Demo Kitchen
            </span>
            <span className="hidden text-xs text-muted sm:block">
              Restaurant analytics demo
            </span>
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="flex items-center gap-1 rounded-xl border border-line bg-canvas/70 p-1"
        >
          {links.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-all sm:px-4",
                  active
                    ? "bg-surface text-pine shadow-sm ring-1 ring-line"
                    : "text-muted hover:bg-surface/70 hover:text-ink",
                )}
              >
                <span aria-hidden="true">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
