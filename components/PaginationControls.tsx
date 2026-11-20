"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
  className?: string;
  showWhenSinglePage?: boolean;
  onItemsPerPageChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export default function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemLabel = "offering",
  className = "",
  showWhenSinglePage = false,
  onItemsPerPageChange,
  pageSizeOptions,
}: PaginationControlsProps) {
  if (totalItems === 0) return null;
  if (totalPages <= 1 && !showWhenSinglePage) return null;

  const effectiveTotalPages = Math.max(1, totalPages);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers with ellipsis support for many pages
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (effectiveTotalPages <= maxVisible + 2) {
      for (let i = 1; i <= effectiveTotalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      const leftBound = Math.max(2, currentPage - 1);
      const rightBound = Math.min(effectiveTotalPages - 1, currentPage + 1);

      if (leftBound > 2) {
        pages.push("...");
      }

      for (let i = leftBound; i <= rightBound; i++) {
        pages.push(i);
      }

      if (rightBound < effectiveTotalPages - 1) {
        pages.push("...");
      }

      pages.push(effectiveTotalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-2 border-t border-stone-200/80 ${className}`}
    >
      <div className="flex items-center gap-3">
        <p className="text-xs text-stone-500">
          Showing <span className="font-semibold text-neutral-900">{startItem}</span>–
          <span className="font-semibold text-neutral-900">{endItem}</span> of{" "}
          <span className="font-semibold text-neutral-900">{totalItems}</span> {itemLabel}
          {totalItems === 1 ? "" : "s"}
        </p>

        {onItemsPerPageChange && pageSizeOptions && pageSizeOptions.length > 0 && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-stone-200 text-xs text-stone-500">
            <span>Per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs font-medium text-neutral-800 focus:border-neutral-900 focus:outline-none cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          aria-label="Go to previous page"
          className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft size={14} />
          <span>Previous</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`ellipsis-${idx}`} className="px-1.5 text-stone-400 text-xs select-none">
                  …
                </span>
              );
            }

            const pageNum = p as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                aria-current={isActive ? "page" : undefined}
                aria-label={`Go to page ${pageNum}`}
                className={`size-8 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-neutral-900 text-white shadow-xs font-semibold"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(effectiveTotalPages, currentPage + 1))}
          disabled={currentPage >= effectiveTotalPages}
          aria-label="Go to next page"
          className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
