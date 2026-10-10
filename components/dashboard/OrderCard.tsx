import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Truck,
  Store,
  Gift,
  CheckCircle2,
  MapPin,
  FileText
} from "lucide-react";
import { formatPrice, formatDate, getActiveThumbnail } from "@/lib/utils";
import { PurchaseItem } from "./types";

interface OrderCardProps {
  purchase: PurchaseItem;
  userIsAdmin?: boolean;
  adminViewMode?: "all" | "mine";
  onSelect: (order: PurchaseItem) => void;
}

export default function OrderCard({
  purchase,
  userIsAdmin = false,
  adminViewMode = "mine",
  onSelect,
}: OrderCardProps) {
  const thumb = getActiveThumbnail(purchase);
  const recipientName = purchase.customerName || purchase.accountName || "Patron";

  return (
    <div className="rounded-3xl bg-white border border-stone-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition-all hover:border-stone-300">
      <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto">
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

            {purchase.fulfillmentType === "pickup" ? (
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
                <span>Gift Wrapped + Cute Bag</span>
              </span>
            )}

            {userIsAdmin && adminViewMode === "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                <CheckCircle2 size={10} />
                <span>Paid Order</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
            <span className="flex items-center gap-1">
              <Calendar size={13} />
              {formatDate(purchase.purchasedAt)}
            </span>
            <span>•</span>
            <span className="font-mono text-[11px] text-stone-400">
              {purchase.orderId.slice(0, 13)}...
            </span>
          </div>

          {/* Recipient & Delivery Details */}
          {(purchase.customerName || purchase.shippingAddress || purchase.accountName) && (
            <div className="text-[11px] text-stone-600 pt-1 space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-stone-800">
                  {purchase.fulfillmentType === "pickup" ? "Collector:" : "Recipient:"}
                </span>
                <span className="font-medium text-neutral-900">{recipientName}</span>
                {purchase.customerPhone && (
                  <a
                    href={`tel:${purchase.customerPhone}`}
                    className="text-amber-900 hover:underline font-medium"
                  >
                    • Ph: {purchase.customerPhone}
                  </a>
                )}
                {purchase.customerEmail && (
                  <span className="text-stone-400 truncate max-w-[200px]">
                    • {purchase.customerEmail}
                  </span>
                )}
              </div>

              {purchase.fulfillmentType === "pickup" ? (
                <div className="flex items-start gap-1 text-amber-900/90 font-medium">
                  <Store size={12} className="text-amber-700 shrink-0 mt-0.5" />
                  <span>Pickup at Atelier: Road No. 36, Jubilee Hills, Hyderabad</span>
                </div>
              ) : (
                purchase.shippingAddress && (
                  <div className="flex items-start gap-1 text-stone-500">
                    <MapPin size={12} className="text-stone-400 shrink-0 mt-0.5" />
                    <span className="leading-snug">
                      {purchase.shippingAddress}
                      {purchase.city ? `, ${purchase.city}` : ""}
                      {purchase.postalCode ? ` - ${purchase.postalCode}` : ""}
                    </span>
                  </div>
                )
              )}

              {purchase.isGift && purchase.giftMessage && (
                <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] bg-rose-50 border border-rose-200/80 text-rose-900 rounded-xl px-2.5 py-1 max-w-xl">
                  <Gift size={12} className="text-rose-600 shrink-0" />
                  <span className="font-medium">Handcrafted Printed Card Note Included</span>
                </div>
              )}

              {purchase.deliveryNotes && (
                <div className="mt-1.5 inline-flex items-start gap-1.5 text-[11px] bg-amber-50/80 border border-amber-200/60 text-amber-900 rounded-xl px-2.5 py-1 max-w-xl">
                  <FileText size={12} className="text-amber-700 shrink-0 mt-0.5" />
                  <span className="italic leading-tight">
                    &ldquo;{purchase.deliveryNotes}&rdquo;
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
        <div className="text-right">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium block">
            Paid Total
          </span>
          <span className="font-serif text-lg font-medium text-neutral-900">
            {formatPrice(purchase.amount)}
          </span>
        </div>

        <button
          onClick={() => onSelect(purchase)}
          className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-stone-100 hover:border-stone-300 transition-all cursor-pointer shadow-2xs"
          title="View Full Order & Delivery Details"
        >
          <FileText size={13} className="text-stone-500" />
          <span>{userIsAdmin ? "Dispatch Details" : "Order Details"}</span>
        </button>
      </div>
    </div>
  );
}
