import { Truck, Store, User, MapPin, Gift, Edit2 } from "lucide-react";
import GiftCardWriter, { CARD_THEMES } from "@/components/GiftCardWriter";
import { CheckoutStage, ContactDetails, GiftDetails, StoreSettings } from "./types";

interface OrderPreviewStepProps {
  fulfillmentType: "delivery" | "pickup";
  contact: ContactDetails;
  gift: GiftDetails;
  settings: StoreSettings;
  onEditStage: (stage: CheckoutStage) => void;
}

export default function OrderPreviewStep({
  fulfillmentType,
  contact,
  gift,
  settings,
  onEditStage,
}: OrderPreviewStepProps) {
  const selectedTheme =
    CARD_THEMES.find((t) => t.id === gift.selectedCardId) || CARD_THEMES[0];

  const compiledMessage = `${gift.salutation.trim()}\n\n${gift.message.trim()}\n\n${gift.signoff.trim()}`.trim();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-stone-100 pb-2">
        <h3 className="font-serif text-base font-semibold text-neutral-900">
          Review &amp; Confirm Your Details
        </h3>
        <span className="text-[11px] text-stone-500">Verify everything before payment</span>
      </div>

      {/* 1. Fulfillment Summary */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-4 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
            {fulfillmentType === "pickup" ? <Store size={13} /> : <Truck size={13} />}
            <span>Fulfillment</span>
          </span>
          <button
            type="button"
            onClick={() => onEditStage(1)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 hover:text-neutral-900 cursor-pointer"
          >
            <Edit2 size={11} />
            <span>Edit</span>
          </button>
        </div>

        <p className="text-xs font-semibold text-neutral-900">
          {fulfillmentType === "pickup"
            ? "Self Collection at Elvara Atelier"
            : "White-Glove Courier Delivery"}
        </p>
        <p className="text-xs text-stone-600 flex items-start gap-1.5">
          <MapPin size={13} className="text-stone-400 shrink-0 mt-0.5" />
          <span>
            {fulfillmentType === "pickup"
              ? settings.pickup_address
              : `${contact.address}, ${contact.city}${contact.postalCode ? ` - ${contact.postalCode}` : ""}`}
          </span>
        </p>
      </div>

      {/* 2. Contact Summary */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-4 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
            <User size={13} />
            <span>{fulfillmentType === "pickup" ? "Collector" : "Recipient"}</span>
          </span>
          <button
            type="button"
            onClick={() => onEditStage(2)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 hover:text-neutral-900 cursor-pointer"
          >
            <Edit2 size={11} />
            <span>Edit</span>
          </button>
        </div>

        <p className="text-xs font-semibold text-neutral-900">{contact.name}</p>
        <p className="text-xs text-stone-600">
          {contact.phone} • {contact.email}
        </p>
        {contact.deliveryNotes.trim() && (
          <p className="text-[11px] text-amber-900 bg-amber-50/70 border border-amber-200/60 rounded-lg px-2.5 py-1.5 italic mt-1">
            Note: &ldquo;{contact.deliveryNotes}&rdquo;
          </p>
        )}
      </div>

      {/* 3. Gift Note Summary */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
            <Gift size={13} />
            <span>Gift Packaging &amp; Note</span>
          </span>
          <button
            type="button"
            onClick={() => onEditStage(3)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 hover:text-neutral-900 cursor-pointer"
          >
            <Edit2 size={11} />
            <span>Edit</span>
          </button>
        </div>

        {gift.isGift ? (
          <div className="space-y-3">
            <p className="text-xs text-stone-700">
              Style: <span className="font-semibold text-neutral-900">{selectedTheme.name}</span>{" "}
              <span className="text-stone-500">({selectedTheme.occasion})</span>
            </p>
            <GiftCardWriter
              selectedCardId={gift.selectedCardId}
              onSelectCardId={() => {}}
              message={compiledMessage}
              onChangeMessage={() => {}}
              readOnly={true}
              hidePrintButton={true}
            />
          </div>
        ) : (
          <p className="text-xs text-stone-500">Standard atelier wrapping (no gift card).</p>
        )}
      </div>
    </div>
  );
}

