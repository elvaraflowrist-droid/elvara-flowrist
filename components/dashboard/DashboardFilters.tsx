import { Gift, Store, Truck, Layers } from "lucide-react";
import { OrderFilter } from "./types";

interface DashboardFiltersProps {
  activeFilter: OrderFilter;
  onChangeFilter: (filter: OrderFilter) => void;
}

const FILTER_OPTIONS: {
  id: OrderFilter;
  label: string;
  icon: typeof Layers;
}[] = [
  { id: "all", label: "All Orders", icon: Layers },
  { id: "gift", label: "With Gift Card", icon: Gift },
  { id: "pickup", label: "Self Collection", icon: Store },
  { id: "delivery", label: "Courier Delivery", icon: Truck },
];

export default function DashboardFilters({
  activeFilter,
  onChangeFilter,
}: DashboardFiltersProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap" role="tablist" aria-label="Filter orders">
      {FILTER_OPTIONS.map(({ id, label, icon: Icon }) => {
        const isActive = activeFilter === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChangeFilter(id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer border ${
              isActive
                ? "bg-neutral-900 text-white border-neutral-900 shadow-2xs"
                : "bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:text-neutral-900"
            }`}
          >
            <Icon size={13} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

