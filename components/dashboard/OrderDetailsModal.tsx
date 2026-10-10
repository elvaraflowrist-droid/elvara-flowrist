"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ExternalLink,
  CheckCircle2,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Store,
  Truck,
  Gift,
  Printer
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatPrice, formatDate, getActiveThumbnail } from "@/lib/utils";
import GiftCardWriter from "@/components/GiftCardWriter";
import { PurchaseItem } from "./types";

interface OrderDetailsModalProps {
  order: PurchaseItem | null;
  userIsAdmin?: boolean;
  onClose: () => void;
}

export default function OrderDetailsModal({
  order,
  userIsAdmin = false,
  onClose,
}: OrderDetailsModalProps) {
  if (!order) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto z-10 space-y-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium mb-2">
                <CheckCircle2 size={12} />
                <span>Payment Completed</span>
                {userIsAdmin && (
                  <span className="text-emerald-800 font-semibold">• Ready for Delivery</span>
                )}
              </div>
              <h3 className="font-serif text-2xl text-neutral-900">
                {userIsAdmin ? "Order & Delivery Slip" : "Order Details"}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Placed on {formatDate(order.purchasedAt)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Product Info Card */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
            <div className="relative size-16 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
              <Image
                src={getActiveThumbnail(order)}
                alt={order.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-serif text-base font-semibold text-neutral-900 truncate">
                {order.title}
              </h4>
              <p className="text-xs text-stone-500 capitalize">
                {order.aspect || "Bespoke Floral Craft"}
              </p>
              <span className="font-serif text-sm font-semibold text-neutral-900 mt-1 block">
                {formatPrice(order.amount)}
              </span>
            </div>
            <Link
              href={`/products/${order.postId}`}
              target="_blank"
              className="text-stone-400 hover:text-neutral-900 p-2"
              title="View Floral Offering"
            >
              <ExternalLink size={16} />
            </Link>
          </div>

          {/* Fulfillment & Recipient Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Fulfillment &amp; Recipient
              </h4>
              <div className="flex items-center gap-1.5 flex-wrap">
                {order.fulfillmentType === "pickup" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                    <Store size={10} />
                    <span>Self Collection</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-800 border border-stone-200">
                    <Truck size={10} />
                    <span>Courier Delivery</span>
                  </span>
                )}

                {order.isGift && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                    <Gift size={10} />
                    <span>Gift Wrapped + Cute Bag</span>
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200/80 p-4 space-y-3 text-xs text-stone-700 bg-white">
              <div className="flex items-center gap-2.5">
                <User size={14} className="text-stone-400 shrink-0" />
                <div>
                  <span className="text-stone-400 text-[10px] uppercase tracking-wider block">
                    {order.fulfillmentType === "pickup" ? "Collector Name" : "Recipient Name"}
                  </span>
                  <span className="font-medium text-neutral-900">
                    {order.customerName || order.accountName || "Patron"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone size={14} className="text-stone-400 shrink-0" />
                <div>
                  <span className="text-stone-400 text-[10px] uppercase tracking-wider block">Phone Contact</span>
                  {order.customerPhone ? (
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="font-medium text-amber-900 hover:underline"
                    >
                      {order.customerPhone}
                    </a>
                  ) : (
                    <span className="font-medium text-neutral-500">Not specified</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail size={14} className="text-stone-400 shrink-0" />
                <div>
                  <span className="text-stone-400 text-[10px] uppercase tracking-wider block">Email</span>
                  <span className="font-medium text-neutral-900">
                    {order.customerEmail || order.accountEmail || "Not specified"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-1 border-t border-stone-100">
                <MapPin size={14} className="text-stone-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-400 text-[10px] uppercase tracking-wider block">
                    {order.fulfillmentType === "pickup" ? "Collection Atelier Address" : "Delivery Destination"}
                  </span>
                  <span className="font-medium text-neutral-900 leading-relaxed block">
                    {order.fulfillmentType === "pickup" ? (
                      "Elvara Floral Atelier, Road No. 36, Jubilee Hills, Hyderabad 500033"
                    ) : order.shippingAddress ? (
                      <>
                        {order.shippingAddress}
                        {order.city ? `, ${order.city}` : ""}
                        {order.postalCode ? ` - ${order.postalCode}` : ""}
                      </>
                    ) : (
                      "Atelier Handover / Studio Pickup"
                    )}
                  </span>
                </div>
              </div>

              {order.deliveryNotes && (
                <div className="pt-2 border-t border-stone-100">
                  <span className="text-stone-400 text-[10px] uppercase tracking-wider block mb-1">
                    Special Instructions / Notes
                  </span>
                  <p className="text-xs text-stone-700 italic bg-stone-50 p-2.5 rounded-xl border border-stone-200/50">
                    &ldquo;{order.deliveryNotes}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Handcrafted Gift Card Note (If Present) */}
          {order.isGift && order.giftMessage && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                  <Gift size={13} className="text-rose-600" />
                  <span>Handcrafted Physical Letter &amp; Bag</span>
                </h4>
                <span className="text-[11px] text-stone-500 font-medium">
                  Theme: {order.giftCardType || "vintage-botanical"}
                </span>
              </div>

              <div className="rounded-2xl border border-rose-200/60 p-4 bg-rose-50/30 space-y-3">
                <p className="text-xs text-rose-900/90 leading-relaxed">
                  <strong>Packaging:</strong> Signature arrangement gift wrap with satin ribbon nestled in our reusable botanical tote bag.
                </p>

                <GiftCardWriter
                  selectedCardId={order.giftCardType || "vintage-botanical"}
                  onSelectCardId={() => {}}
                  message={order.giftMessage}
                  onChangeMessage={() => {}}
                  readOnly={true}
                />
              </div>
            </div>
          )}

          {/* Payment & Order Reference */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Payment Reference
            </h4>
            <div className="rounded-2xl border border-stone-200/80 p-4 space-y-2.5 text-xs text-stone-700 bg-stone-50/50">
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Order ID:</span>
                <span className="font-mono text-[11px] text-stone-800 font-medium">
                  {order.orderId}
                </span>
              </div>
              {order.paymentId && (
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Payment Reference:</span>
                  <span className="font-mono text-[11px] text-stone-800 font-medium">
                    {order.paymentId}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-stone-200/60 space-y-1.5">
                <div className="flex justify-between items-center text-stone-500">
                  <span>Arrangement:</span>
                  <span className="font-medium text-stone-700">{formatPrice(order.price)}</span>
                </div>
                <div className="flex justify-between items-center text-stone-500">
                  <span>
                    Fulfillment ({order.fulfillmentType === "pickup" ? "Studio Pickup" : "Courier Delivery"}):
                  </span>
                  <span className="font-medium text-stone-700">
                    {order.fulfillmentType === "pickup"
                      ? "FREE (₹0)"
                      : order.deliveryFee
                      ? `+${formatPrice(order.deliveryFee)}`
                      : "+₹150.00"}
                  </span>
                </div>
                {order.isGift && (
                  <div className="flex justify-between items-center text-rose-800">
                    <span>Gift Bag &amp; Printed Card:</span>
                    <span className="font-medium">
                      {order.giftFee ? `+${formatPrice(order.giftFee)}` : "+₹100.00"}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-stone-200/60 font-medium">
                <span className="text-neutral-900 font-semibold">Total Paid:</span>
                <span className="font-serif text-base text-neutral-900 font-semibold">
                  {formatPrice(order.amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-stone-200 bg-white text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              <Printer size={13} />
              <span>{userIsAdmin ? "Print Packing Slip" : "Print Receipt"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-neutral-900 text-xs font-medium text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
