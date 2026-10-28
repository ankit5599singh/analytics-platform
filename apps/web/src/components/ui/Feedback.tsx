import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Button } from './Button';

export function Skeleton({ className }: { className?: string }) {
	return (
		<div
			aria-hidden="true"
			className={cn('animate-pulse rounded-lg bg-line', className)}
		/>
	);
}

export function Alert({
	title,
	children,
	onRetry,
}: {
	title: string;
	children?: ReactNode;
	onRetry?: () => void;
}) {
	return (
		<div
			role="alert"
			className="flex items-start justify-between gap-4 rounded-xl border border-danger/20 bg-danger-soft p-4"
		>
			<div>
				<p className="font-medium text-danger">{title}</p>
				{children && <p className="mt-1 text-sm text-danger/90">{children}</p>}
			</div>
			{onRetry && (
				<Button size="sm" variant="danger" onClick={onRetry}>
					Try again
				</Button>
			)}
		</div>
	);
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
	return (
		<div className="px-5 py-10 text-center">
			<p className="font-medium">{title}</p>
			{hint && (
				<p className="mx-auto mt-1 max-w-xs text-sm text-muted">{hint}</p>
			)}
		</div>
	);
}
