import { memo } from 'react';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { formatINR } from '@/lib/format';
import type { MenuItem } from '@/lib/api';

const EMOJI = ['🍔', '🍕', '🍝', '🍟'];

export const MenuRow = memo(function MenuRow({
	item,
	index,
	quantity,
	onAdd,
	onRemove,
}: {
	item: MenuItem;
	index: number;
	quantity: number;
	onAdd: (item: MenuItem) => void;
	onRemove: (item: MenuItem) => void;
}) {
	return (
		<li className="flex items-center gap-4 py-4">
			<span
				aria-hidden="true"
				className="grid size-14 shrink-0 place-items-center rounded-xl bg-canvas text-2xl"
			>
				{EMOJI[index % EMOJI.length]}
			</span>
			<div className="flex min-w-0 flex-1 items-baseline gap-3">
				<h3 className="truncate font-medium">{item.name}</h3>
				<span
					aria-hidden="true"
					className="min-w-4 flex-1 translate-y-0.75 border-b border-dotted border-line-strong"
				/>
				<span className="font-medium tabular-nums">
					{formatINR(item.price)}
				</span>
			</div>
			<QuantityStepper
				name={item.name}
				value={quantity}
				onAdd={() => onAdd(item)}
				onRemove={() => onRemove(item)}
			/>
		</li>
	);
});
