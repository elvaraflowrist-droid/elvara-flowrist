export interface PurchaseItem {
  orderId: string;
  paymentId?: string | null;
  amount: string;
  purchasedAt: string | Date;
  postId: string;
  title: string;
  description?: string | null;
  price?: string | null;
  aspect?: "horizontal" | "vertical";
  imageUrl?: string | null;
  thumbnails?: string[];
  activeThumbnailIndex?: number;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  shippingAddress?: string | null;
  city?: string | null;
  postalCode?: string | null;
  deliveryNotes?: string | null;
  accountName?: string | null;
  accountEmail?: string | null;
  fulfillmentType?: "delivery" | "pickup" | null;
  isGift?: boolean | null;
  giftCardType?: string | null;
  giftMessage?: string | null;
  deliveryFee?: string | null;
  giftFee?: string | null;
}

export interface PurchasesApiResponse {
  purchases: PurchaseItem[];
  isAdmin?: boolean;
  view?: "all" | "mine";
  totalOrders?: number;
}
