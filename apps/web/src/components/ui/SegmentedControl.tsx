import { cn } from '@/lib/cn';

export function SegmentedControl<T extends string | number>({
	label,
	options,
	value,
	onChange,
}: {
	label: string;
	options: { label: string; value: T }[];
	value: T | null;
	onChange: (value: T) => void;
}) {
	return (
		<div
			role="radiogroup"
			aria-label={label}
			className="inline-flex rounded-lg border border-line-strong bg-surface p-0.5"
		>
			{options.map((o) => (
				<button
					key={o.value}
					type="button"
					role="radio"
					aria-checked={value === o.value}
					onClick={() => onChange(o.value)}
					className={cn(
						'h-8 rounded-md px-3 text-sm font-medium transition-colors',
						value === o.value
							? 'bg-ink text-white'
							: 'text-muted hover:text-ink',
					)}
				>
					{o.label}
				</button>
			))}
		</div>
	);
}
