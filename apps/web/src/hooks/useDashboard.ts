import { useCallback, useState } from "react";
import {
  dashboardGet,
  type AnalyticsSummary,
  type ApiEnvelope,
  type EventBreakdown,
  type PopularPage,
  type TrendPoint,
} from "@/lib/api";
import { useAsync } from "./useAsync";

export interface DateRange {
  from: string;
  to: string;
}

const iso = (date: Date) => date.toISOString().slice(0, 10);

function lastDays(days: number): DateRange {
  const to = new Date();
  const from = new Date(to);

  from.setUTCDate(from.getUTCDate() - (days - 1));

  return {
    from: iso(from),
    to: iso(to),
  };
}

export function useDateRange(initialDays = 7) {
  const [range, setRange] = useState<DateRange>(() => lastDays(initialDays));
  const [preset, setPreset] = useState<number | null>(initialDays);

  const selectPreset = useCallback((days: number) => {
    const safeDays = Math.max(1, Math.floor(days));

    setPreset(safeDays);
    setRange(lastDays(safeDays));
  }, []);

  const setCustom = useCallback((patch: Partial<DateRange>) => {
    setPreset(null);
    setRange((current) => ({ ...current, ...patch }));
  }, []);

  return {
    range,
    preset,
    invalid: range.from > range.to,
    selectPreset,
    setCustom,
  };
}

export function useDashboardData(range: DateRange | null, enabled: boolean) {
  const from = range?.from ?? "";
  const to = range?.to ?? "";
  const requestKey = `${from}:${to}`;

  const fetchData = useCallback(async () => {
    if (!from || !to || from > to) {
      throw new Error("A valid date range is required.");
    }

    const qs = `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;

    const [summary, trends, pages, events] = await Promise.all([
      dashboardGet<ApiEnvelope<AnalyticsSummary>>(`summary?${qs}`),
      dashboardGet<ApiEnvelope<TrendPoint[]>>(`trends?${qs}`),
      dashboardGet<ApiEnvelope<PopularPage[]>>(`pages?${qs}`),
      dashboardGet<ApiEnvelope<EventBreakdown[]>>(`events?${qs}`),
    ]);

    return {
      summary: summary.data,
      trends: trends.data,
      pages: pages.data,
      events: events.data,
    };
  }, [from, to]);

  return useAsync(
    fetchData,
    requestKey,
    enabled && Boolean(range) && Boolean(from) && Boolean(to) && from <= to,
  );
}
