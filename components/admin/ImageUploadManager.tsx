"use client";

import { useState } from "react";
import { UploadCloud, Plus, Loader2, X } from "lucide-react";
import { getUploadUrlAction } from "@/app/admin/actions";
import { getMediaUrl } from "@/lib/utils";
import { toast } from "sonner";

interface ImageUploadManagerProps {
  thumbnails: string[];
  onChange: (thumbnails: string[]) => void;
  onUploadingChange?: (isUploading: boolean) => void;
}

export default function ImageUploadManager({
  thumbnails,
  onChange,
  onUploadingChange,
}: ImageUploadManagerProps) {
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const setUploading = (val: boolean) => {
    setUploadingImage(val);
    onUploadingChange?.(val);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { uploadUrl, fileKey } = await getUploadUrlAction(
        file.name,
        file.type || "image/jpeg",
        true
      );

      const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "image/jpeg" },
        body: file,
      });

      if (!res.ok) {
        throw new Error("Direct upload to Cloudflare R2 storage failed");
      }

      onChange([...thumbnails, fileKey]);
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Image upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    onChange([...thumbnails, trimmed]);
    setImageUrlInput("");
    toast.success("Image URL added to offering!");
  };

  const handleRemoveImage = (indexToRemove: number) => {
    onChange(thumbnails.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="rounded-2xl border border-stone-200/90 bg-stone-50/60 p-4 space-y-3.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-neutral-800 flex items-center gap-1.5">
          <UploadCloud size={15} className="text-stone-600" />
          <span>Offering Images</span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* File Upload Button */}
        <label className="cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-white border border-stone-300 px-4 py-2.5 text-xs font-medium text-neutral-800 hover:bg-stone-50 transition-colors shadow-2xs">
          {uploadingImage ? (
            <Loader2 size={13} className="animate-spin text-stone-600" />
          ) : (
            <Plus size={13} className="text-stone-600" />
          )}
          <span>{uploadingImage ? "Uploading image..." : "Upload from Device"}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploadingImage}
            className="hidden"
          />
        </label>

        {/* Image URL Paste */}
        <div className="flex items-center gap-1.5">
          <input
            type="url"
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddImageUrl();
              }
            }}
            placeholder="Or paste web image URL..."
            className="flex-1 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddImageUrl}
            className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-stone-50 transition-colors cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>

      {/* Thumbnails preview cards */}
      {thumbnails.length > 0 ? (
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] text-stone-500 font-medium">
            Attached Images ({thumbnails.length}):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {thumbnails.map((t, idx) => (
              <div
                key={idx}
                className="relative group rounded-xl overflow-hidden border border-stone-200 bg-white shadow-2xs aspect-4/3 flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getMediaUrl(t)}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <span className="absolute bottom-1 left-1.5 text-[9px] bg-neutral-900/70 text-white px-1.5 py-0.5 rounded-sm backdrop-blur-xs truncate max-w-[80%]">
                  {idx === 0 ? "Cover" : `#${idx + 1}`}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 size-5 rounded-full bg-neutral-900/80 hover:bg-neutral-950 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-stone-500 italic">
          Upload a file from your computer or paste any image link (e.g. Unsplash).
        </p>
      )}
    </div>
  );
}
