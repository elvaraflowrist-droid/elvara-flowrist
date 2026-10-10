import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";

interface OrdersEmptyStateProps {
  userIsAdmin?: boolean;
  adminViewMode?: "all" | "mine";
}

export default function OrdersEmptyState({
  userIsAdmin = false,
  adminViewMode = "mine",
}: OrdersEmptyStateProps) {
  return (
    <div className="py-16 text-center rounded-3xl bg-white border border-stone-200/80 p-8 max-w-md mx-auto">
      <Package className="size-12 text-stone-300 mx-auto mb-3" />
      <h3 className="font-serif text-xl text-neutral-800">
        {userIsAdmin && adminViewMode === "all" ? "No Customer Orders Yet" : "No Orders Yet"}
      </h3>
      <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto leading-relaxed">
        {userIsAdmin && adminViewMode === "all"
          ? "Completed customer purchases will appear here with recipient addresses and card notes for dispatch."
          : "You haven't placed any orders with Elvara yet. Explore our handcrafted arrangements or book an intimate masterclass."}
      </p>
      <Link
        href="/collections"
        className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-5 py-2.5 text-xs font-medium text-white hover:bg-neutral-800 transition-colors"
      >
        <span>Discover Collections</span>
        <ArrowRight size={13} />
      </Link>
    </div>
  );
}
