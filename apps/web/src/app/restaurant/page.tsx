"use client";

import { useCallback, useMemo, useState } from "react";
import { useAnalytics } from "@/components/AnalyticsProvider";
import { getMenuCategory, MenuRow } from "@/components/restaurant/MenuRow";
import {
  OrderConfirmation,
  OrderTicket,
} from "@/components/restaurant/OrderTicket";
import { Alert, EmptyState, Skeleton } from "@/components/ui/Feedback";
import { useAsync } from "@/hooks/useAsync";
import { useCart } from "@/hooks/useCart";
import { formatINR } from "@/lib/format";
import {
  apiGet,
  apiPost,
  type ApiEnvelope,
  type CreatedOrder,
  type MenuItem,
} from "@/lib/api";

const CATEGORIES = [
  "All",
  "Burgers",
  "Pizza",
  "Pasta",
  "Wraps",
  "Sides",
  "Drinks",
  "Desserts",
  "Other",
] as const;

type Category = (typeof CATEGORIES)[number];

const EMPTY_MENU: MenuItem[] = [];

export default function RestaurantPage() {
  const analytics = useAnalytics();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const [customerName, setCustomerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [order, setOrder] = useState<CreatedOrder | null>(null);

  const fetchMenu = useCallback(
    () =>
      apiGet<ApiEnvelope<MenuItem[]>>("/menu").then(
        (response) => response.data,
      ),
    [],
  );

  const menuQuery = useAsync(fetchMenu, "menu");
  const menu = menuQuery.data ?? EMPTY_MENU;

  const cart = useCart(menu, {
    onAdd: (item) => {
      analytics?.track("add_to_cart", {
        properties: {
          item_id: item.id,
          item_name: item.name,
          unit_price: item.price,
        },
      });
    },
    onRemove: (item) => {
      analytics?.track("remove_from_cart", {
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

  const filteredMenu = useMemo(() => {
    const term = search.trim().toLowerCase();

    return menu.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(term);
      const matchesCategory =
        category === "All" || getMenuCategory(item) === category;

      return matchesSearch && matchesCategory;
    });
  }, [menu, search, category]);

  const handleAdd = useCallback(
    (item: MenuItem) => {
      analytics?.track("product_clicked", {
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
    setOrderError("");

    analytics?.track("checkout_started", {
      properties: {
        item_count: cartCount,
        displayed_total: cartTotal,
        currency: "INR",
      },
    });

    try {
      const response = await apiPost<ApiEnvelope<CreatedOrder>>("/orders", {
        customer_name: customerName.trim() || undefined,
        items: cartLines.map((line) => ({
          item_id: line.id,
          quantity: line.quantity,
        })),
      });

      setOrder(response.data);
      clearCart();

      analytics?.track("checkout_completed", {
        properties: {
          order_number: response.data.order_number,
          total: response.data.total,
          currency: response.data.currency,
        },
      });
    } catch (error: unknown) {
      setOrderError(
        error instanceof Error ? error.message : "Could not create your order.",
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
    <main className="min-h-screen bg-[#faf8f3] pb-28 text-[#202b24] lg:pb-16">
      <div className="mx-auto w-full max-w-360 px-4 pt-6 sm:px-6 sm:pt-9 lg:px-10">
        <section className="relative isolate overflow-hidden rounded-4xl bg-[#173f31] px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          <div
            aria-hidden="true"
            className="absolute -right-12 -top-24 -z-10 size-72 rounded-full bg-[#d7a75b]/20 blur-3xl sm:size-96"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-32 right-1/3 -z-10 size-64 rounded-full bg-white/5 blur-3xl"
          />

          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#f3d7a0]">
              <span className="size-1.5 rounded-full bg-[#f3d7a0]" />
              Good food, good mood
            </span>

            <h1 className="mt-5 max-w-xl font-display text-4xl font-medium leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Your next
              <br />
              favorite meal
              <br />
              <span className="italic text-[#f3d7a0]">starts here.</span>
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-7 text-white/75 sm:text-base">
              Comfort food, fresh favorites, and little treats worth looking
              forward to. Pick what you love and we’ll take care of the rest.
            </p>

            <a
              href="#menu"
              className="mt-7 inline-flex h-12 items-center justify-center gap-3 rounded-full bg-[#f3d7a0] px-6 text-sm font-semibold text-[#173f31] transition hover:bg-white focus-visible:outline-white"
            >
              Explore the menu
              <span aria-hidden="true">↓</span>
            </a>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-7 right-8 hidden select-none text-[9rem] leading-none opacity-15 xl:block"
          >
            🍔
          </div>
        </section>

        <section id="menu" className="scroll-mt-28 pt-10 sm:pt-14">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8b6840]">
                Made for your cravings
              </p>
              <h2 className="mt-2 font-display text-3xl font-medium tracking-tight sm:text-4xl">
                Explore our menu
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#72796f]">
                Find something delicious for today.
              </p>
            </div>

            <label className="flex h-12 w-full items-center gap-3 rounded-2xl border border-[#e7e1d5] bg-white px-4 shadow-sm transition focus-within:border-[#47775b] md:max-w-xs">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="size-5 shrink-0 text-[#7b847b]"
              >
                <circle
                  cx="10.8"
                  cy="10.8"
                  r="6.8"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <path
                  d="m16 16 4.2 4.2"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search your favorites..."
                aria-label="Search menu"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9b9f97]"
              />
            </label>
          </div>

          <div
            className="mt-6 flex gap-2 overflow-x-auto pb-2"
            aria-label="Filter menu by category"
          >
            {CATEGORIES.map((item) => {
              const active = category === item;

              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(item)}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-[#173f31] text-white shadow-sm"
                      : "border border-[#e7e1d5] bg-white text-[#626b62] hover:border-[#a9b7a9] hover:text-[#173f31]"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          {menuQuery.loading && (
            <div
              className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
              aria-label="Loading menu"
              aria-busy="true"
            >
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-3xl border border-[#e7e1d5] bg-white p-4"
                >
                  <Skeleton className="h-36 rounded-2xl" />
                  <Skeleton className="mt-4 h-5 w-2/3" />
                  <Skeleton className="mt-3 h-4 w-1/3" />
                  <Skeleton className="mt-5 h-10" />
                </div>
              ))}
            </div>
          )}

          {menuQuery.error && (
            <div className="mt-6">
              <Alert
                title="We couldn't load the menu"
                onRetry={menuQuery.reload}
              >
                {menuQuery.error}
              </Alert>
            </div>
          )}

          {!menuQuery.loading && !menuQuery.error && menu.length === 0 && (
            <div className="mt-6 rounded-3xl border border-[#e7e1d5] bg-white">
              <EmptyState
                title="The kitchen is getting ready"
                hint="Our menu will be available soon. Please check back."
              />
            </div>
          )}

          {!menuQuery.loading &&
            !menuQuery.error &&
            menu.length > 0 &&
            filteredMenu.length === 0 && (
              <div className="mt-6 rounded-3xl border border-[#e7e1d5] bg-white">
                <EmptyState
                  title="No dishes found"
                  hint="Try a different search or choose another category."
                />
              </div>
            )}

          {!menuQuery.loading &&
            !menuQuery.error &&
            filteredMenu.length > 0 && (
              <>
                <div className="mb-4 mt-7 flex items-center justify-between">
                  <p className="text-sm text-[#72796f]">
                    Showing{" "}
                    <span className="font-semibold text-[#27352a]">
                      {filteredMenu.length}
                    </span>{" "}
                    {filteredMenu.length === 1 ? "dish" : "dishes"}
                  </p>

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="text-sm font-medium text-[#47775b] hover:underline"
                    >
                      Clear search
                    </button>
                  )}
                </div>

                <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredMenu.map((item, index) => (
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
              </>
            )}
        </section>

        <section className="mt-12 lg:mt-16">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_370px] xl:gap-8">
            <div className="hidden rounded-3xl border border-[#e7e1d5] bg-white p-7 lg:block">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8b6840]">
                A little note
              </p>
              <h2 className="mt-3 font-display text-2xl">
                Good choices taste even better.
              </h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-[#72796f]">
                Your order total is calculated from the menu prices on the
                server. Add your favorites and review everything before placing
                your order.
              </p>
            </div>

            <section
              id="ticket"
              aria-label="Your order"
              className="scroll-mt-28 rounded-3xl border border-[#e7e1d5] bg-white p-5 shadow-[0_12px_40px_rgba(37,48,37,0.06)] sm:p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8b6840]">
                    Checkout
                  </p>
                  <h2 className="mt-1 font-display text-2xl">Your order</h2>
                </div>
                <span
                  aria-hidden="true"
                  className="grid size-11 place-items-center rounded-2xl bg-[#f3f0e7] text-xl"
                >
                  🛍️
                </span>
              </div>

              {order && cartCount === 0 ? (
                <OrderConfirmation
                  order={order}
                  onReset={() => setOrder(null)}
                />
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
                    cartCount === 0 ||
                    menuQuery.loading ||
                    Boolean(menuQuery.error)
                  }
                  error={orderError}
                />
              )}
            </section>
          </div>
        </section>
      </div>

      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e7e1d5] bg-[#faf8f3]/95 p-3 backdrop-blur-xl lg:hidden">
          <a
            href="#ticket"
            className="mx-auto flex h-14 max-w-xl items-center justify-between rounded-2xl bg-[#173f31] px-5 text-white shadow-lg"
          >
            <span>
              <span className="block text-sm font-semibold">
                View your order · {cartCount}
              </span>
              <span className="text-xs text-white/70">
                Review and check out
              </span>
            </span>
            <span className="text-base font-semibold tabular-nums">
              {formatINR(cartTotal)} <span aria-hidden="true">→</span>
            </span>
          </a>
        </div>
      )}
    </main>
  );
}
