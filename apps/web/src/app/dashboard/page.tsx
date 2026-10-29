import { Suspense } from "react";
import DashboardContent from "./DashboardContent";

function DashboardFallback() {
  return (
    <main
      className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-label="Loading analytics dashboard"
    >
      <div className="h-10 w-64 animate-pulse rounded-lg bg-canvas" />
      <div className="h-24 animate-pulse rounded-xl border border-line bg-surface" />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="h-72 animate-pulse rounded-xl border border-line bg-surface lg:col-span-2" />
        <div className="h-72 animate-pulse rounded-xl border border-line bg-surface" />
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardContent />
    </Suspense>
  );
}
