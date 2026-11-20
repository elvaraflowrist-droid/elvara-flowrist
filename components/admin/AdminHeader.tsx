"use client";

import { Plus, Check, Loader2 } from "lucide-react";
import { AdminTab } from "./types";

interface AdminHeaderProps {
  activeTab: AdminTab;
  onCreateProduct: () => void;
  onCreateTestimonial: () => void;
  savingSettings?: boolean;
}

export default function AdminHeader({
  activeTab,
  onCreateProduct,
  onCreateTestimonial,
  savingSettings = false,
}: AdminHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-stone-200/80 gap-4 mb-8">
      <div>
        <h2 className="font-serif text-2xl text-neutral-900">
          Studio Catalog CMS
        </h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Curate floral designs, update offerings, and inspect shop analytics
        </p>
      </div>

      {activeTab === "products" && (
        <button
          onClick={onCreateProduct}
          className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-xs font-medium text-white hover:bg-neutral-800 transition-all shadow-md self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} />
          <span>Create New Offering</span>
        </button>
      )}

      {activeTab === "testimonials" && (
        <button
          onClick={onCreateTestimonial}
          className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-xs font-medium text-white hover:bg-neutral-800 transition-all shadow-md self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} />
          <span>Add New Testimonial</span>
        </button>
      )}

      {activeTab === "settings" && (
        <button
          type="submit"
          form="admin-settings-form"
          disabled={savingSettings}
          className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-xs font-medium text-white hover:bg-neutral-800 transition-all shadow-md self-start sm:self-auto cursor-pointer disabled:opacity-50"
        >
          {savingSettings ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          <span>Save Fulfillment Settings</span>
        </button>
      )}
    </div>
  );
}
