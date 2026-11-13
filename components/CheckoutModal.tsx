"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ArrowLeft, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { formatPrice, getActiveThumbnail } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { CustomerInfo } from "@/lib/useRazorpay";
import { countWords, MAX_GIFT_NOTE_WORDS } from "@/components/GiftCardWriter";
import StepIndicator from "@/components/checkout/StepIndicator";
import PriceBreakdown from "@/components/checkout/PriceBreakdown";
import FulfillmentStep from "@/components/checkout/FulfillmentStep";
import ContactStep from "@/components/checkout/ContactStep";
import GiftStep from "@/components/checkout/GiftStep";
import OrderPreviewStep from "@/components/checkout/OrderPreviewStep";
import {
  CheckoutProduct,
  CheckoutStage,
  ContactDetails,
  DEFAULT_STORE_SETTINGS,
  GiftDetails,
  StoreSettings,
} from "@/components/checkout/types";
import { toast } from "sonner";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: CheckoutProduct | null;
  onConfirmPurchase: (customerInfo: CustomerInfo) => Promise<void> | void;
  isProcessing?: boolean;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  product,
  onConfirmPurchase,
  isProcessing = false,
}: CheckoutModalProps) {
  const { data: session } = useSession();

  const [stage, setStage] = useState<CheckoutStage>(1);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [fulfillmentType, setFulfillmentType] = useState<"delivery" | "pickup">("delivery");

  const [contact, setContact] = useState<ContactDetails>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "Hyderabad",
    postalCode: "",
    deliveryNotes: "",
  });

  const [gift, setGift] = useState<GiftDetails>({
    isGift: false,
    selectedCardId: "vintage-botanical",
    message: "",
    salutation: "Dearest friend,",
    signoff: "With warmest wishes,",
  });

  const hasPrefilledRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      hasPrefilledRef.current = false;
      setStage(1);
      return;
    }

    fetch("/api/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setSettings({
            delivery_fee: json.data.delivery_fee || DEFAULT_STORE_SETTINGS.delivery_fee,
            gift_price: json.data.gift_price || DEFAULT_STORE_SETTINGS.gift_price,
            pickup_address: json.data.pickup_address || DEFAULT_STORE_SETTINGS.pickup_address,
            pickup_hours: json.data.pickup_hours || DEFAULT_STORE_SETTINGS.pickup_hours,
          });
        }
      })
      .catch((err) => console.error("Error fetching settings:", err));
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && session?.user && !hasPrefilledRef.current) {
      setContact((prev) => ({
        ...prev,
        name: prev.name || session.user.name || "",
        email: prev.email || session.user.email || "",
      }));
      hasPrefilledRef.current = true;
    }
  }, [session, isOpen]);

  if (!isOpen || !product || typeof document === "undefined") return null;

  const deliveryFeeNum =
    fulfillmentType === "pickup" ? 0 : parseFloat(settings.delivery_fee || "150.00");
  const giftFeeNum = gift.isGift ? parseFloat(settings.gift_price || "100.00") : 0;
  const basePriceNum = product.price ? parseFloat(product.price.toString()) : 0;
  const totalAmount = basePriceNum + deliveryFeeNum + giftFeeNum;
  const thumbnailSrc = getActiveThumbnail(product);

  const updateContact = (patch: Partial<ContactDetails>) => {
    setContact((prev) => ({ ...prev, ...patch }));
  };

  const updateGift = (patch: Partial<GiftDetails>) => {
    setGift((prev) => ({ ...prev, ...patch }));
  };

  const validateContactStage = (): boolean => {
    if (!contact.name.trim()) {
      toast.error("Please enter your recipient or contact name");
      return false;
    }
    if (!contact.email.trim() || !contact.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!contact.phone.trim()) {
      toast.error("Please enter your contact phone number");
      return false;
    }
    if (fulfillmentType === "delivery") {
      if (!contact.address.trim()) {
        toast.error("Please enter delivery street address");
        return false;
      }
      if (!contact.city.trim()) {
        toast.error("Please enter your delivery city");
        return false;
      }
    }
    return true;
  };

  const validateGiftStage = (): boolean => {
    if (!gift.isGift) return true;
    if (!gift.message.trim()) {
      toast.error("Please write a short gift card message or toggle the gift option off");
      return false;
    }
    if (countWords(gift.message) > MAX_GIFT_NOTE_WORDS) {
      toast.error(
        `Please limit your card note to ${MAX_GIFT_NOTE_WORDS} words so it fits neatly on our cardstock.`
      );
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (stage === 1) {
      setStage(2);
      return;
    }
    if (stage === 2) {
      if (validateContactStage()) setStage(3);
      return;
    }
    if (stage === 3) {
      if (validateGiftStage()) setStage(4);
    }
  };

  const handleBack = () => {
    if (stage > 1) {
      setStage((prev) => (prev - 1) as CheckoutStage);
    }
  };

  const handleConfirm = () => {
    if (!validateContactStage() || !validateGiftStage()) return;

    const compiledGiftMessage = gift.isGift
      ? `${gift.salutation.trim()}\n\n${gift.message.trim()}\n\n${gift.signoff.trim()}`.trim()
      : undefined;

    onConfirmPurchase({
      name: contact.name.trim(),
      email: contact.email.trim(),
      phone: contact.phone.trim(),
      address:
        fulfillmentType === "pickup" ? settings.pickup_address : contact.address.trim(),
      city: fulfillmentType === "pickup" ? "Atelier Pickup" : contact.city.trim(),
      postalCode:
        fulfillmentType === "pickup" ? undefined : contact.postalCode.trim() || undefined,
      deliveryNotes: contact.deliveryNotes.trim() || undefined,
      fulfillmentType,
      isGift: gift.isGift,
      giftCardType: gift.isGift ? gift.selectedCardId : undefined,
      giftMessage: compiledGiftMessage,
      deliveryFee: deliveryFeeNum,
      giftFee: giftFeeNum,
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[92dvh] flex flex-col rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative border-b border-stone-100 bg-stone-50/80 px-6 py-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Close checkout"
            className="absolute top-4 right-5 size-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors shadow-xs cursor-pointer"
          >
            <X size={16} />
          </button>

          <h2 className="font-serif text-xl sm:text-2xl text-neutral-900">
            Order &amp; Atelier Fulfillment
          </h2>
          <StepIndicator
            currentStage={stage}
            onSelectStage={(target) => !isProcessing && setStage(target)}
          />
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
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

          {/* Active Stage Content */}
          {stage === 1 && (
            <FulfillmentStep
              fulfillmentType={fulfillmentType}
              onChangeFulfillment={setFulfillmentType}
              settings={settings}
            />
          )}

          {stage === 2 && (
            <ContactStep
              fulfillmentType={fulfillmentType}
              contact={contact}
              onChange={updateContact}
            />
          )}

          {stage === 3 && (
            <GiftStep
              gift={gift}
              onChange={updateGift}
              settings={settings}
            />
          )}

          {stage === 4 && (
            <OrderPreviewStep
              fulfillmentType={fulfillmentType}
              contact={contact}
              gift={gift}
              settings={settings}
              onEditStage={(target) => setStage(target)}
            />
          )}

          {/* Persistent Price Breakdown Visible in Every Stage */}
          <PriceBreakdown
            productPrice={product.price}
            fulfillmentType={fulfillmentType}
            isGift={gift.isGift}
            settings={settings}
            totalAmount={totalAmount}
          />
        </div>

        {/* Footer Actions */}
        <div className="border-t border-stone-100 bg-stone-50/70 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Secure checkout & satisfaction guaranteed</span>
            </div>
            {process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.startsWith("rzp_test_") && (
              <p className="text-[10px] text-amber-700">
                Sandbox Mode: Use test card <code className="font-mono bg-amber-100/70 px-1 rounded">4012 0000 0000 0002</code> or test UPI/Netbanking.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto">
            {stage === 1 ? (
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="rounded-full px-4 py-2.5 text-xs font-medium text-neutral-600 hover:bg-stone-200/60 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={handleBack}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2.5 text-xs font-medium text-neutral-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Back</span>
              </button>
            )}

            {stage < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-6 py-2.5 text-xs font-medium text-white hover:bg-neutral-800 transition-all shadow-md cursor-pointer"
              >
                <span>{stage === 3 ? "Preview Order" : "Continue"}</span>
                <ArrowRight size={13} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isProcessing}
                className="rounded-full bg-neutral-900 px-6 py-2.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50 transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <span>Confirm &amp; Pay {formatPrice(totalAmount)}</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
