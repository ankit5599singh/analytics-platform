'use client';

import { useCallback, useState } from 'react';
import { useAnalytics } from '@/components/AnalyticsProvider';
import { MenuRow } from '@/components/restaurant/MenuRow';
import {
	OrderConfirmation,
	OrderTicket,
} from '@/components/restaurant/OrderTicket';
import { Alert, Skeleton, EmptyState } from '@/components/ui/Feedback';
import { Panel } from '@/components/ui/Panel';
import { useAsync } from '@/hooks/useAsync';
import { useCart } from '@/hooks/useCart';
import { formatINR } from '@/lib/format';
import {
	apiGet,
	apiPost,
	type ApiEnvelope,
	type CreatedOrder,
	type MenuItem,
} from '@/lib/api';

export default function RestaurantPage() {
	const analytics = useAnalytics();

	const fetchMenu = useCallback(
		() =>
			apiGet<ApiEnvelope<MenuItem[]>>('/menu').then(
				(response) => response.data,
			),
		[],
	);

	const menuQuery = useAsync(fetchMenu, 'menu');
	const menu = menuQuery.data ?? [];

	const cart = useCart(menu, {
		onAdd: (item) => {
			analytics?.track('add_to_cart', {
				properties: {
					item_id: item.id,
					item_name: item.name,
					unit_price: item.price,
				},
			});
		},
		onRemove: (item) => {
			analytics?.track('remove_from_cart', {
				properties: {
					item_id: item.id,
					item_name: item.name,
				},
			});
		},
	});

	const {
		lines: cartLines,
		count: cartCount,
		total: cartTotal,
		quantityOf,
		add,
		remove,
		clear: clearCart,
	} = cart;

	const [customerName, setCustomerName] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [orderError, setOrderError] = useState('');
	const [order, setOrder] = useState<CreatedOrder | null>(null);

	const handleAdd = useCallback(
		(item: MenuItem) => {
			analytics?.track('product_clicked', {
				properties: {
					item_id: item.id,
					item_name: item.name,
				},
			});

			add(item);
		},
		[analytics, add],
	);

	const placeOrder = useCallback(async () => {
		if (cartCount === 0 || submitting || menuQuery.loading || menuQuery.error) {
			return;
		}

		setSubmitting(true);
		setOrderError('');

		analytics?.track('checkout_started', {
			properties: {
				item_count: cartCount,
				displayed_total: cartTotal,
				currency: 'INR',
			},
		});

		try {
			const response = await apiPost<ApiEnvelope<CreatedOrder>>('/orders', {
				customer_name: customerName.trim() || undefined,
				items: cartLines.map((line) => ({
					item_id: line.id,
					quantity: line.quantity,
				})),
			});

			setOrder(response.data);
			clearCart();

			analytics?.track('checkout_completed', {
				properties: {
					order_number: response.data.order_number,
					total: response.data.total,
					currency: response.data.currency,
				},
			});
		} catch (error: unknown) {
			setOrderError(
				error instanceof Error ? error.message : 'Could not create your order.',
			);
		} finally {
			setSubmitting(false);
		}
	}, [
		analytics,
		cartCount,
		cartTotal,
		cartLines,
		clearCart,
		customerName,
		menuQuery.loading,
		menuQuery.error,
		submitting,
	]);

	return (
		<main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-8 sm:px-6 sm:pt-12 lg:px-8 lg:pb-16">
			<header className="mb-8 max-w-2xl">
				<span className="eyebrow text-pine">FRESHLY PREPARED</span>

				<h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink text-balance sm:text-5xl">
					Today’s menu
				</h1>

				<p className="mt-3 max-w-xl text-base leading-7 text-muted">
					Find your favorites, build your order, and check out in a few simple
					steps.
				</p>
			</header>

			<div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
				<Panel className="min-w-0 px-5 sm:px-6">
					{menuQuery.loading && (
						<div
							className="space-y-4 py-5"
							aria-label="Loading menu"
							aria-busy="true"
						>
							{[0, 1, 2, 3].map((index) => (
								<Skeleton key={index} className="h-14" />
							))}
						</div>
					)}

					{menuQuery.error && (
						<div className="py-5">
							<Alert
								title="The menu could not be loaded"
								onRetry={menuQuery.reload}
							>
								{menuQuery.error}
							</Alert>
						</div>
					)}

					{!menuQuery.loading && !menuQuery.error && menu.length === 0 && (
						<EmptyState title="The menu is empty" hint="Check back soon." />
					)}

					{!menuQuery.loading && !menuQuery.error && menu.length > 0 && (
						<ul className="divide-y divide-line">
							{menu.map((item, index) => (
								<MenuRow
									key={item.id}
									item={item}
									index={index}
									quantity={quantityOf(item.id)}
									onAdd={handleAdd}
									onRemove={remove}
								/>
							))}
						</ul>
					)}
				</Panel>

				<Panel className="scroll-mt-24 min-w-0 p-5 lg:sticky lg:top-24">
					<div id="ticket" className="scroll-mt-24" />

					{order && cartCount === 0 ? (
						<OrderConfirmation order={order} onReset={() => setOrder(null)} />
					) : (
						<OrderTicket
							lines={cartLines}
							total={cartTotal}
							customerName={customerName}
							onNameChange={setCustomerName}
							onClear={clearCart}
							onSubmit={() => void placeOrder()}
							submitting={submitting}
							disabled={
								cartCount === 0 || menuQuery.loading || !!menuQuery.error
							}
							error={orderError}
						/>
					)}
				</Panel>
			</div>

			{cartCount > 0 && (
				<div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 p-3 backdrop-blur lg:hidden">
					<a
						href="#ticket"
						className="flex h-12 items-center justify-between rounded-lg bg-pine px-4 font-medium text-white"
					>
						<span>View order ({cartCount})</span>
						<span className="tabular-nums">{formatINR(cartTotal)}</span>
					</a>
				</div>
			)}
		</main>
	);
}
