"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export type PaymentStatus = "idle" | "processing" | "success" | "failed";

export interface CustomerInfo {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  deliveryNotes?: string;
  fulfillmentType?: "delivery" | "pickup";
  isGift?: boolean;
  giftCardType?: string;
  giftMessage?: string;
  deliveryFee?: number;
  giftFee?: number;
}

interface UseRazorpayOptions {
  onSuccess?: () => void;
  brandName?: string;
  themeColor?: string;
}

/**
 * Dynamically loads the Razorpay checkout script if not present
 */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Shared hook for Razorpay checkout and verification flow.
 */
export function useRazorpay(options?: UseRazorpayOptions) {
  const [statusMap, setStatusMap] = useState<Record<string, PaymentStatus>>({});
  const queryClient = useQueryClient();

  const getStatus = useCallback(
    (postId: string): PaymentStatus => {
      return statusMap[postId] || "idle";
    },
    [statusMap]
  );

  const setStatus = useCallback((postId: string, status: PaymentStatus) => {
    setStatusMap((prev) => ({ ...prev, [postId]: status }));
  }, []);

  const resetStatusAfterDelay = useCallback(
    (postId: string, delayMs = 3000) => {
      setTimeout(() => setStatus(postId, "idle"), delayMs);
    },
    [setStatus]
  );

  const initiatePurchase = useCallback(
    async (
      item: { id: string; title: string; price?: string | number | null },
      customerInfo?: CustomerInfo
    ) => {
      if (!item.price || parseFloat(item.price.toString()) <= 0) return;

      const itemId = item.id;
      setStatus(itemId, "processing");

      try {
        const res = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postId: itemId,
            customerName: customerInfo?.name,
            customerEmail: customerInfo?.email,
            customerPhone: customerInfo?.phone,
            shippingAddress: customerInfo?.address,
            city: customerInfo?.city,
            postalCode: customerInfo?.postalCode,
            deliveryNotes: customerInfo?.deliveryNotes,
            fulfillmentType: customerInfo?.fulfillmentType,
            isGift: customerInfo?.isGift,
            giftCardType: customerInfo?.giftCardType,
            giftMessage: customerInfo?.giftMessage,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          if (res.status === 401 || data.requiresAuth) {
            toast.error("Please sign in first to place your order.");
          } else {
            toast.error(data.error || "Failed to initialize order");
          }
          setStatus(itemId, "failed");
          resetStatusAfterDelay(itemId);
          return;
        }

        // Demo Flow (Works even without active merchant keys or when deployed)
        if (data.isDemo) {
          const verifyRes = await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: data.orderId,
              isDemo: true,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            setStatus(itemId, "success");
            toast.success("Order placed successfully! Recorded in Orders & Purchases.");
            queryClient.invalidateQueries({ queryKey: ["user-purchases"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
            options?.onSuccess?.();
          } else {
            setStatus(itemId, "failed");
            toast.error("Demo checkout verification failed.");
            resetStatusAfterDelay(itemId);
          }
          return;
        }

        // Production Razorpay Flow
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          toast.error("Failed to load payment gateway SDK");
          setStatus(itemId, "failed");
          resetStatusAfterDelay(itemId);
          return;
        }

        const rzpOptions = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: data.currency,
          name: options?.brandName || "Elvara Florist",
          description: item.title,
          order_id: data.orderId,
          handler: async function (response: any) {
            try {
              const verifyRes = await fetch("/api/razorpay/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) {
                setStatus(itemId, "success");
                toast.success("Payment successful! Your order has been placed.");
                queryClient.invalidateQueries({ queryKey: ["user-purchases"] });
                queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
                options?.onSuccess?.();
              } else {
                setStatus(itemId, "failed");
                toast.error("Payment verification failed.");
                resetStatusAfterDelay(itemId);
              }
            } catch {
              setStatus(itemId, "failed");
              toast.error("Error verifying payment");
              resetStatusAfterDelay(itemId);
            }
          },
          modal: {
            ondismiss: function () {
              setStatus(itemId, "idle");
            },
          },
          theme: {
            color: options?.themeColor || "#171717",
          },
        };

        const rzp = new (window as any).Razorpay(rzpOptions);
        rzp.on("payment.failed", function (resp: any) {
          setStatus(itemId, "failed");
          toast.error(resp?.error?.description || "Payment failed");
          resetStatusAfterDelay(itemId);
        });
        rzp.open();
      } catch (err) {
        console.error(err);
        setStatus(itemId, "failed");
        toast.error("An unexpected error occurred during checkout");
        resetStatusAfterDelay(itemId);
      }
    },
    [setStatus, resetStatusAfterDelay, options, queryClient]
  );

  return { initiatePurchase, getStatus, setStatus };
}
