import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

const variants: Record<Variant, string> = {
	primary:
		'bg-[var(--color-pine,#0f5c4a)] text-white hover:bg-[var(--color-pine-deep,#0a3d32)]',
	secondary: 'border border-line-strong bg-surface hover:bg-canvas',
	ghost: 'text-muted hover:bg-canvas hover:text-ink',
	danger: 'bg-danger text-white hover:opacity-90',
};
const sizes: Record<Size, string> = {
	sm: 'h-9 px-3 text-sm',
	md: 'h-11 px-5 text-sm',
};

export function buttonStyles(
	opts: { variant?: Variant; size?: Size; className?: string } = {},
) {
	const { variant = 'primary', size = 'md', className } = opts;
	return cn(
		'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
		'disabled:cursor-not-allowed disabled:opacity-50',
		variants[variant],
		sizes[size],
		className,
	);
}

export function Button({
	variant,
	size,
	loading,
	className,
	disabled,
	children,
	...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: Variant;
	size?: Size;
	loading?: boolean;
}) {
	return (
		<button
			type="button"
			disabled={disabled || loading}
			aria-busy={loading || undefined}
			className={buttonStyles({ variant, size, className })}
			{...props}
		>
			{loading && (
				<span
					className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
					aria-hidden="true"
				/>
			)}
			{children}
		</button>
	);
}
