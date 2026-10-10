"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Package, 
  ShoppingBag, 
  Eye, 
  Calendar, 
  Plus, 
  UploadCloud, 
  X, 
  Loader2, 
  Edit3, 
  Check, 
  ExternalLink,
  Trash2,
  MessageSquare,
  Star,
  Truck,
  Gift,
  Sliders,
  Store
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { formatPrice, formatDate, formatViews, getActiveThumbnail } from "@/lib/utils";
import RelaxingLoader from "@/components/RelaxingLoader";
import { 
  getShopStatsAction, 
  getProductsAction, 
  getUploadUrlAction, 
  createProductAction, 
  updateProductAction, 
  deleteProductAction,
  getAdminTestimonialsAction,
  createTestimonialAction,
  updateTestimonialAction,
  deleteTestimonialAction
} from "@/app/admin/actions";
import { toast } from "sonner";
import { useEffect } from "react";

export default function AdminPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const queryClient = useQueryClient();

  // Navigation Tabs: Products, Testimonials, Settings
  const [activeTab, setActiveTab] = useState<"products" | "testimonials" | "settings">("products");

  // Product Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{ id: string; title: string; type?: "product" | "testimonial" } | null>(null);

  // Testimonial Modal State
  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<any | null>(null);
  const [testAuthor, setTestAuthor] = useState("");
  const [testLocation, setTestLocation] = useState("");
  const [testQuote, setTestQuote] = useState("");
  const [testRating, setTestRating] = useState(5);
  const [testApproved, setTestApproved] = useState(true);
  const [testOrderIndex, setTestOrderIndex] = useState(0);

  // Product Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [assetType, setAssetType] = useState("bouquets");
  const [aspect, setAspect] = useState<"horizontal" | "vertical">("horizontal");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInputValue, setTagInputValue] = useState("");
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch metrics stats via REST API
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    enabled: !!session?.user?.isAdmin,
  });

  // Fetch admin products list via REST API
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const res = await fetch("/api/products?limit=100");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data || [];
    },
    enabled: !!session?.user?.isAdmin,
  });

  // Testimonials Query
  const { data: testimonials = [], isLoading: testimonialsLoading } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => {
      const res = await fetch("/api/testimonials?all=true");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data || [];
    },
    enabled: !!session?.user?.isAdmin,
  });

  // System Settings State & Query
  const [settingDeliveryFee, setSettingDeliveryFee] = useState("150.00");
  const [settingGiftPrice, setSettingGiftPrice] = useState("100.00");
  const [settingPickupAddress, setSettingPickupAddress] = useState("Elvara Floral Atelier, Road No. 36, Jubilee Hills, Hyderabad 500033");
  const [settingPickupHours, setSettingPickupHours] = useState("Monday – Sunday, 09:00 AM – 08:00 PM");
  const [savingSettings, setSavingSettings] = useState(false);

  const { data: systemSettings, isLoading: settingsLoading } = useQuery({
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

  // TanStack Query Mutations for Create, Update, Delete via REST API
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["admin-system-settings"] });
    router.refresh();
  };

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

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirmItem({ id, title: name, type: "product" });
  };

  const handleDeleteTestimonial = (id: string, author: string) => {
    setDeleteConfirmItem({ id, title: `Testimonial by ${author}`, type: "testimonial" });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmItem) return;
    if (deleteConfirmItem.type === "testimonial") {
      deleteTestimonialMutation.mutate(deleteConfirmItem.id);
    } else {
      deleteMutation.mutate(deleteConfirmItem.id);
    }
  };

  // Upload image: prefers local /api/upload (0 credit cards/0 cloud setup) with R2 fallback
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // 1. Try local upload first (zero cloud setup / zero credit card required)
      const formData = new FormData();
      formData.append("file", file);

      const localRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (localRes.ok) {
        const data = await localRes.json();
        setThumbnails((prev) => [...prev, data.url]);
        toast.success("Image uploaded successfully!");
        return;
      }

      // 2. Fallback to Cloudflare R2 if configured
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
        throw new Error("Direct upload to storage failed");
      }

      setThumbnails((prev) => [...prev, fileKey]);
      toast.success("Image uploaded to R2 successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Image upload failed");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    setThumbnails((prev) => [...prev, trimmed]);
    setImageUrlInput("");
    toast.success("Image URL added to offering!");
  };

  const handleAddTag = (tagToAdd: string) => {
    const clean = tagToAdd.trim().toLowerCase().replace(/^#+/, "");
    if (clean && !tags.includes(clean)) {
      setTags((prev) => [...prev, clean]);
    }
    setTagInputValue("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (tagInputValue.trim()) {
        handleAddTag(tagInputValue);
      }
    } else if (e.key === "Backspace" && !tagInputValue && tags.length > 0) {
      e.preventDefault();
      setTags((prev) => prev.slice(0, prev.length - 1));
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setTitle("");
    setDescription("");
    setPrice("");
    setAssetType("bouquets");
    setAspect("horizontal");
    setTags([]);
    setTagInputValue("");
    setThumbnails([]);
    setModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setTitle(p.title || "");
    setDescription(p.description || "");
    setPrice(p.price || "");
    setAssetType(p.assetType || "bouquets");
    setAspect(p.aspect || "horizontal");
    setTags(Array.isArray(p.tags) ? p.tags : []);
    setTagInputValue("");
    setThumbnails(p.thumbnails || []);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    // Capture any unsaved text currently in the input field
    const finalTags = [...tags];
    if (tagInputValue.trim()) {
      const pending = tagInputValue.trim().toLowerCase().replace(/^#+/, "");
      if (pending && !finalTags.includes(pending)) {
        finalTags.push(pending);
      }
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      price: price.trim() || null,
      assetType,
      aspect,
      activeThumbnailIndex: 0,
      tags: finalTags,
      thumbnails,
      references: [],
    };

    if (editingProduct?.id) {
      updateMutation.mutate({ id: editingProduct.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openCreateTestimonialModal = () => {
    setEditingTestimonial(null);
    setTestAuthor("");
    setTestLocation("");
    setTestQuote("");
    setTestRating(5);
    setTestApproved(true);
    setTestOrderIndex(testimonials.length + 1);
    setTestimonialModalOpen(true);
  };

  const openEditTestimonialModal = (item: any) => {
    setEditingTestimonial(item);
    setTestAuthor(item.author || "");
    setTestLocation(item.location || "");
    setTestQuote(item.quote || "");
    setTestRating(item.rating || 5);
    setTestApproved(item.isApproved ?? true);
    setTestOrderIndex(item.orderIndex || 0);
    setTestimonialModalOpen(true);
  };

  const handleTestimonialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testAuthor.trim() || !testQuote.trim()) {
      toast.error("Author name and testimonial quote are required");
      return;
    }
    const payload = {
      author: testAuthor.trim(),
      location: testLocation.trim() || null,
      quote: testQuote.trim(),
      rating: testRating,
      isApproved: testApproved,
      orderIndex: Number(testOrderIndex) || 0,
    };
    if (editingTestimonial?.id) {
      updateTestimonialMutation.mutate({ id: editingTestimonial.id, payload });
    } else {
      createTestimonialMutation.mutate(payload);
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

  // Unauthorized state
  if (!session?.user || !session.user.isAdmin) {
    return (
      <main className="min-h-screen py-24 px-4 flex items-center justify-center">
        <div className="max-w-md w-full text-center rounded-3xl bg-white p-8 sm:p-10 border border-stone-200 shadow-xl">
          <div className="size-16 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto mb-5">
            <ShieldCheck size={32} />
          </div>
          <h1 className="font-serif text-3xl text-neutral-900">Restricted Access</h1>
          <p className="mt-2 text-sm text-neutral-600 font-light leading-relaxed">
            The Studio CMS is reserved for authenticated florists and atelier administrators.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              href="/admin/login"
              className="w-full rounded-full bg-neutral-900 py-3 text-xs font-medium text-white hover:bg-neutral-800 transition-colors shadow-xs text-center"
            >
              Sign In to Atelier CMS
            </Link>
            <Link
              href="/"
              className="w-full rounded-full border border-stone-200 py-2.5 text-xs font-medium text-neutral-700 hover:bg-stone-50 transition-colors text-center"
            >
              Return to Boutique Homepage
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
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
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-xs font-medium text-white hover:bg-neutral-800 transition-all shadow-md self-start sm:self-auto cursor-pointer"
            >
              <Plus size={16} />
              <span>Create New Offering</span>
            </button>
          )}
          {activeTab === "testimonials" && (
            <button
              onClick={openCreateTestimonialModal}
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

        {/* 4 Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="rounded-3xl bg-white p-6 border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between text-stone-400 mb-3">
              <span className="text-xs uppercase font-medium tracking-wider">Total Items</span>
              <Package size={18} />
            </div>
            <span className="font-serif text-3xl font-medium text-neutral-900">
              {stats?.totalCount ?? 0}
            </span>
            <p className="text-[11px] text-neutral-500 mt-1">Active floral products</p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-3xl bg-white p-6 border border-stone-200/80 shadow-xs hover:border-neutral-300 hover:shadow-sm transition-all group block cursor-pointer"
          >
            <div className="flex items-center justify-between text-stone-400 mb-3">
              <span className="text-xs uppercase font-medium tracking-wider group-hover:text-neutral-900 transition-colors">
                Paid Orders
              </span>
              <ShoppingBag size={18} className="group-hover:text-neutral-900 transition-colors" />
            </div>
            <span className="font-serif text-3xl font-medium text-neutral-900">
              {stats?.paidOrders ?? 0}
            </span>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[11px] text-neutral-500">Completed purchases</p>
              <span className="text-[10px] text-stone-400 group-hover:text-neutral-700 transition-colors font-medium">View &rarr;</span>
            </div>
          </Link>

          <div className="rounded-3xl bg-white p-6 border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between text-stone-400 mb-3">
              <span className="text-xs uppercase font-medium tracking-wider">
                New (30 Days)
              </span>
              <Calendar size={18} />
            </div>
            <span className="font-serif text-3xl font-medium text-neutral-900">
              {stats?.newMonthlyItems ?? 0}
            </span>
            <p className="text-[11px] text-neutral-500 mt-1">Recently created stems</p>
          </div>

          <div className="rounded-3xl bg-white p-6 border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between text-stone-400 mb-3">
              <span className="text-xs uppercase font-medium tracking-wider">
                Total Views
              </span>
              <Eye size={18} />
            </div>
            <span className="font-serif text-3xl font-medium text-neutral-900">
              {formatViews(stats?.totalViews ?? 0)}
            </span>
            <p className="text-[11px] text-neutral-500 mt-1">Client engagement views</p>
          </div>
        </div>

        {/* Navigation Tabs between Products, Testimonials, & Settings */}
        <div className="flex items-center gap-2 mb-6 border-b border-stone-200/80 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab("products")}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "products"
                ? "bg-neutral-900 text-white shadow-xs"
                : "bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50"
            }`}
          >
            <Package size={14} />
            <span>Floral Offerings</span>
            <span
              className={`text-[10px] rounded-full px-2 py-0.5 font-semibold ${
                activeTab === "products"
                  ? "bg-white/20 text-white"
                  : "bg-stone-100 text-stone-600"
              }`}
            >
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("testimonials")}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "testimonials"
                ? "bg-neutral-900 text-white shadow-xs"
                : "bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50"
            }`}
          >
            <MessageSquare size={14} />
            <span>Client Testimonials</span>
            <span
              className={`text-[10px] rounded-full px-2 py-0.5 font-semibold ${
                activeTab === "testimonials"
                  ? "bg-white/20 text-white"
                  : "bg-stone-100 text-stone-600"
              }`}
            >
              {testimonials.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "settings"
                ? "bg-neutral-900 text-white shadow-xs"
                : "bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50"
            }`}
          >
            <Sliders size={14} />
            <span>Store & Fulfillment Settings</span>
          </button>
        </div>

        {/* Product Management Table */}
        {activeTab === "products" && (
          <div className="rounded-3xl bg-white border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-serif text-xl text-neutral-900">All Catalog Offerings</h3>
            <span className="text-xs text-neutral-500 font-medium">
              {products.length} products listed
            </span>
          </div>

          {productsLoading ? (
            <div className="py-16 flex items-center justify-center">
              <RelaxingLoader label="Loading offerings catalog..." size={120} />
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center text-neutral-500">
              <p className="font-serif text-lg">No products found</p>
              <p className="text-xs mt-1">Click &ldquo;Create New Offering&rdquo; above to publish your first bouquet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-700">
                <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-neutral-500 border-b border-stone-100">
                  <tr>
                    <th className="py-3.5 px-6">Product</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Views</th>
                    <th className="py-3.5 px-4">Published</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products.map((item: any) => {
                    const thumb = getActiveThumbnail(item);
                    return (
                      <tr key={item.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-4 px-6 flex items-center gap-3">
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
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex flex-wrap items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(item)}
                              className="inline-flex items-center gap-1 rounded-full border border-stone-200 px-3 py-1.5 text-[11px] font-medium text-neutral-700 hover:bg-stone-100 transition-colors"
                            >
                              <Edit3 size={12} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, item.title)}
                              disabled={deleteMutation.isPending}
                              className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1.5 text-[11px] font-medium text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
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
          )}
        </div>
        )}

        {/* Testimonials Management Table */}
        {activeTab === "testimonials" && (
          <div className="rounded-3xl bg-white border border-stone-200/80 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl text-neutral-900">Patron Stories & Reviews</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Manage reviews displayed on the boutique homepage
                </p>
              </div>
              <button
                onClick={openCreateTestimonialModal}
                className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Testimonial</span>
              </button>
            </div>

            {testimonialsLoading ? (
              <div className="py-16 flex items-center justify-center">
                <RelaxingLoader label="Loading client testimonials..." size={120} />
              </div>
            ) : testimonials.length === 0 ? (
              <div className="py-16 text-center text-neutral-500">
                <p className="font-serif text-lg">No testimonials yet</p>
                <p className="text-xs mt-1">Click &ldquo;Add Testimonial&rdquo; to publish your first patron experience.</p>
              </div>
            ) : (
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
                    {testimonials.map((item: any) => (
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
                              onClick={() => openEditTestimonialModal(item)}
                              className="inline-flex items-center gap-1 rounded-full border border-stone-200 px-3 py-1.5 text-[11px] font-medium text-neutral-700 hover:bg-stone-100 transition-colors cursor-pointer"
                            >
                              <Edit3 size={12} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteTestimonial(item.id, item.author)}
                              disabled={deleteTestimonialMutation.isPending}
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
            )}
          </div>
        )}

        {/* Store & Fulfillment Settings Panel */}
        {activeTab === "settings" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <form
              id="admin-settings-form"
              onSubmit={handleSaveSettings}
              className="rounded-3xl bg-white border border-stone-200/80 shadow-xs p-6 sm:p-8 space-y-8"
            >
              <div>
                <h3 className="font-serif text-2xl text-neutral-900">
                  Store Fulfillment & Gifting Configuration
                </h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-2xl">
                  Control the home courier delivery charge, gift packaging &amp; handwritten letter pricing, and atelier collection details in real time. Changes take effect on the checkout flow immediately.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 border-t border-stone-100">
                {/* 1. Home Delivery Pricing Control */}
                <div className="p-6 rounded-2xl bg-stone-50/70 border border-stone-200/70 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
                        <Truck size={18} />
                      </div>
                      <div>
                        <h4 className="font-serif text-base font-medium text-neutral-900">
                          Home Courier Delivery Fee
                        </h4>
                        <span className="text-[11px] text-stone-500">
                          Applied when customer selects Courier Delivery
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-200/60 text-neutral-800">
                      Current: {formatPrice(settingDeliveryFee)}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    Set the flat delivery charge for refrigerated courier shipping to the customer&apos;s doorstep. You can adjust this anytime as local courier or fuel charges change.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Delivery Price (INR / ₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-stone-400 font-serif">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={settingDeliveryFee}
                        onChange={(e) => setSettingDeliveryFee(e.target.value)}
                        placeholder="150.00"
                        className="w-full rounded-xl border border-stone-200 pl-8 pr-3.5 py-2.5 text-sm font-medium text-neutral-900 focus:border-neutral-900 focus:outline-none bg-white transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Gift Packaging & Card Pricing Control */}
                <div className="p-6 rounded-2xl bg-stone-50/70 border border-stone-200/70 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                        <Gift size={18} />
                      </div>
                      <div>
                        <h4 className="font-serif text-base font-medium text-neutral-900">
                          Gift Packaging &amp; Printed Card Price
                        </h4>
                        <span className="text-[11px] text-stone-500">
                          Applied when customer opts into Gift feature
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">
                      Current: {formatPrice(settingGiftPrice)}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    Covers our signature floral packaging, the cute reusable botanical tote bag, satin ribbon wrap, and high-GSM physical print cardstock matching the user&apos;s chosen card aesthetic.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Gift Add-On Price (INR / ₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-stone-400 font-serif">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={settingGiftPrice}
                        onChange={(e) => setSettingGiftPrice(e.target.value)}
                        placeholder="100.00"
                        className="w-full rounded-xl border border-stone-200 pl-8 pr-3.5 py-2.5 text-sm font-medium text-neutral-900 focus:border-neutral-900 focus:outline-none bg-white transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Self-Collection Studio Information */}
              <div className="p-6 rounded-2xl bg-stone-50/70 border border-stone-200/70 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-amber-700 text-white flex items-center justify-center shadow-xs">
                    <Store size={18} />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-medium text-neutral-900">
                      Self-Collection Atelier Information
                    </h4>
                    <span className="text-[11px] text-stone-500">
                      Displayed to patrons when opting for Complimentary Studio Pickup
                    </span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  Patrons selecting Self-Collection do not pay a delivery fee ($0.00). Specify your exact studio pickup address and daily operating hours so customers know when and where to collect their arrangements.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Atelier Studio Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingPickupAddress}
                      onChange={(e) => setSettingPickupAddress(e.target.value)}
                      placeholder="Elvara Floral Atelier, Road No. 36, Jubilee Hills, Hyderabad 500033"
                      className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Collection Operating Hours *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingPickupHours}
                      onChange={(e) => setSettingPickupHours(e.target.value)}
                      placeholder="Monday – Sunday, 09:00 AM – 08:00 PM"
                      className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Form Action Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                <p className="text-xs text-stone-500">
                  All updates are stored in database and take immediate effect on checkout.
                </p>

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-2.5 text-xs font-medium text-white hover:bg-neutral-800 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {savingSettings ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Save Fulfillment Settings</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs"
          />

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-stone-100 z-10">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 rounded-full p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="font-serif text-2xl text-neutral-900 mb-1">
              {editingProduct ? "Edit Floral Offering" : "New Studio Offering"}
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

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-neutral-700">
                    Tags & Keywords
                  </label>
                  <span className="text-[11px] text-neutral-400">
                    Type word & press <kbd className="bg-stone-100 border border-stone-200 px-1 py-0.5 rounded text-[10px] font-mono text-neutral-600">Enter</kbd>
                  </span>
                </div>

                <div 
                  onClick={() => document.getElementById("admin-tag-input")?.focus()}
                  className="flex flex-wrap items-center gap-1.5 min-h-[44px] w-full rounded-xl border border-stone-200 bg-white p-2 text-xs focus-within:border-neutral-900 transition-colors cursor-text"
                >
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-stone-100 text-stone-800 pl-2.5 pr-1.5 py-1 text-xs font-medium border border-stone-200/60"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveTag(tag);
                        }}
                        className="size-4 rounded-full flex items-center justify-center hover:bg-stone-300 text-stone-500 hover:text-stone-900 transition-colors"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}

                  <input
                    id="admin-tag-input"
                    type="text"
                    value={tagInputValue}
                    onChange={(e) => setTagInputValue(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => {
                      if (tagInputValue.trim()) handleAddTag(tagInputValue);
                    }}
                    placeholder={tags.length === 0 ? "Type tag (e.g. wedding) and press Enter..." : "Add another tag..."}
                    className="flex-1 min-w-[130px] border-none bg-transparent px-1.5 py-1 text-xs text-neutral-900 placeholder:text-stone-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Image Uploader & URL Input */}
              <div className="rounded-2xl border border-stone-200/90 bg-stone-50/60 p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-neutral-800 flex items-center gap-1.5">
                    <UploadCloud size={15} className="text-stone-600" />
                    <span>Offering Images</span>
                  </label>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                    Demo Mode Active (No Card Required)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* File Upload Button */}
                  <label className="cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-white border border-stone-300 px-4 py-2.5 text-xs font-medium text-neutral-800 hover:bg-stone-50 transition-colors shadow-2xs">
                    {uploadingImage ? (
                      <Loader2 size={13} className="animate-spin text-stone-600" />
                    ) : (
                      <Plus size={13} className="text-stone-600" />
                    )}
                    <span>{uploadingImage ? "Uploading to local storage..." : "Upload from Device"}</span>
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
                      className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-stone-50 transition-colors"
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
                          <img
                            src={t}
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
                            onClick={() => setThumbnails(thumbnails.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 size-5 rounded-full bg-neutral-900/80 hover:bg-neutral-950 text-white flex items-center justify-center transition-colors shadow-xs"
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

              {/* Action buttons */}
              <div className="pt-4 flex items-center justify-between border-t border-stone-100">
                {editingProduct?.id ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(editingProduct.id, editingProduct.title)}
                    disabled={deleteMutation.isPending}
                    className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
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
                    onClick={() => setModalOpen(false)}
                    className="rounded-full border border-stone-200 px-5 py-2.5 text-xs font-medium text-neutral-700 hover:bg-stone-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending || uploadingImage}
                    className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-2.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50 transition-all shadow-sm"
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Check size={13} />
                    )}
                    <span>{editingProduct ? "Save Changes" : "Publish to Store"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Testimonial Create / Edit Modal */}
      {testimonialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setTestimonialModalOpen(false)}
            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs"
          />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-stone-200 z-10 overflow-y-auto max-h-[90vh]"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-6">
              <div>
                <h3 className="font-serif text-2xl text-neutral-900">
                  {editingTestimonial ? "Edit Client Testimonial" : "New Client Testimonial"}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Feature memorable celebrations and authentic feedback
                </p>
              </div>
              <button
                onClick={() => setTestimonialModalOpen(false)}
                className="size-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleTestimonialSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Author / Client Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={testAuthor}
                  onChange={(e) => setTestAuthor(e.target.value)}
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
                  value={testLocation}
                  onChange={(e) => setTestLocation(e.target.value)}
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
                      onClick={() => setTestRating(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        size={22}
                        className={star <= testRating ? "text-amber-500 fill-amber-500" : "text-stone-300"}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-stone-500 ml-2 font-medium">{testRating} of 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Quote / Client Story <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={testQuote}
                  onChange={(e) => setTestQuote(e.target.value)}
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
                    value={testOrderIndex}
                    onChange={(e) => setTestOrderIndex(parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="testApproved"
                    checked={testApproved}
                    onChange={(e) => setTestApproved(e.target.checked)}
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
                  onClick={() => setTestimonialModalOpen(false)}
                  className="rounded-full border border-stone-200 px-5 py-2.5 text-xs font-medium text-neutral-700 hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTestimonialMutation.isPending || updateTestimonialMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-2.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50 transition-all shadow-sm cursor-pointer"
                >
                  {(createTestimonialMutation.isPending || updateTestimonialMutation.isPending) ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Check size={13} />
                  )}
                  <span>{editingTestimonial ? "Save Changes" : "Publish Testimonial"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-stone-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="size-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 size={22} />
            </div>
            <h3 className="font-serif text-xl text-neutral-900">
              {deleteConfirmItem.type === "testimonial" ? "Delete Client Testimonial?" : "Delete Botanical Offering?"}
            </h3>
            <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
              Are you sure you want to permanently remove <span className="font-semibold text-neutral-800">&ldquo;{deleteConfirmItem.title}&rdquo;</span>? This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                disabled={deleteMutation.isPending || deleteTestimonialMutation.isPending}
                className="rounded-full px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending || deleteTestimonialMutation.isPending}
                className="rounded-full bg-rose-600 px-5 py-2 text-xs font-medium text-white hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {(deleteMutation.isPending || deleteTestimonialMutation.isPending) ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    <span>{deleteConfirmItem.type === "testimonial" ? "Delete Testimonial" : "Delete Offering"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
