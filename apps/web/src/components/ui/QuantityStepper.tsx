import { Button } from './Button';

export function QuantityStepper({
	name,
	value,
	onAdd,
	onRemove,
}: {
	name: string;
	value: number;
	onAdd: () => void;
	onRemove: () => void;
}) {
	return (
		<div className="flex w-28 justify-end">
			{value === 0 ? (
				<Button
					size="sm"
					variant="secondary"
					onClick={onAdd}
					aria-label={`Add ${name} to cart`}
				>
					Add
				</Button>
			) : (
				<div className="flex items-center rounded-lg border border-line-strong">
					<button
						type="button"
						aria-label={`Remove one ${name}`}
						onClick={onRemove}
						className="size-9 rounded-l-lg hover:bg-canvas"
					>
						−
					</button>
					<span
						className="min-w-6 text-center text-sm font-medium tabular-nums"
						aria-live="polite"
					>
						{value}
					</span>
					<button
						type="button"
						aria-label={`Add one ${name}`}
						onClick={onAdd}
						className="size-9 rounded-r-lg hover:bg-canvas"
					>
						+
					</button>
				</div>
			)}
		</div>
	);
}
