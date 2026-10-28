import Link from 'next/link';
import { Alert } from '@/components/ui/Feedback';
import { Button, buttonStyles } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { formatINR } from '@/lib/format';
import type { CreatedOrder } from '@/lib/api';

export interface TicketLine {
	id: string;
	name: string;
	price: number;
	quantity: number;
}

export function OrderTicket({
	lines,
	total,
	customerName,
	onNameChange,
	onClear,
	onSubmit,
	submitting,
	disabled,
	error,
}: {
	lines: TicketLine[];
	total: number;
	customerName: string;
	onNameChange: (v: string) => void;
	onClear: () => void;
	onSubmit: () => void;
	submitting: boolean;
	disabled: boolean;
	error: string;
}) {
	return (
		<>
			<div className="flex items-center justify-between">
				<h2 className="text-base font-semibold tracking-tight">Your order</h2>
				{lines.length > 0 && (
					<Button size="sm" variant="ghost" onClick={onClear}>
						Clear
					</Button>
				)}
			</div>

			{lines.length === 0 ? (
				<p className="py-8 text-sm text-muted">
					Nothing yet. Add a dish from the menu.
				</p>
			) : (
				<ul className="mt-3 space-y-2.5 text-sm">
					{lines.map((l) => (
						<li key={l.id} className="flex justify-between gap-3">
							<span className="min-w-0 truncate">
								<span className="tabular-nums text-muted">{l.quantity} ×</span>{' '}
								{l.name}
							</span>
							<span className="tabular-nums">
								{formatINR(l.price * l.quantity)}
							</span>
						</li>
					))}
				</ul>
			)}

			<div className="mt-5 flex items-baseline justify-between border-t border-dashed border-line-strong pt-4">
				<span className="text-sm text-muted">Total</span>
				<span className="text-2xl font-semibold tabular-nums tracking-tight">
					{formatINR(total)}
				</span>
			</div>

			<div className="mt-5">
				<Field
					label="Name on the order (optional)"
					value={customerName}
					onChange={(e) => onNameChange(e.target.value)}
					maxLength={100}
					autoComplete="name"
				/>
			</div>

			<Button
				className="mt-4 w-full"
				loading={submitting}
				disabled={disabled}
				onClick={onSubmit}
			>
				{submitting ? 'Placing order…' : 'Place order'}
			</Button>

			{error && (
				<div className="mt-4">
					<Alert title="Order not placed">
						{error} Your cart is unchanged.
					</Alert>
				</div>
			)}
		</>
	);
}

export function OrderConfirmation({
	order,
	onReset,
}: {
	order: CreatedOrder;
	onReset: () => void;
}) {
	return (
		<div role="status">
			<div
				className="grid size-10 place-items-center rounded-full bg-pine text-white"
				aria-hidden="true"
			>
				✓
			</div>
			<h2 className="mt-4 text-xl font-semibold tracking-tight">
				Order placed
			</h2>
			<p className="mt-1 text-sm text-muted">
				{formatINR(order.total)} · {order.status}
			</p>
			<p className="mt-4 break-all rounded-lg bg-canvas p-3 font-mono text-xs">
				{order.order_number}
			</p>
			<div className="mt-5 grid gap-2">
				<Link href="/dashboard" className={buttonStyles()}>
					See it in analytics
				</Link>
				<Button variant="secondary" onClick={onReset}>
					Start a new order
				</Button>
			</div>
		</div>
	);
}
