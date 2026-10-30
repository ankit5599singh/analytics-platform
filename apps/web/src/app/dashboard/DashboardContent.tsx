'use client';

import { DateRangeControls } from '@/components/dashboard/DateRangeControls';
import {
	TrafficChart,
	VisitorsChart,
} from '@/components/dashboard/TrafficCharts';
import { DataTable } from '@/components/ui/DataTable';
import { Alert } from '@/components/ui/Feedback';
import { Panel, StatStrip } from '@/components/ui/Panel';
import { useDashboardData, useDateRange } from '@/hooks/useDashboard';
import { getPageDisplayName } from '@/lib/page-display-name';

export default function DashboardContent() {
	const { range, preset, invalid, selectPreset, setCustom } = useDateRange(7);
	const { data, loading, error, reload } = useDashboardData(range, !invalid);
	const d = data;
	const stats = [
		{ label: 'Total events', value: d?.summary.total_events },
		{ label: 'Page views', value: d?.summary.page_views },
		{ label: 'Unique visitors', value: d?.summary.unique_visitors },
		{ label: 'Sessions', value: d?.summary.sessions },
	];

	return (
		<main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
			<header className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
				<div className="space-y-3">
					<div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-muted shadow-sm">
						<span className="size-2 rounded-full bg-pine" aria-hidden="true" />
						PRODUCT ANALYTICS
					</div>

					<h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
						Analytics overview
					</h1>

					<p className="max-w-xl text-sm leading-6 text-muted sm:text-base">
						Understand your traffic, discover popular pages, and measure how
						visitors interact with your restaurant demo.
					</p>
				</div>

				<div className="flex flex-wrap items-end gap-3">
					<DateRangeControls
						range={range}
						preset={preset}
						onPreset={selectPreset}
						onCustom={setCustom}
					/>

					<button
						type="button"
						onClick={reload}
						disabled={loading || invalid}
						className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface px-4 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50"
					>
						<span aria-hidden="true">↻</span>
						Refresh
					</button>
				</div>
			</header>

			{invalid && (
				<Alert title="Check your date range">
					The start date must be on or before the end date.
				</Alert>
			)}

			{error && (
				<Alert title="Analytics could not be loaded" onRetry={reload}>
					{error}
				</Alert>
			)}

			<section aria-label="Analytics key metrics" className="space-y-3">
				<div className="flex items-center justify-between gap-3">
					<h2 className="text-sm font-semibold tracking-tight text-ink">
						At a glance
					</h2>
					<span className="text-xs text-muted">
						{range ? `${range.from} — ${range.to}` : 'Preparing range'}
					</span>
				</div>

				<StatStrip loading={loading} items={stats} />
			</section>

			<section aria-label="Traffic trends" className="space-y-3">
				<div>
					<h2 className="text-lg font-semibold tracking-tight">
						Traffic & engagement
					</h2>
					<p className="mt-1 text-sm text-muted">
						Daily activity across the selected period.
					</p>
				</div>

				<div
					className={`grid items-stretch gap-5 transition-opacity duration-200 lg:grid-cols-3 ${
						loading ? 'opacity-60' : ''
					}`}
					aria-busy={loading}
				>
					<Panel
						title="Traffic trends"
						description="Page views compared with total events"
						className="min-w-0 lg:col-span-2"
					>
						<TrafficChart data={d?.trends ?? []} />
					</Panel>

					<Panel
						title="Unique visitors"
						description="Visitors recorded each day"
						className="min-w-0"
					>
						<VisitorsChart data={d?.trends ?? []} />
					</Panel>
				</div>
			</section>

			<section aria-label="Content and event breakdown" className="space-y-3">
				<div>
					<h2 className="text-lg font-semibold tracking-tight">
						Content & events
					</h2>
					<p className="mt-1 text-sm text-muted">
						See which pages attract attention and which events occur most often.
					</p>
				</div>

				<div className="grid items-start gap-5 lg:grid-cols-5">
					<Panel
						title="Popular pages"
						description="Discover your most visited pages."
						className="min-w-0 lg:col-span-3"
					>
						<DataTable
							columns={['Page', 'Views']}
							empty={{
								title: 'No page views yet',
								hint: 'Visit the restaurant demo to start collecting activity.',
							}}
							rows={(d?.pages ?? []).map((page) => ({
								key: page.url,
								primary: getPageDisplayName(page),
								secondary: page.url,
								value: page.views,
							}))}
						/>
					</Panel>

					<Panel
						title="Event breakdown"
						description="Most frequent event names"
						className="min-w-0 lg:col-span-2"
					>
						<DataTable
							columns={['Event', 'Count']}
							empty={{
								title: 'No events yet',
								hint: 'Interactions will appear here after events are collected.',
							}}
							rows={(d?.events ?? []).map((event) => ({
								key: event.event_name,
								primary: event.event_name,
								value: event.total,
							}))}
						/>
					</Panel>
				</div>
			</section>

			<footer className="border-t border-line pt-5 text-xs leading-5 text-muted">
				Metrics reflect events recorded by your analytics service. Visitor
				counts and sessions follow the identity and aggregation rules
				implemented by your backend.
			</footer>
		</main>
	);
}
