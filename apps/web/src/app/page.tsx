import Link from 'next/link';
import { buttonStyles } from '@/components/ui/Button';

const flow = [
	{
		title: 'Browser SDK',
		body: 'Tracks page views and custom events with an anonymous visitor and session ID.',
	},
	{
		title: 'Ingestion API',
		body: 'Validates each event and stores it, including events sent from the server.',
	},
	{
		title: 'Dashboard',
		body: 'Reads the stored events by date range: traffic, visitors, pages, and event counts.',
	},
];

export default function HomePage() {
	return (
		<main className="mx-auto max-w-6xl px-4 py-16 sm:px-8 sm:py-24">
			<h1 className="max-w-3xl font-display text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
				See what people do in your product, not just where they land.
			</h1>
			<p className="mt-6 max-w-xl text-lg text-muted">
				A restaurant demo wired to a reusable analytics SDK. Order something,
				then watch it appear in the dashboard.
			</p>
			<div className="mt-8 flex flex-wrap gap-3">
				<Link href="/restaurant" className={buttonStyles()}>
					Order from the demo
				</Link>
				<Link
					href="/dashboard"
					className={buttonStyles({ variant: 'secondary' })}
				>
					Open analytics
				</Link>
			</div>

			<ol className="mt-20 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
				{flow.map((step, i) => (
					<li key={step.title} className="bg-surface p-6">
						<span className="text-sm text-muted tabular-nums">
							Step {i + 1}
						</span>
						<h2 className="mt-2 text-lg font-semibold tracking-tight">
							{step.title}
						</h2>
						<p className="mt-2 text-sm leading-6 text-muted">{step.body}</p>
					</li>
				))}
			</ol>
		</main>
	);
}
