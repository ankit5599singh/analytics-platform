import { Field } from "@/components/ui/Field";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { DateRange } from "@/hooks/useDashboard";

const PRESETS = [
  { label: "7 days", value: 7 },
  { label: "14 days", value: 14 },
  { label: "30 days", value: 30 },
];

export function DateRangeControls({
  range,
  preset,
  onPreset,
  onCustom,
}: {
  range: DateRange | null;
  preset: number | null;
  onPreset: (days: number) => void;
  onCustom: (patch: Partial<DateRange>) => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <SegmentedControl
        label="Quick range"
        options={PRESETS}
        value={preset}
        onChange={onPreset}
      />
      <div className="flex items-end gap-2">
        <Field
          label="From"
          type="date"
          value={range?.from ?? ""}
          max={range?.to}
          onChange={(e) => onCustom({ from: e.target.value })}
        />
        <Field
          label="To"
          type="date"
          value={range?.to ?? ""}
          min={range?.from}
          onChange={(e) => onCustom({ to: e.target.value })}
        />
      </div>
    </div>
  );
}
