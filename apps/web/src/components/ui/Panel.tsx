import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Skeleton } from "./Feedback";
import { formatNumber } from "@/lib/format";

export function Panel({
  title,
  description,
  action,
  className,
  children,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-line bg-surface shadow-card",
        className,
      )}
    >
      {title && (
        <header className="flex items-start justify-between gap-4 px-5 pt-5">
          <div>
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            {description && (
              <p className="mt-0.5 text-sm text-muted">{description}</p>
            )}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function StatStrip({
  items,
  loading,
}: {
  items: { label: string; value?: number }[];
  loading: boolean;
}) {
  return (
    <dl
      aria-busy={loading}
      className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-card lg:grid-cols-4"
    >
      {items.map(({ label, value }) => (
        <div key={label} className="bg-surface p-5">
          <dt className="text-sm text-muted">{label}</dt>
          <dd className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
            {loading && value === undefined ? (
              <Skeleton className="h-9 w-20" />
            ) : value === undefined ? (
              "—"
            ) : (
              formatNumber(value)
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
