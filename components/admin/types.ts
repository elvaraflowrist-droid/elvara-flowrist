export type AdminTab = "products" | "testimonials" | "settings";

export interface AdminStats {
  totalCount?: number;
  paidOrders?: number;
  newMonthlyItems?: number;
  totalViews?: number;
}

export interface ProductItem {
  id: string;
  title: string;
  description?: string | null;
  price?: string | null;
  assetType?: string;
  aspect?: "horizontal" | "vertical";
  tags?: string[];
  thumbnails?: string[];
  views?: number;
  createdAt?: string | Date;
  activeThumbnailIndex?: number;
  [key: string]: any;
}

export interface TestimonialItem {
  id: string;
  author: string;
  location?: string | null;
  quote: string;
  rating: number;
  isApproved: boolean;
  orderIndex: number;
  createdAt?: string | Date;
  [key: string]: any;
}

export interface StoreSettings {
  delivery_fee?: string;
  gift_price?: string;
  pickup_address?: string;
  pickup_hours?: string;
}

export interface DeleteConfirmItem {
  id: string;
  title: string;
  type?: "product" | "testimonial" | "bulk-product";
  count?: number;
  ids?: string[];
}
