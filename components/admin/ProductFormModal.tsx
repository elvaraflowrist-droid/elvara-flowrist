"use client";

import { useState, useEffect } from "react";
import { X, Check, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ProductItem } from "./types";
import TagInput from "./TagInput";
import ImageUploadManager from "./ImageUploadManager";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductItem | null;
  onSubmit: (payload: any) => void;
  onDelete?: (id: string, title: string) => void;
  isPending: boolean;
  isDeleting?: boolean;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  product,
  onSubmit,
  onDelete,
  isPending,
  isDeleting = false,
}: ProductFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [assetType, setAssetType] = useState("bouquets");
  const [aspect, setAspect] = useState<"horizontal" | "vertical">("horizontal");
  const [tags, setTags] = useState<string[]>([]);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (product) {
      setTitle(product.title || "");
      setDescription(product.description || "");
      setPrice(product.price || "");
      setAssetType(product.assetType || "bouquets");
      setAspect(product.aspect || "horizontal");
      setTags(Array.isArray(product.tags) ? product.tags : []);
      setThumbnails(product.thumbnails || []);
    } else {
      setTitle("");
      setDescription("");
      setPrice("");
      setAssetType("bouquets");
      setAspect("horizontal");
      setTags([]);
      setThumbnails([]);
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      price: price.trim() || null,
      assetType,
      aspect,
      activeThumbnailIndex: 0,
      tags,
      thumbnails,
      references: [],
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs"
      />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-stone-100 z-10">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        <h2 className="font-serif text-2xl text-neutral-900 mb-1">
          {product ? "Edit Floral Offering" : "New Studio Offering"}
        </h2>
        <p className="text-xs text-neutral-500 mb-6">
          Published creations appear immediately on the storefront with instant checkout.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Design Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Autumn Blossom Peony Symphony"
              className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Price (INR / ₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="85.00"
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Category
              </label>
              <select
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
                className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-xs sm:text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none bg-white"
              >
                <option value="bouquets">Bouquets</option>
                <option value="collections">Vessel Collections</option>
                <option value="workshops">Workshops</option>
                <option value="gifts">Botanical Gifts</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Orientation
              </label>
              <select
                value={aspect}
                onChange={(e) => setAspect(e.target.value as any)}
                className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-xs sm:text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none bg-white"
              >
                <option value="horizontal">Horizontal (4:3)</option>
                <option value="vertical">Vertical (3:4)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Description & Story
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Botanical varieties, scent notes, vessel artisan, or masterclass details..."
              className="w-full rounded-xl border border-stone-200 p-3 text-xs sm:text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
          </div>

          {/* Extracted TagInput component */}
          <TagInput tags={tags} onChange={setTags} />

          {/* Extracted ImageUploadManager component */}
          <ImageUploadManager
            thumbnails={thumbnails}
            onChange={setThumbnails}
            onUploadingChange={setUploadingImage}
          />

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-between border-t border-stone-100">
            {product?.id && onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(product.id, product.title)}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Delete Offering</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-stone-200 px-5 py-2.5 text-xs font-medium text-neutral-700 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || uploadingImage}
                className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-2.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50 transition-all shadow-sm cursor-pointer"
              >
                {isPending ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Check size={13} />
                )}
                <span>{product ? "Save Changes" : "Publish to Store"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
