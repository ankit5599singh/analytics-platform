import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MenuItem } from "@/lib/api";

interface CartCallbacks {
  onAdd?: (item: MenuItem) => void;
  onRemove?: (item: MenuItem) => void;
}

const EMPTY_CALLBACKS: CartCallbacks = {};

export function useCart(
  menu: MenuItem[],
  callbacks: CartCallbacks = EMPTY_CALLBACKS,
) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const cb = useRef(callbacks);
  useEffect(() => {
    cb.current = callbacks;
  }, [callbacks]);

  const lines = useMemo(
    () =>
      menu
        .filter((i) => (quantities[i.id] ?? 0) > 0)
        .map((i) => ({ ...i, quantity: quantities[i.id] })),
    [menu, quantities],
  );

  const add = useCallback((item: MenuItem) => {
    setQuantities((q) => ({ ...q, [item.id]: (q[item.id] ?? 0) + 1 }));
    cb.current.onAdd?.(item);
  }, []);

  const remove = useCallback((item: MenuItem) => {
    setQuantities((q) => {
      const next = { ...q };
      if ((next[item.id] ?? 0) <= 1) delete next[item.id];
      else next[item.id] -= 1;
      return next;
    });
    cb.current.onRemove?.(item);
  }, []);

  const clear = useCallback(() => setQuantities({}), []);

  return {
    lines,
    count: lines.reduce((s, l) => s + l.quantity, 0),
    total: lines.reduce((s, l) => s + l.price * l.quantity, 0),
    quantityOf: (id: string) => quantities[id] ?? 0,
    add,
    remove,
    clear,
  };
}
