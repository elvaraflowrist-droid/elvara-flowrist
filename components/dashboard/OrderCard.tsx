import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Truck,
  Store,
  Gift,
  MapPin,
  FileText,
  Printer,
} from "lucide-react";
import { formatPrice, formatDate, getActiveThumbnail } from "@/lib/utils";
import { PurchaseItem } from "./types";

interface OrderCardProps {
  purchase: PurchaseItem;
  userIsAdmin?: boolean;
  onSelect: (order: PurchaseItem) => void;
  onPrintGiftCard?: (order: PurchaseItem) => void;
}

export default function OrderCard({
  purchase,
  userIsAdmin = false,
  onSelect,
  onPrintGiftCard,
}: OrderCardProps) {
  const thumb = getActiveThumbnail(purchase);
  const recipientName = purchase.customerName || purchase.accountName || "Patron";
  const isPickup = purchase.fulfillmentType === "pickup";
  const hasPrintableGiftCard = Boolean(purchase.isGift && purchase.giftMessage);

  return (
    <div className="rounded-3xl bg-white border border-stone-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition-all hover:border-stone-300">
      <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto min-w-0">
        <div className="relative size-20 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-100">
          <Image
            src={thumb}
            alt={purchase.title}
            fill
            className="object-cover"
          />
        </div>

        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/products/${purchase.postId}`}
              className="font-serif text-lg font-medium text-neutral-900 hover:text-neutral-600 transition-colors line-clamp-1"
            >
              {purchase.title}
            </Link>

            {isPickup ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200/80 shrink-0">
                <Store size={10} />
                <span>Self Collection</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200 shrink-0">
                <Truck size={10} />
                <span>Courier Delivery</span>
              </span>
            )}

            {purchase.isGift && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 shrink-0">
                <Gift size={10} />
                <span>Gift Card</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs text-neutral-500">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(purchase.purchasedAt)}
            </span>
            <span>•</span>
            <span className="font-medium text-neutral-800">{recipientName}</span>
            {purchase.customerPhone && (
              <a
                href={`tel:${purchase.customerPhone}`}
                className="text-amber-900 hover:underline font-medium"
              >
                • {purchase.customerPhone}
              </a>
            )}
          </div>

          {isPickup ? (
            <div className="flex items-center gap-1 text-[11px] text-amber-900/90 font-medium">
              <Store size={12} className="text-amber-700 shrink-0" />
              <span>Atelier Pickup • Road No. 36, Jubilee Hills</span>
            </div>
          ) : (
            purchase.shippingAddress && (
              <div className="flex items-start gap-1 text-[11px] text-stone-500">
                <MapPin size={12} className="text-stone-400 shrink-0 mt-0.5" />
                <span className="leading-snug line-clamp-1">
                  {purchase.shippingAddress}
                  {purchase.city ? `, ${purchase.city}` : ""}
                  {purchase.postalCode ? ` - ${purchase.postalCode}` : ""}
                </span>
              </div>
            )
          )}

          {purchase.deliveryNotes && (
            <p className="text-[11px] text-amber-900 bg-amber-50/70 border border-amber-200/60 rounded-lg px-2.5 py-1 inline-block italic line-clamp-1">
              &ldquo;{purchase.deliveryNotes}&rdquo;
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100 shrink-0">
        <div className="text-left sm:text-right mr-1">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium block">
            Total
          </span>
          <span className="font-serif text-lg font-medium text-neutral-900">
            {formatPrice(purchase.amount)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {userIsAdmin && hasPrintableGiftCard && onPrintGiftCard && (
            <button
              type="button"
              onClick={() => onPrintGiftCard(purchase)}
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-medium text-rose-900 hover:bg-rose-100 transition-all cursor-pointer shadow-2xs"
              title="Print Gift Card"
            >
              <Printer size={13} />
              <span>Print Card</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onSelect(purchase)}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-stone-100 hover:border-stone-300 transition-all cursor-pointer shadow-2xs"
            title="View Full Order & Delivery Details"
          >
            <FileText size={13} className="text-stone-500" />
            <span>{userIsAdmin ? "Details" : "Order Details"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
