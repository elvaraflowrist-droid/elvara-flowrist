import { Truck, Store, CheckCircle2, MapPin, Clock } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { StoreSettings } from "./types";

interface FulfillmentStepProps {
  fulfillmentType: "delivery" | "pickup";
  onChangeFulfillment: (type: "delivery" | "pickup") => void;
  settings: StoreSettings;
}

export default function FulfillmentStep({
  fulfillmentType,
  onChangeFulfillment,
  settings,
}: FulfillmentStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-800">
          Choose Fulfillment Method
        </label>
        <span className="text-[11px] text-stone-500">
          {fulfillmentType === "delivery" ? "Courier to door" : "Complimentary studio pickup"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChangeFulfillment("delivery")}
          className={`relative flex flex-col p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            fulfillmentType === "delivery"
              ? "border-neutral-900 bg-stone-50/90 ring-1 ring-neutral-900 shadow-xs"
              : "border-stone-200 hover:border-stone-300 bg-white"
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <div className="flex items-center gap-2">
              <Truck
                size={17}
                className={fulfillmentType === "delivery" ? "text-neutral-900" : "text-stone-400"}
              />
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

        <button
          type="button"
          onClick={() => onChangeFulfillment("pickup")}
          className={`relative flex flex-col p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            fulfillmentType === "pickup"
              ? "border-neutral-900 bg-stone-50/90 ring-1 ring-neutral-900 shadow-xs"
              : "border-stone-200 hover:border-stone-300 bg-white"
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <div className="flex items-center gap-2">
              <Store
                size={17}
                className={fulfillmentType === "pickup" ? "text-neutral-900" : "text-stone-400"}
              />
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
            Your flowers will be kept in our temperature-controlled botanical cold room until you arrive.
          </p>
        </div>
      )}
    </div>
  );
}

