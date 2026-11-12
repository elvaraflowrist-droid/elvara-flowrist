import { formatPrice } from "@/lib/utils";
import { StoreSettings } from "./types";

interface PriceBreakdownProps {
  productPrice?: string | number | null;
  fulfillmentType: "delivery" | "pickup";
  isGift: boolean;
  settings: StoreSettings;
  totalAmount: number;
}

export default function PriceBreakdown({
  productPrice,
  fulfillmentType,
  isGift,
  settings,
  totalAmount,
}: PriceBreakdownProps) {
  return (
    <div className="rounded-2xl bg-stone-50 p-4 border border-stone-200/70 space-y-2 text-xs">
      <div className="flex items-center justify-between text-stone-600">
        <span>Botanical Arrangement</span>
        <span className="font-medium text-neutral-900">{formatPrice(productPrice)}</span>
      </div>

      <div className="flex items-center justify-between text-stone-600">
        <span>
          Fulfillment (
          <span className="font-medium text-neutral-800">
            {fulfillmentType === "delivery" ? "Courier Delivery" : "Self-Collection"}
          </span>
          )
        </span>
        <span className="font-medium text-neutral-900">
          {fulfillmentType === "delivery" ? `+${formatPrice(settings.delivery_fee)}` : "FREE"}
        </span>
      </div>

      {isGift && (
        <div className="flex items-center justify-between text-rose-800 font-medium">
          <span>Gift Bag &amp; Handcrafted Card</span>
          <span>+{formatPrice(settings.gift_price)}</span>
        </div>
      )}

      <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between font-serif text-sm font-semibold text-neutral-900">
        <span>Total Payable</span>
        <span className="text-base text-neutral-900">{formatPrice(totalAmount)}</span>
      </div>
    </div>
  );
}

