import { ChevronLeft, ChevronRight } from "lucide-react";

interface DashboardPaginationProps {
  page: number;
  totalPages: number;
  totalOrders: number;
  onPageChange: (nextPage: number) => void;
}

export default function DashboardPagination({
  page,
  totalPages,
  totalOrders,
  onPageChange,
}: DashboardPaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = Array.from({ length: totalPages }, (_, idx) => idx + 1);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-200/80">
      <p className="text-xs text-stone-500">
        Page <span className="font-semibold text-neutral-900">{page}</span> of{" "}
        <span className="font-semibold text-neutral-900">{totalPages}</span> ({totalOrders}{" "}
        {totalOrders === 1 ? "order" : "orders"})
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft size={14} />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onPageChange(num)}
              className={`size-8 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                num === page
                  ? "bg-neutral-900 text-white"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              {num}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

