const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

export interface ApiEnvelope<T> {
  data: T;
  meta?: {
    from?: string;
    to?: string;
    timezone?: string;
  };
}

export interface AnalyticsSummary {
  total_events: number;
  page_views: number;
  unique_visitors: number;
  sessions: number;
}

export interface TrendPoint {
  date: string;
  total_events: number;
  page_views: number;
  unique_visitors: number;
}

export interface PopularPage {
  url: string;
  title: string | null;
  views: number;
}

export interface EventBreakdown {
  event_name: string;
  total: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
}

export interface CreatedOrder {
  order_number: string;
  total: number;
  currency: string;
  status: string;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`API request failed (${response.status}).`);
  }

  return response.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      result?.message ?? `API request failed (${response.status}).`;
    throw new Error(message);
  }

  return result as T;
}

export async function dashboardGet<T>(path: string): Promise<T> {
  const response = await fetch(`/api/analytics/${path}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Dashboard request failed (${response.status}).`);
  }

  return response.json() as Promise<T>;
}
