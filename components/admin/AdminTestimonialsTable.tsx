"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Edit3, Trash2, Star } from "lucide-react";
import PaginationControls from "@/components/PaginationControls";
import { TestimonialItem } from "./types";

interface AdminTestimonialsTableProps {
  testimonials: TestimonialItem[];
  isLoading: boolean;
  onEdit: (item: TestimonialItem) => void;
  onDelete: (id: string, author: string) => void;
  onAddNew: () => void;
  isDeleting?: boolean;
}

export default function AdminTestimonialsTable({
  testimonials,
  isLoading,
  onEdit,
  onDelete,
  onAddNew,
  isDeleting = false,
}: AdminTestimonialsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const totalPages = Math.max(1, Math.ceil(testimonials.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > 1 && currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [currentPage, totalPages]);

  const paginatedTestimonials = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return testimonials.slice(start, start + itemsPerPage);
  }, [testimonials, currentPage, itemsPerPage]);

  return (
    <div className="rounded-3xl bg-white border border-stone-200/80 shadow-xs overflow-hidden">
      <div className="p-6 border-b border-stone-100 flex items-center justify-between">
        <div>
          <h3 className="font-serif text-xl text-neutral-900">Patron Stories & Reviews</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage reviews displayed on the boutique homepage
          </p>
        </div>
        <button
          onClick={onAddNew}
          className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
        >
          <Plus size={14} />
          <span>Add Testimonial</span>
        </button>
      </div>

      {isLoading ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-700">
            <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-neutral-500 border-b border-stone-100">
              <tr>
                <th className="py-3.5 px-6">Client / Author</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Quote & Feedback</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Order</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {[1, 2, 3, 4].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-6">
                    <div className="h-4 w-32 bg-stone-200 rounded-md mb-1.5" />
                    <div className="h-3 w-20 bg-stone-100 rounded-md" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <div key={s} className="size-3.5 rounded-full bg-amber-100" />
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-64 bg-stone-100 rounded-md mb-1.5" />
                    <div className="h-3 w-40 bg-stone-100 rounded-md" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-5 w-20 bg-stone-100 rounded-full" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-3.5 w-8 bg-stone-100 rounded-md" />
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
      ) : testimonials.length === 0 ? (
        <div className="py-16 text-center text-neutral-500">
          <p className="font-serif text-lg">No testimonials yet</p>
          <p className="text-xs mt-1">
            Click &ldquo;Add Testimonial&rdquo; to publish your first patron experience.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-700">
              <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-neutral-500 border-b border-stone-100">
                <tr>
                  <th className="py-3.5 px-6">Client / Author</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Quote & Feedback</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {paginatedTestimonials.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-serif font-medium text-neutral-900 text-sm">{item.author}</p>
                      {item.location && (
                        <p className="text-[11px] text-stone-500">{item.location}</p>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[...Array(item.rating || 5)].map((_, s) => (
                          <Star key={s} size={12} fill="currentColor" />
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 max-w-sm">
                      <p className="line-clamp-2 italic text-neutral-700">
                        &ldquo;{item.quote}&rdquo;
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          item.isApproved
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-stone-100 text-stone-600 border border-stone-200"
                        }`}
                      >
                        {item.isApproved ? "Approved" : "Draft / Hidden"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-stone-500 font-mono text-[11px]">
                      #{item.orderIndex ?? 0}
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
                          onClick={() => onDelete(item.id, item.author)}
                          disabled={isDeleting}
                          className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1.5 text-[11px] font-medium text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Testimonials Pagination Controls */}
          {testimonials.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-stone-100 bg-stone-50/40">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={testimonials.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                itemLabel="testimonial"
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
