import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export function Field({
	label,
	className,
	...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
	return (
		<label className="grid gap-1.5 text-sm font-medium">
			{label}
			<input
				className={cn(
					'h-10 rounded-lg border border-line-strong bg-surface px-3 font-normal placeholder:text-muted/70',
					className,
				)}
				{...props}
			/>
		</label>
	);
}
