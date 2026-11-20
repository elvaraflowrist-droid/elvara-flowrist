"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Edit3, Trash2 } from "lucide-react";
import { formatPrice, formatDate, getActiveThumbnail } from "@/lib/utils";
import PaginationControls from "@/components/PaginationControls";
import { ProductItem } from "./types";

const ITEMS_PER_PAGE = 10;

interface AdminProductsTableProps {
  products: ProductItem[];
  isLoading: boolean;
  onEdit: (product: ProductItem) => void;
  onDelete: (id: string, title: string) => void;
  isDeleting?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  onBulkDelete?: () => void;
}

export default function AdminProductsTable({
  products,
  isLoading,
  onEdit,
  onDelete,
  isDeleting = false,
  selectedIds = [],
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onBulkDelete,
}: AdminProductsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  const selectedCount = selectedIds.length;
  const allSelected = products.length > 0 && selectedCount === products.length;
  const isIndeterminate = selectedCount > 0 && selectedCount < products.length;

  const totalPages = Math.max(1, Math.ceil(products.length / itemsPerPage));

  // If items get deleted and current page is out of bounds, step back
  useEffect(() => {
    if (currentPage > 1 && currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  // Paginated products slice
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return products.slice(start, start + itemsPerPage);
  }, [products, currentPage, itemsPerPage]);

  return (
    <div className="rounded-3xl bg-white border border-stone-200/80 shadow-xs overflow-hidden">
      {/* Header Bar: Dynamic between default and bulk action mode */}
      {selectedCount > 0 ? (
        <div className="p-4 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/80 transition-colors">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center size-6 rounded-full bg-neutral-900 text-white text-xs font-semibold">
              {selectedCount}
            </span>
            <span className="text-xs sm:text-sm font-medium text-neutral-900">
              {selectedCount === 1 ? "1 offering selected" : `${selectedCount} offerings selected`}
            </span>
            {onClearSelection && (
              <button
                type="button"
                onClick={onClearSelection}
                className="text-xs text-stone-500 hover:text-neutral-900 underline underline-offset-2 ml-1 cursor-pointer transition-colors"
              >
                Deselect all
              </button>
            )}
          </div>

          {onBulkDelete && (
            <button
              type="button"
              onClick={onBulkDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-xs font-medium text-white hover:bg-rose-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Trash2 size={13} />
              <span>Delete Selected ({selectedCount})</span>
            </button>
          )}
        </div>
      ) : (
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-serif text-xl text-neutral-900">All Catalog Offerings</h3>
          <span className="text-xs text-neutral-500 font-medium">
            {products.length} products listed
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-700">
            <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-neutral-500 border-b border-stone-100">
              <tr>
                <th className="py-3.5 pl-6 pr-2 w-10">
                  <div className="size-4 bg-stone-200 rounded" />
                </th>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Views</th>
                <th className="py-3.5 px-4">Published</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 pl-6 pr-2">
                    <div className="size-4 bg-stone-200 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-xl bg-stone-200 shrink-0" />
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="h-4 w-40 bg-stone-200 rounded-md" />
                        <div className="h-3 w-28 bg-stone-100 rounded-md" />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-5 w-20 bg-stone-100 rounded-full" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-16 bg-stone-200 rounded-md" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-12 bg-stone-100 rounded-md" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-3.5 w-20 bg-stone-100 rounded-md" />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-7 w-12 rounded-full bg-stone-100" />
                      <div className="h-7 w-14 rounded-full bg-stone-100" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center text-neutral-500">
          <p className="font-serif text-lg">No products found</p>
          <p className="text-xs mt-1">
            Click &ldquo;Create New Offering&rdquo; above to publish your first bouquet.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-700">
              <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-neutral-500 border-b border-stone-100">
                <tr>
                  <th className="py-3.5 pl-6 pr-2 w-10">
                    <input
                      ref={selectAllCheckboxRef}
                      type="checkbox"
                      checked={allSelected}
                      onChange={onSelectAll}
                      aria-label="Select all offerings"
                      className="size-4 rounded border-stone-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer accent-neutral-900"
                    />
                  </th>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Views</th>
                  <th className="py-3.5 px-4">Published</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {paginatedProducts.map((item) => {
                  const thumb = getActiveThumbnail(item);
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isSelected ? "bg-stone-100/70 hover:bg-stone-100" : "hover:bg-stone-50/60"
                      }`}
                    >
                      <td className="py-4 pl-6 pr-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect?.(item.id)}
                          aria-label={`Select ${item.title}`}
                          className="size-4 rounded border-stone-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer accent-neutral-900"
                        />
                      </td>
                      <td className="py-4 px-4 flex items-center gap-3">
                        <div className="relative size-12 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-100">
                          <Image
                            src={thumb}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <Link
                            href={`/products/${item.id}`}
                            className="font-medium text-neutral-900 hover:underline line-clamp-1 text-sm"
                          >
                            {item.title}
                          </Link>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {item.id}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 uppercase text-[10px] font-semibold tracking-wider text-stone-600">
                        {item.assetType}
                      </td>
                      <td className="py-4 px-4 font-serif text-sm font-medium text-neutral-900">
                        {formatPrice(item.price)}
                      </td>
                      <td className="py-4 px-4 text-stone-600">
                        {item.views ?? 0}
                      </td>
                      <td className="py-4 px-4 text-stone-500">
                        {item.createdAt ? formatDate(item.createdAt) : "—"}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex flex-wrap items-center justify-end gap-2">
                          <button
                            onClick={() => onEdit(item)}
                            className="inline-flex items-center gap-1 rounded-full border border-stone-200 px-3 py-1.5 text-[11px] font-medium text-neutral-700 hover:bg-stone-100 transition-colors cursor-pointer"
                          >
                            <Edit3 size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => onDelete(item.id, item.title)}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1.5 text-[11px] font-medium text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Admin Table Pagination Controls */}
          {products.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-stone-100 bg-stone-50/40">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={products.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                itemLabel="offering"
                showWhenSinglePage={true}
                onItemsPerPageChange={(size) => {
                  setItemsPerPage(size);
                  setCurrentPage(1);
                }}
                pageSizeOptions={[5, 10, 20]}
                className="pt-0 pb-0 border-t-0"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
