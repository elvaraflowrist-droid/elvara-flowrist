import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { completeOrderPayment } from "@/lib/order-lifecycle";

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isDemo } = await req.json();

    if (!razorpay_order_id) {
      return NextResponse.json({ error: "Missing required order ID" }, { status: 400 });
    }

    const isDemoOrder = isDemo || razorpay_order_id.startsWith("order_demo_");

    // Handle demo payment confirmation
    if (isDemoOrder) {
      const demoPaymentId = razorpay_payment_id || `pay_demo_${Date.now()}`;
      await completeOrderPayment(razorpay_order_id, demoPaymentId);
      return NextResponse.json({ success: true, isDemo: true });
    }

    if (!razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required payment fields" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Razorpay secret not configured" }, { status: 500 });
    }

    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Payment is authentic and verified -> update order in database
    await completeOrderPayment(razorpay_order_id, razorpay_payment_id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error verifying Razorpay payment:", error);
    return NextResponse.json({ error: error?.message || "Failed to verify payment" }, { status: 500 });
  }
}
