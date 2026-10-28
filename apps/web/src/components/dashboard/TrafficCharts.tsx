'use client';

import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { EmptyState } from '@/components/ui/Feedback';
import { formatNumber } from '@/lib/format';
import type { TrendPoint } from '@/lib/api';

const day = (v: string) =>
	new Date(`${v}T00:00:00Z`).toLocaleDateString('en-IN', {
		day: 'numeric',
		month: 'short',
		timeZone: 'UTC',
	});

const axis = {
	tick: { fill: '#5b6b64', fontSize: 12 },
	axisLine: false,
	tickLine: false,
} as const;

function ChartTooltip({
	active,
	payload,
	label,
}: {
	active?: boolean;
	payload?: ReadonlyArray<{
		name?: string | number;
		value?: number | string;
		color?: string;
	}>;
	label?: string | number;
}) {
	if (!active || !payload?.length) return null;
	return (
		<div className="rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-card">
			<p className="mb-1 font-medium">{day(String(label))}</p>
			{payload.map((p) => (
				<p key={String(p.name)} className="flex items-center gap-2 text-muted">
					<span
						className="size-2 rounded-full"
						style={{ background: p.color }}
					/>
					{p.name}:{' '}
					<span className="font-medium tabular-nums text-ink">
						{formatNumber(Number(p.value))}
					</span>
				</p>
			))}
		</div>
	);
}

export function TrafficChart({ data }: { data: TrendPoint[] }) {
	if (!data.some((d) => d.total_events > 0))
		return (
			<EmptyState
				title="No activity in this range"
				hint="Visit the restaurant page to generate events."
			/>
		);
	return (
		<div
			className="h-72 px-2 pb-4 pt-6"
			role="img"
			aria-label="Daily page views and total events"
		>
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart data={data} margin={{ left: 0, right: 16 }}>
					<CartesianGrid stroke="#e2e7e4" vertical={false} />
					<XAxis dataKey="date" tickFormatter={day} {...axis} minTickGap={24} />
					<YAxis allowDecimals={false} width={44} {...axis} />
					<Tooltip content={<ChartTooltip />} />
					<Area
						type="monotone"
						dataKey="total_events"
						name="Total events"
						stroke="#9aa8a1"
						strokeDasharray="4 3"
						fill="none"
						strokeWidth={2}
					/>
					<Area
						type="monotone"
						dataKey="page_views"
						name="Page views"
						stroke="#0f5c4a"
						fill="#0f5c4a"
						fillOpacity={0.12}
						strokeWidth={2}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}

export function VisitorsChart({ data }: { data: TrendPoint[] }) {
	if (!data.some((d) => d.unique_visitors > 0))
		return <EmptyState title="No visitors in this range" />;
	return (
		<div
			className="h-72 px-2 pb-4 pt-6"
			role="img"
			aria-label="Unique visitors per day"
		>
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={data} margin={{ left: 0, right: 8 }}>
					<CartesianGrid stroke="#e2e7e4" vertical={false} />
					<XAxis dataKey="date" tickFormatter={day} {...axis} minTickGap={24} />
					<YAxis allowDecimals={false} width={36} {...axis} />
					<Tooltip content={<ChartTooltip />} cursor={{ fill: '#f3f5f4' }} />
					<Bar
						dataKey="unique_visitors"
						name="Unique visitors"
						fill="#0f5c4a"
						radius={[4, 4, 0, 0]}
					/>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
