import { memo } from "react";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { formatINR } from "@/lib/format";
import type { MenuItem } from "@/lib/api";

type Presentation = {
  emoji: string;
  category: string;
  description: string;
};

const PRESENTATION: Record<string, Presentation> = {
  burger: {
    emoji: "🍔",
    category: "Burgers",
    description: "A juicy classic made for serious cravings.",
  },
  chicken_burger: {
    emoji: "🍔",
    category: "Burgers",
    description: "A crispy chicken favorite with bold flavor.",
  },
  pizza: {
    emoji: "🍕",
    category: "Pizza",
    description: "A cheesy favorite for sharing—or not.",
  },
  pasta: {
    emoji: "🍝",
    category: "Pasta",
    description: "Comforting pasta for a satisfying meal.",
  },
  fries: {
    emoji: "🍟",
    category: "Sides",
    description: "Golden, crispy, and perfect on the side.",
  },
  paneer_wrap: {
    emoji: "🌯",
    category: "Wraps",
    description: "A flavorful wrap packed with paneer.",
  },
  garlic_bread: {
    emoji: "🥖",
    category: "Sides",
    description: "Warm, buttery bread with garlic goodness.",
  },
  chicken_nuggets: {
    emoji: "🍗",
    category: "Sides",
    description: "Crispy bites for your snack cravings.",
  },
  cold_coffee: {
    emoji: "🥤",
    category: "Drinks",
    description: "A chilled coffee pick-me-up.",
  },
  lemonade: {
    emoji: "🍋",
    category: "Drinks",
    description: "A refreshing citrus cooler.",
  },
  chocolate_brownie: {
    emoji: "🍫",
    category: "Desserts",
    description: "A rich chocolate treat to finish your meal.",
  },
  cheesecake: {
    emoji: "🍰",
    category: "Desserts",
    description: "A creamy, sweet little indulgence.",
  },
};

const DEFAULT_PRESENTATION: Presentation = {
  emoji: "🍽️",
  category: "Other",
  description: "A delicious pick from our kitchen.",
};

const FALLBACK_EMOJIS = ["🍽️", "🥗", "🥪", "🍜"];

function getPresentation(item: MenuItem, index = 0): Presentation {
  const knownPresentation = PRESENTATION[item.id];

  if (knownPresentation) {
    return knownPresentation;
  }

  return {
    ...DEFAULT_PRESENTATION,
    emoji: FALLBACK_EMOJIS[index % FALLBACK_EMOJIS.length],
  };
}

export function getMenuCategory(item: MenuItem): string {
  return getPresentation(item).category;
}

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
  const presentation = getPresentation(item, index);

  return (
    <li className="min-w-0">
      <article
        className={`group flex h-full flex-col overflow-hidden rounded-[1.65rem] border bg-white transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(37,48,37,0.09)] ${
          quantity > 0
            ? "border-[#47775b]/50 shadow-[0_0_0_1px_rgba(71,119,91,0.08)]"
            : "border-[#e7e1d5] shadow-[0_5px_20px_rgba(37,48,37,0.035)]"
        }`}
      >
        <div
          className="relative m-3 grid h-40 place-items-center overflow-hidden rounded-[1.2rem] bg-[#f4f0e5] sm:h-44"
          aria-hidden="true"
        >
          <div className="absolute -right-8 -top-10 size-36 rounded-full bg-[#e4d7b8]/45 transition-transform duration-300 group-hover:scale-110" />
          <div className="absolute -bottom-14 -left-6 size-36 rounded-full bg-[#dbe5d8]/70" />

          <span className="relative select-none text-7xl drop-shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
            {presentation.emoji}
          </span>

          <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/85 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#53644f] backdrop-blur">
            {presentation.category}
          </span>

          {quantity > 0 && (
            <span className="absolute right-3 top-3 rounded-full bg-[#173f31] px-3 py-1 text-xs font-semibold text-white">
              {quantity} in order
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col px-4 pb-4 pt-1 sm:px-5 sm:pb-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="min-w-0 text-base font-semibold tracking-tight text-[#27352a] sm:text-lg">
              {item.name}
            </h3>

            <span className="shrink-0 text-base font-bold tabular-nums text-[#173f31]">
              {formatINR(item.price)}
            </span>
          </div>

          <p className="mt-2 min-h-10 text-sm leading-5 text-[#7a8077]">
            {presentation.description}
          </p>

          <div className="mt-5 flex items-center justify-between gap-2 border-t border-[#eee9df] pt-4">
            <span className="text-xs text-[#8a9086]">
              {quantity > 0 ? "Added to your order" : "Made for your cravings"}
            </span>

            <QuantityStepper
              name={item.name}
              value={quantity}
              onAdd={() => onAdd(item)}
              onRemove={() => onRemove(item)}
            />
          </div>
        </div>
      </article>
    </li>
  );
});
