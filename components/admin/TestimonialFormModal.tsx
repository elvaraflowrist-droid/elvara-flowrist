"use client";

import { useState, useEffect } from "react";
import { X, Star, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TestimonialItem } from "./types";

interface TestimonialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  testimonial: TestimonialItem | null;
  onSubmit: (payload: any) => void;
  isPending: boolean;
  defaultOrderIndex?: number;
}

export default function TestimonialFormModal({
  isOpen,
  onClose,
  testimonial,
  onSubmit,
  isPending,
  defaultOrderIndex = 0,
}: TestimonialFormModalProps) {
  const [author, setAuthor] = useState("");
  const [location, setLocation] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);
  const [isApproved, setIsApproved] = useState(true);
  const [orderIndex, setOrderIndex] = useState(0);

  useEffect(() => {
    if (testimonial) {
      setAuthor(testimonial.author || "");
      setLocation(testimonial.location || "");
      setQuote(testimonial.quote || "");
      setRating(testimonial.rating || 5);
      setIsApproved(testimonial.isApproved ?? true);
      setOrderIndex(testimonial.orderIndex || 0);
    } else {
      setAuthor("");
      setLocation("");
      setQuote("");
      setRating(5);
      setIsApproved(true);
      setOrderIndex(defaultOrderIndex);
    }
  }, [testimonial, defaultOrderIndex, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !quote.trim()) {
      toast.error("Author name and testimonial quote are required");
      return;
    }

    const payload = {
      author: author.trim(),
      location: location.trim() || null,
      quote: quote.trim(),
      rating,
      isApproved,
      orderIndex: Number(orderIndex) || 0,
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs"
      />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-stone-200 z-10 overflow-y-auto max-h-[90vh]"
      >
        <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-6">
          <div>
            <h3 className="font-serif text-2xl text-neutral-900">
              {testimonial ? "Edit Client Testimonial" : "New Client Testimonial"}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Feature memorable celebrations and authentic feedback
            </p>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Author / Client Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Elena & Marcus or Claire D."
              className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Location / Event Context
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Jubilee Hills, Hyderabad or Wedding Celebration"
              className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Star Rating
            </label>
            <div className="flex items-center gap-1.5 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    size={22}
                    className={star <= rating ? "text-amber-500 fill-amber-500" : "text-stone-300"}
                  />
                </button>
              ))}
              <span className="text-xs text-stone-500 ml-2 font-medium">{rating} of 5 Stars</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Quote / Client Story <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Write the patron's testimonial or celebration story..."
              className="w-full rounded-xl border border-stone-200 p-3 text-xs sm:text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Display Order Index
              </label>
              <input
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(parseInt(e.target.value, 10) || 0)}
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="testApproved"
                checked={isApproved}
                onChange={(e) => setIsApproved(e.target.checked)}
                className="size-4 rounded text-neutral-900 border-stone-300 focus:ring-neutral-900 cursor-pointer"
              />
              <label htmlFor="testApproved" className="text-xs font-medium text-neutral-800 cursor-pointer">
                Publish on Homepage
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-stone-200 px-5 py-2.5 text-xs font-medium text-neutral-700 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-2.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50 transition-all shadow-sm cursor-pointer"
            >
              {isPending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Check size={13} />
              )}
              <span>{testimonial ? "Save Changes" : "Publish Testimonial"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
