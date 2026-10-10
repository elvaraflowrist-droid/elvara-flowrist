"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  MapPin,
  User,
  Mail,
  Phone,
  FileText,
  Loader2,
  Truck,
  Store,
  Gift,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { formatPrice, getActiveThumbnail } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { CustomerInfo } from "@/lib/useRazorpay";
import GiftCardWriter, { countWords, MAX_GIFT_NOTE_WORDS } from "@/components/GiftCardWriter";
import { toast } from "sonner";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    price?: string | number | null;
    imageUrl?: string | null;
    thumbnails?: string[];
    activeThumbnailIndex?: number;
    assetType?: string;
  } | null;
  onConfirmPurchase: (customerInfo: CustomerInfo) => Promise<void> | void;
  isProcessing?: boolean;
}

interface StoreSettings {
  delivery_fee: string;
  gift_price: string;
  pickup_address: string;
  pickup_hours: string;
}

const DEFAULT_SETTINGS: StoreSettings = {
  delivery_fee: "150.00",
  gift_price: "100.00",
  pickup_address: "Elvara Floral Atelier, Road No. 36, Jubilee Hills, Hyderabad 500033",
  pickup_hours: "Monday – Sunday, 09:00 AM – 08:00 PM",
};

export default function CheckoutModal({
  isOpen,
  onClose,
  product,
  onConfirmPurchase,
  isProcessing = false,
}: CheckoutModalProps) {
  const { data: session } = useSession();

  // Settings fetched from CMS
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);

  // Fulfillment state: 'delivery' | 'pickup'
  const [fulfillmentType, setFulfillmentType] = useState<"delivery" | "pickup">("delivery");

  // Contact / Address form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Hyderabad");
  const [postalCode, setPostalCode] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  // Gift feature state
  const [isGift, setIsGift] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState("vintage-botanical");
  const [giftMessage, setGiftMessage] = useState("");
  const [salutation, setSalutation] = useState("Dearest friend,");
  const [signoff, setSignoff] = useState("With warmest love,");

  const [locating, setLocating] = useState(false);

  // Fetch store settings on mount / open
  useEffect(() => {
    if (isOpen) {
      fetch("/api/settings")
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setSettings({
              delivery_fee: json.data.delivery_fee || DEFAULT_SETTINGS.delivery_fee,
              gift_price: json.data.gift_price || DEFAULT_SETTINGS.gift_price,
              pickup_address: json.data.pickup_address || DEFAULT_SETTINGS.pickup_address,
              pickup_hours: json.data.pickup_hours || DEFAULT_SETTINGS.pickup_hours,
            });
          }
        })
        .catch((err) => console.error("Error fetching settings:", err));
    }
  }, [isOpen]);

  // Populate from session whenever session or modal opens
  useEffect(() => {
    if (session?.user && isOpen) {
      if (!name) setName(session.user.name || "");
      if (!email) setEmail(session.user.email || "");
    }
  }, [session, isOpen, name, email]);

  const deliveryFeeNum = fulfillmentType === "pickup" ? 0 : parseFloat(settings.delivery_fee || "15.00");
  const giftFeeNum = isGift ? parseFloat(settings.gift_price || "12.00") : 0;
  const basePriceNum = product?.price ? parseFloat(product.price.toString()) : 0;
  const totalAmount = basePriceNum + deliveryFeeNum + giftFeeNum;

  const handleUseCurrentLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "en",
              },
            }
          );
          if (!res.ok) throw new Error("Could not convert coordinates to address");
          const data = await res.json();
          const addr = data.address || {};

          const streetParts = [
            addr.house_number,
            addr.building,
            addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood,
          ].filter(Boolean);

          const fullStreet =
            streetParts.length > 0
              ? streetParts.join(" ")
              : data.display_name?.split(",")?.slice(0, 2)?.join(",") || "";

          const detectedCity =
            addr.city || addr.town || addr.village || addr.county || addr.state_district || "";
          const detectedPostalCode = addr.postcode || "";

          if (fullStreet) setAddress(fullStreet);
          if (detectedCity) setCity(detectedCity);
          if (detectedPostalCode) setPostalCode(detectedPostalCode);

          toast.success("Delivery address populated from current location!");
        } catch (err: any) {
          console.error(err);
          setAddress(`Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          toast.info("GPS coordinates captured. Please refine your street address.");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("Location permission denied. Please enter address manually.");
        } else {
          toast.error("Unable to retrieve location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  if (!isOpen || !product) return null;

  const thumbnailSrc = getActiveThumbnail(product);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your recipient or contact name");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!phone.trim()) {
      toast.error("Please enter your contact phone number");
      return;
    }

    if (fulfillmentType === "delivery") {
      if (!address.trim()) {
        toast.error("Please enter delivery street address");
        return;
      }
      if (!city.trim()) {
        toast.error("Please enter your delivery city");
        return;
      }
    }

    if (isGift) {
      const words = countWords(giftMessage);
      if (words > MAX_GIFT_NOTE_WORDS) {
        toast.error(`Please limit your handwritten card note to ${MAX_GIFT_NOTE_WORDS} words so it fits beautifully on our cardstock.`);
        return;
      }
    }

    const compiledGiftMessage = isGift
      ? `${salutation.trim()}\n\n${giftMessage.trim()}\n\n${signoff.trim()}`.trim()
      : undefined;

    onConfirmPurchase({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: fulfillmentType === "pickup" ? settings.pickup_address : address.trim(),
      city: fulfillmentType === "pickup" ? "Atelier Pickup" : city.trim(),
      postalCode: fulfillmentType === "pickup" ? undefined : postalCode.trim() || undefined,
      deliveryNotes: deliveryNotes.trim() || undefined,
      fulfillmentType,
      isGift,
      giftCardType: isGift ? selectedCardId : undefined,
      giftMessage: compiledGiftMessage,
      deliveryFee: deliveryFeeNum,
      giftFee: giftFeeNum,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative border-b border-stone-100 bg-stone-50/80 px-6 py-5 shrink-0">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="absolute top-5 right-5 size-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors shadow-xs"
          >
            <X size={16} />
          </button>

          <h2 className="font-serif text-2xl text-neutral-900">
            Order & Atelier Fulfillment
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Select your fulfillment method, packaging, and personal notes
          </p>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Selected Product Summary */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 flex items-center gap-3.5">
            <div className="relative size-14 rounded-xl overflow-hidden bg-stone-200 shrink-0 border border-stone-200/60">
              <Image
                src={thumbnailSrc}
                alt={product.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-sm font-medium text-neutral-900 truncate">
                {product.title}
              </p>
              <p className="text-xs text-stone-500 capitalize">
                {product.assetType || "Arrangement"}
              </p>
            </div>
            <div className="text-right pl-2">
              <span className="font-serif text-base font-semibold text-neutral-900">
                {formatPrice(product.price)}
              </span>
            </div>
          </div>

          {/* 1. Fulfillment Toggle: Delivery vs Self-Collection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-800">
                Fulfillment Preference
              </label>
              <span className="text-[11px] text-stone-500">
                {fulfillmentType === "delivery" ? "Courier to door" : "Complimentary studio pickup"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Delivery Option Button */}
              <button
                type="button"
                onClick={() => setFulfillmentType("delivery")}
                className={`relative flex flex-col p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  fulfillmentType === "delivery"
                    ? "border-neutral-900 bg-stone-50/90 ring-1 ring-neutral-900 shadow-xs"
                    : "border-stone-200 hover:border-stone-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-2">
                    <Truck size={17} className={fulfillmentType === "delivery" ? "text-neutral-900" : "text-stone-400"} />
                    <span className="font-serif text-sm font-medium text-neutral-900">
                      Courier Delivery
                    </span>
                  </div>
                  {fulfillmentType === "delivery" && (
                    <CheckCircle2 size={16} className="text-neutral-900" />
                  )}
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  White-glove refrigerated delivery to your doorstep
                </p>
                <span className="text-xs font-semibold text-amber-900 mt-2">
                  +{formatPrice(settings.delivery_fee)}
                </span>
              </button>

              {/* Self-Collection Option Button */}
              <button
                type="button"
                onClick={() => setFulfillmentType("pickup")}
                className={`relative flex flex-col p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  fulfillmentType === "pickup"
                    ? "border-neutral-900 bg-stone-50/90 ring-1 ring-neutral-900 shadow-xs"
                    : "border-stone-200 hover:border-stone-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-2">
                    <Store size={17} className={fulfillmentType === "pickup" ? "text-neutral-900" : "text-stone-400"} />
                    <span className="font-serif text-sm font-medium text-neutral-900">
                      Self Collection
                    </span>
                  </div>
                  {fulfillmentType === "pickup" && (
                    <CheckCircle2 size={16} className="text-neutral-900" />
                  )}
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Pick up at our Jubilee Hills floral studio
                </p>
                <span className="text-xs font-semibold text-emerald-700 mt-2">
                  FREE (₹0)
                </span>
              </button>
            </div>
          </div>

          {/* Self-Collection Studio Information Card */}
          {fulfillmentType === "pickup" && (
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-xs text-amber-950 space-y-2">
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-amber-800 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-neutral-900">Collection Atelier Location:</p>
                  <p className="text-stone-700 mt-0.5 font-medium">{settings.pickup_address}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 pt-1 border-t border-amber-200/50">
                <Clock size={16} className="text-amber-800 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-neutral-900">Studio Hours:</p>
                  <p className="text-stone-700 mt-0.5">{settings.pickup_hours}</p>
                </div>
              </div>
              <p className="text-[11px] text-amber-800/90 italic pt-1">
                Your flowers will be kept in our temperature-controlled botanical cold room until you arrive. Please present your Order ID at the atelier desk.
              </p>
            </div>
          )}

          {/* 2. Gift Option Toggle & Letter Writer */}
          <div className="rounded-2xl border border-stone-200 bg-stone-50/40 p-4 sm:p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 flex items-center justify-center shrink-0">
                  <Gift size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-base font-semibold text-neutral-900">
                      Bespoke Gift Packaging & Handcrafted Card
                    </span>
                    <span className="text-[10px] uppercase font-semibold tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                      +{formatPrice(settings.gift_price)}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Gift-wrapped with satin ribbon, enclosed in our cute reusable botanical tote bag, plus a personalized physical card printed on 300 GSM textured paper.
                  </p>
                </div>
              </div>

              {/* Toggle switch */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900"></div>
              </label>
            </div>

            {/* Gift Card Interactive Canvas (if opted in) */}
            {isGift && (
              <div className="pt-3 border-t border-stone-200/80 animate-in fade-in duration-300">
               

                <GiftCardWriter
                  selectedCardId={selectedCardId}
                  onSelectCardId={setSelectedCardId}
                  message={giftMessage}
                  onChangeMessage={setGiftMessage}
                  salutation={salutation}
                  onChangeSalutation={setSalutation}
                  signoff={signoff}
                  onChangeSignoff={setSignoff}
                />
              </div>
            )}
          </div>

          {/* 3. Contact & Delivery Address Form */}
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-serif text-base font-semibold text-neutral-900 border-b border-stone-100 pb-2">
              {fulfillmentType === "delivery" ? "Recipient & Delivery Details" : "Collector Contact Details"}
            </h3>

            {/* Contact Name */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                {fulfillmentType === "delivery" ? "Recipient Full Name" : "Your Name / Collector"} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 size-4 text-stone-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (isGift && !salutation.includes(e.target.value) && e.target.value.length > 2) {
                      setSalutation(`Dearest ${e.target.value},`);
                    }
                  }}
                  placeholder="e.g. Clara Oswald"
                  className="w-full rounded-xl border border-stone-200 pl-9 pr-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-stone-400 focus:border-neutral-900 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 size-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-stone-200 pl-9 pr-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-stone-400 focus:border-neutral-900 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 size-4 text-stone-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-stone-200 pl-9 pr-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-stone-400 focus:border-neutral-900 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Street Address (Only for Home Delivery) */}
            {fulfillmentType === "delivery" && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-neutral-700">
                      Street Address <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={locating}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-200/60 transition-colors disabled:opacity-50 cursor-pointer"
                      title="Detect current address using browser Geolocation"
                    >
                      {locating ? (
                        <>
                          <Loader2 size={11} className="animate-spin text-amber-800" />
                          <span>Locating...</span>
                        </>
                      ) : (
                        <>
                          <MapPin size={11} className="text-amber-800" />
                          <span>Use Current Location</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 size-4 text-stone-400" />
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Apartment, suite, street name"
                      className="w-full rounded-xl border border-stone-200 pl-9 pr-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-stone-400 focus:border-neutral-900 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Hyderabad"
                      className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-stone-400 focus:border-neutral-900 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Postal / Pin Code
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="500033"
                      className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-stone-400 focus:border-neutral-900 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Special Instructions / Pickup Notes */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1 flex items-center gap-1">
                <FileText size={12} className="text-stone-400" />
                <span>
                  {fulfillmentType === "delivery"
                    ? "Delivery Instructions (e.g. Ring bell, leave with concierge)"
                    : "Pickup Time / Collection Notes"}
                </span>
              </label>
              <textarea
                rows={2}
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder={
                  fulfillmentType === "delivery"
                    ? "e.g. Please handle with care, gate code is 4321"
                    : "e.g. Expecting to collect this Saturday around 3 PM"
                }
                className="w-full rounded-xl border border-stone-200 p-2.5 text-xs text-neutral-900 placeholder:text-stone-400 focus:border-neutral-900 focus:outline-none transition-colors"
              />
            </div>
          </form>

          {/* Pricing Breakdown Summary */}
          <div className="rounded-2xl bg-stone-50 p-4 border border-stone-100 space-y-2 text-xs">
            <div className="flex items-center justify-between text-stone-600">
              <span>Botanical Arrangement</span>
              <span className="font-medium text-neutral-900">{formatPrice(product.price)}</span>
            </div>

            <div className="flex items-center justify-between text-stone-600">
              <span className="flex items-center gap-1">
                <span>Fulfillment:</span>
                <span className="font-medium text-neutral-800">
                  {fulfillmentType === "delivery" ? "Courier Delivery" : "Self-Collection"}
                </span>
              </span>
              <span className="font-medium text-neutral-900">
                {fulfillmentType === "delivery" ? `+${formatPrice(settings.delivery_fee)}` : "FREE"}
              </span>
            </div>

            {isGift && (
              <div className="flex items-center justify-between text-rose-800 font-medium">
                <span className="flex items-center gap-1">
                  <span>Gift Bag & Handcrafted Card</span>
                </span>
                <span>+{formatPrice(settings.gift_price)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between font-serif text-sm font-semibold text-neutral-900">
              <span>Total Payable</span>
              <span className="text-base text-neutral-900">{formatPrice(totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-stone-100 bg-stone-50/70 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Secure checkout & satisfaction guaranteed</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="rounded-full px-4 py-2.5 text-xs font-medium text-neutral-600 hover:bg-stone-200/60 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="checkout-form"
              disabled={isProcessing}
              className="rounded-full bg-neutral-900 px-6 py-2.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50 transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <span>Confirm & Pay {formatPrice(totalAmount)}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
