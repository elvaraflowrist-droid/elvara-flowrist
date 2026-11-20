"use client";

import { Trash2, Loader2 } from "lucide-react";
import { DeleteConfirmItem } from "./types";

interface DeleteConfirmModalProps {
  item: DeleteConfirmItem | null;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export default function DeleteConfirmModal({
  item,
  onClose,
  onConfirm,
  isPending,
}: DeleteConfirmModalProps) {
  if (!item) return null;

  const isTestimonial = item.type === "testimonial";
  const isBulk = item.type === "bulk-product";
  const bulkCount = item.count || item.ids?.length || 0;

  const titleText = isBulk
    ? `Delete ${bulkCount} Botanical Offerings?`
    : isTestimonial
    ? "Delete Client Testimonial?"
    : "Delete Botanical Offering?";

  const confirmBtnText = isBulk
    ? `Delete ${bulkCount} Offerings`
    : isTestimonial
    ? "Delete Testimonial"
    : "Delete Offering";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="size-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <Trash2 size={22} />
        </div>
        <h3 className="font-serif text-xl text-neutral-900">
          {titleText}
        </h3>
        <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
          {isBulk ? (
            <>
              Are you sure you want to permanently remove{" "}
              <span className="font-semibold text-neutral-800">{bulkCount} selected offerings</span>? This action cannot be undone.
            </>
          ) : (
            <>
              Are you sure you want to permanently remove{" "}
              <span className="font-semibold text-neutral-800">&ldquo;{item.title}&rdquo;</span>? This action cannot be undone.
            </>
          )}
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-full px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="rounded-full bg-rose-600 px-5 py-2 text-xs font-medium text-white hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={13} />
                <span>{confirmBtnText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
