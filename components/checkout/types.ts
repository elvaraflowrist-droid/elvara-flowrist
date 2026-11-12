export type CheckoutStage = 1 | 2 | 3 | 4;

export interface StoreSettings {
  delivery_fee: string;
  gift_price: string;
  pickup_address: string;
  pickup_hours: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  delivery_fee: "150.00",
  gift_price: "100.00",
  pickup_address: "Elvara Floral Atelier, Road No. 36, Jubilee Hills, Hyderabad 500033",
  pickup_hours: "Monday – Sunday, 09:00 AM – 08:00 PM",
};

export interface CheckoutProduct {
  id: string;
  title: string;
  price?: string | number | null;
  imageUrl?: string | null;
  thumbnails?: string[];
  activeThumbnailIndex?: number;
  assetType?: string;
}

export interface ContactDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  deliveryNotes: string;
}

export interface GiftDetails {
  isGift: boolean;
  selectedCardId: string;
  message: string;
  salutation: string;
  signoff: string;
}

