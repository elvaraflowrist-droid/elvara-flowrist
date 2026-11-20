"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

import {
  AdminTab,
  ProductItem,
  TestimonialItem,
  DeleteConfirmItem,
} from "@/components/admin/types";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminStatsCards from "@/components/admin/AdminStatsCards";
import AdminTabs from "@/components/admin/AdminTabs";
import AdminProductsTable from "@/components/admin/AdminProductsTable";
import AdminTestimonialsTable from "@/components/admin/AdminTestimonialsTable";
import AdminSettingsForm from "@/components/admin/AdminSettingsForm";
import ProductFormModal from "@/components/admin/ProductFormModal";
import TestimonialFormModal from "@/components/admin/TestimonialFormModal";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import AdminUnauthorized from "@/components/admin/AdminUnauthorized";

export default function AdminPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const queryClient = useQueryClient();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<AdminTab>("products");

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialItem | null>(null);

  const [deleteConfirmItem, setDeleteConfirmItem] = useState<DeleteConfirmItem | null>(null);

  // Settings state
  const [settingDeliveryFee, setSettingDeliveryFee] = useState("150.00");
  const [settingGiftPrice, setSettingGiftPrice] = useState("100.00");
  const [settingPickupAddress, setSettingPickupAddress] = useState(
    "Elvara Floral Atelier, Road No. 36, Jubilee Hills, Hyderabad 500033"
  );
  const [settingPickupHours, setSettingPickupHours] = useState(
    "Monday – Sunday, 09:00 AM – 08:00 PM"
  );
  const [savingSettings, setSavingSettings] = useState(false);

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    enabled: !!session?.user?.isAdmin,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<ProductItem[]>({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const res = await fetch("/api/products?all=true");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data || [];
    },
    enabled: !!session?.user?.isAdmin,
  });

  const { data: testimonials = [], isLoading: testimonialsLoading } = useQuery<TestimonialItem[]>({
    queryKey: ["admin-testimonials"],
    queryFn: async () => {
      const res = await fetch("/api/testimonials?all=true");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data || [];
    },
    enabled: !!session?.user?.isAdmin,
  });

  const { data: systemSettings } = useQuery({
    queryKey: ["admin-system-settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    enabled: !!session?.user?.isAdmin,
  });

  useEffect(() => {
    if (systemSettings) {
      if (systemSettings.delivery_fee) setSettingDeliveryFee(systemSettings.delivery_fee);
      if (systemSettings.gift_price) setSettingGiftPrice(systemSettings.gift_price);
      if (systemSettings.pickup_address) setSettingPickupAddress(systemSettings.pickup_address);
      if (systemSettings.pickup_hours) setSettingPickupHours(systemSettings.pickup_hours);
    }
  }, [systemSettings]);

  // Query Invalidation Helper
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["admin-system-settings"] });
    router.refresh();
  };

  // Product Mutations
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to create product");
      return json.data;
    },
    onSuccess: () => {
      toast.success("New product published to catalog!");
      invalidateAll();
      setModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create product");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to update product");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Product updated successfully!");
      invalidateAll();
      setModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update product");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to delete product");
      return json;
    },
    onSuccess: () => {
      toast.success("Product removed from catalog");
      invalidateAll();
      setModalOpen(false);
      setDeleteConfirmItem(null);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete product");
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to bulk delete products");
      return json;
    },
    onSuccess: (data) => {
      toast.success(
        `Successfully removed ${data?.count || selectedProductIds.length} offering(s) from catalog`
      );
      setSelectedProductIds([]);
      invalidateAll();
      setDeleteConfirmItem(null);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to bulk delete offerings");
    },
  });

  // Testimonial Mutations
  const createTestimonialMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to create testimonial");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Testimonial published!");
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      router.refresh();
      setTestimonialModalOpen(false);
    },
    onError: (err: any) => toast.error(err?.message || "Failed to create testimonial"),
  });

  const updateTestimonialMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to update testimonial");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Testimonial updated!");
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      router.refresh();
      setTestimonialModalOpen(false);
    },
    onError: (err: any) => toast.error(err?.message || "Failed to update testimonial"),
  });

  const deleteTestimonialMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to delete testimonial");
      return json;
    },
    onSuccess: () => {
      toast.success("Testimonial deleted!");
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      router.refresh();
      setDeleteConfirmItem(null);
    },
    onError: (err: any) => toast.error(err?.message || "Failed to delete testimonial"),
  });

  // Save Store Fulfillment Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            delivery_fee: settingDeliveryFee,
            gift_price: settingGiftPrice,
            pickup_address: settingPickupAddress,
            pickup_hours: settingPickupHours,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Store pricing and fulfillment settings updated!");
        queryClient.invalidateQueries({ queryKey: ["admin-system-settings"] });
      } else {
        toast.error(json.error || "Failed to update settings");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setSavingSettings(false);
    }
  };

  // Product modal handlers
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleOpenEditProduct = (product: ProductItem) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleProductSubmit = (payload: any) => {
    if (editingProduct?.id) {
      updateMutation.mutate({ id: editingProduct.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // Testimonial modal handlers
  const handleOpenCreateTestimonial = () => {
    setEditingTestimonial(null);
    setTestimonialModalOpen(true);
  };

  const handleOpenEditTestimonial = (item: TestimonialItem) => {
    setEditingTestimonial(item);
    setTestimonialModalOpen(true);
  };

  const handleTestimonialSubmit = (payload: any) => {
    if (editingTestimonial?.id) {
      updateTestimonialMutation.mutate({ id: editingTestimonial.id, payload });
    } else {
      createTestimonialMutation.mutate(payload);
    }
  };

  // Delete handlers
  const handleDeleteProduct = (id: string, title: string) => {
    setDeleteConfirmItem({ id, title, type: "product" });
  };

  const handleDeleteTestimonial = (id: string, author: string) => {
    setDeleteConfirmItem({ id, title: `Testimonial by ${author}`, type: "testimonial" });
  };

  // Bulk product selection handlers
  const handleToggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllProducts = () => {
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map((p) => p.id));
    }
  };

  const handleClearProductSelection = () => {
    setSelectedProductIds([]);
  };

  const handleTriggerBulkDelete = () => {
    if (selectedProductIds.length === 0) return;
    setDeleteConfirmItem({
      id: "bulk",
      title: `${selectedProductIds.length} offerings`,
      type: "bulk-product",
      count: selectedProductIds.length,
      ids: selectedProductIds,
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmItem) return;
    if (deleteConfirmItem.type === "bulk-product") {
      bulkDeleteMutation.mutate(deleteConfirmItem.ids || selectedProductIds);
    } else if (deleteConfirmItem.type === "testimonial") {
      deleteTestimonialMutation.mutate(deleteConfirmItem.id);
    } else {
      deleteMutation.mutate(deleteConfirmItem.id);
    }
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen py-32 flex flex-col items-center justify-center text-neutral-500">
        <Loader2 className="size-8 animate-spin text-stone-600 mb-3" />
        <p className="text-sm">Verifying atelier credentials...</p>
      </div>
    );
  }

  if (!session?.user || !session.user.isAdmin) {
    return <AdminUnauthorized />;
  }

  return (
    <main className="min-h-screen pb-24 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Tab Action */}
        <AdminHeader
          activeTab={activeTab}
          onCreateProduct={handleOpenCreateProduct}
          onCreateTestimonial={handleOpenCreateTestimonial}
          savingSettings={savingSettings}
        />

        {/* Metrics Cards */}
        <AdminStatsCards stats={stats} isLoading={statsLoading} />

        {/* Tab Navigation */}
        <AdminTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          productCount={products.length}
          testimonialCount={testimonials.length}
        />

        {/* Active Tab View */}
        {activeTab === "products" && (
          <AdminProductsTable
            products={products}
            isLoading={productsLoading}
            onEdit={handleOpenEditProduct}
            onDelete={handleDeleteProduct}
            isDeleting={deleteMutation.isPending || bulkDeleteMutation.isPending}
            selectedIds={selectedProductIds}
            onToggleSelect={handleToggleSelectProduct}
            onSelectAll={handleSelectAllProducts}
            onClearSelection={handleClearProductSelection}
            onBulkDelete={handleTriggerBulkDelete}
          />
        )}

        {activeTab === "testimonials" && (
          <AdminTestimonialsTable
            testimonials={testimonials}
            isLoading={testimonialsLoading}
            onEdit={handleOpenEditTestimonial}
            onDelete={handleDeleteTestimonial}
            onAddNew={handleOpenCreateTestimonial}
            isDeleting={deleteTestimonialMutation.isPending}
          />
        )}

        {activeTab === "settings" && (
          <AdminSettingsForm
            deliveryFee={settingDeliveryFee}
            onDeliveryFeeChange={setSettingDeliveryFee}
            giftPrice={settingGiftPrice}
            onGiftPriceChange={setSettingGiftPrice}
            pickupAddress={settingPickupAddress}
            onPickupAddressChange={setSettingPickupAddress}
            pickupHours={settingPickupHours}
            onPickupHoursChange={setSettingPickupHours}
            onSubmit={handleSaveSettings}
            isSaving={savingSettings}
          />
        )}
      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={editingProduct}
        onSubmit={handleProductSubmit}
        onDelete={handleDeleteProduct}
        isPending={createMutation.isPending || updateMutation.isPending}
        isDeleting={deleteMutation.isPending}
      />

      {/* Testimonial Form Modal */}
      <TestimonialFormModal
        isOpen={testimonialModalOpen}
        onClose={() => setTestimonialModalOpen(false)}
        testimonial={editingTestimonial}
        onSubmit={handleTestimonialSubmit}
        isPending={
          createTestimonialMutation.isPending || updateTestimonialMutation.isPending
        }
        defaultOrderIndex={testimonials.length + 1}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        item={deleteConfirmItem}
        onClose={() => setDeleteConfirmItem(null)}
        onConfirm={handleConfirmDelete}
        isPending={
          deleteMutation.isPending ||
          deleteTestimonialMutation.isPending ||
          bulkDeleteMutation.isPending
        }
      />
    </main>
  );
}
