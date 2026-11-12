import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { completeOrderPayment } from "@/lib/order-lifecycle";
import { db } from "@/db/drizzle";
import { ordersTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!webhookSecret) {
      console.error("[Razorpay Webhook] Webhook secret / Key secret not configured in env.");
      return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
    }

    if (!signature) {
      console.warn("[Razorpay Webhook] Missing x-razorpay-signature header.");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Cryptographic validation of webhook payload
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.warn("[Razorpay Webhook] Invalid signature rejected.");
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    console.log(`[Razorpay Webhook] Received valid event: ${eventType}`);

    // 1. Order Paid / Payment Captured (Guarantees customer gets their order even if browser closed)
    if (eventType === "order.paid" || eventType === "payment.captured") {
      const orderId =
        event.payload?.order?.entity?.id ||
        event.payload?.payment?.entity?.order_id;
      const paymentId =
        event.payload?.payment?.entity?.id ||
        `pay_webhook_${Date.now()}`;

      if (orderId) {
        const result = await completeOrderPayment(orderId, paymentId);
        console.log(`[Razorpay Webhook] Payment completion handled for ${orderId}:`, result);
      }
    }

    // 2. Payment Failed
    else if (eventType === "payment.failed") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const failureReason =
        paymentEntity?.error_description ||
        paymentEntity?.error_reason ||
        "Payment declined by bank or card issuer";

      if (orderId) {
        // Only update if order is still pending (never overwrite an already paid order)
        await db
          .update(ordersTable)
          .set({
            status: "failed",
            failureReason: failureReason,
            updatedAt: new Date(),
          })
          .where(and(eq(ordersTable.id, orderId), eq(ordersTable.status, "pending")));

        console.log(`[Razorpay Webhook] Order ${orderId} marked as failed: ${failureReason}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Razorpay Webhook] Internal webhook processing error:", error);
    return NextResponse.json({ error: error?.message || "Webhook handling failed" }, { status: 500 });
  }
}
