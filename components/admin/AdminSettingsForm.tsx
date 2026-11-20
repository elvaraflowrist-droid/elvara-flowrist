"use client";

import { Truck, Gift, Store, Check, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface AdminSettingsFormProps {
  deliveryFee: string;
  onDeliveryFeeChange: (val: string) => void;
  giftPrice: string;
  onGiftPriceChange: (val: string) => void;
  pickupAddress: string;
  onPickupAddressChange: (val: string) => void;
  pickupHours: string;
  onPickupHoursChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSaving: boolean;
}

export default function AdminSettingsForm({
  deliveryFee,
  onDeliveryFeeChange,
  giftPrice,
  onGiftPriceChange,
  pickupAddress,
  onPickupHoursChange,
  pickupHours,
  onPickupAddressChange,
  onSubmit,
  isSaving,
}: AdminSettingsFormProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <form
        id="admin-settings-form"
        onSubmit={onSubmit}
        className="rounded-3xl bg-white border border-stone-200/80 shadow-xs p-6 sm:p-8 space-y-8"
      >
        <div>
          <h3 className="font-serif text-2xl text-neutral-900">
            Store Fulfillment & Gifting Configuration
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-2xl">
            Control the home courier delivery charge, gift packaging &amp; handwritten letter pricing,
            and atelier collection details in real time. Changes take effect on the checkout flow immediately.
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
                Current: {formatPrice(deliveryFee)}
              </span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Set the flat delivery charge for refrigerated courier shipping to the customer&apos;s doorstep.
              You can adjust this anytime as local courier or fuel charges change.
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
                  value={deliveryFee}
                  onChange={(e) => onDeliveryFeeChange(e.target.value)}
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
                Current: {formatPrice(giftPrice)}
              </span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Covers our signature floral packaging, the cute reusable botanical tote bag, satin ribbon wrap,
              and high-GSM physical print cardstock matching the user&apos;s chosen card aesthetic.
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
                  value={giftPrice}
                  onChange={(e) => onGiftPriceChange(e.target.value)}
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
            Patrons selecting Self-Collection do not pay a delivery fee ($0.00). Specify your exact studio
            pickup address and daily operating hours so customers know when and where to collect their arrangements.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                Atelier Studio Address *
              </label>
              <input
                type="text"
                required
                value={pickupAddress}
                onChange={(e) => onPickupAddressChange(e.target.value)}
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
                value={pickupHours}
                onChange={(e) => onPickupHoursChange(e.target.value)}
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
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-2.5 text-xs font-medium text-white hover:bg-neutral-800 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
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
  );
}
