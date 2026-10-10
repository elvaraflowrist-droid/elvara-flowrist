import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { db } from "@/db/drizzle";
import { ordersTable, productsTable, systemSettingsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const body = await req.json();
    const postId = body.postId || body.productId;

    if (!postId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Fetch product to retrieve price
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, postId))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Please sign in to place a floral order", requiresAuth: true },
        { status: 401 }
      );
    }

    // Fetch current system settings for delivery and gift fees
    const settings = await db.select().from(systemSettingsTable);
    const settingsMap: Record<string, string> = {
      delivery_fee: "150.00",
      gift_price: "100.00",
    };
    for (const item of settings) {
      settingsMap[item.key] = item.value;
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      city,
      postalCode,
      deliveryNotes,
      fulfillmentType = "delivery",
      isGift = false,
      giftCardType = null,
      giftMessage = null,
    } = body;

    const basePriceNum = product.price ? parseFloat(product.price) : 0;
    const deliveryFeeNum = fulfillmentType === "pickup" ? 0 : parseFloat(settingsMap["delivery_fee"] || "150.00");
    const giftFeeNum = isGift ? parseFloat(settingsMap["gift_price"] || "100.00") : 0;
    const totalAmountNum = basePriceNum + deliveryFeeNum + giftFeeNum;
    const amountInSmallestUnit = Math.round(totalAmountNum * 100);

    if (amountInSmallestUnit <= 0) {
      return NextResponse.json({ error: "Invalid price for checkout" }, { status: 400 });
    }

    const isDemoMode =
      !process.env.RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET ||
      process.env.RAZORPAY_KEY_ID.includes("xxxxxx");

    // Demo Mode Checkout: Generates verified orders without needing merchant keys
    if (isDemoMode) {
      const demoOrderId = `order_demo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

      await db.insert(ordersTable).values({
        id: demoOrderId,
        userId: session.user.id,
        postId: product.id,
        amount: totalAmountNum.toFixed(2),
        status: "created",
        customerName: customerName || session.user.name || null,
        customerEmail: customerEmail || session.user.email || null,
        customerPhone: customerPhone || null,
        shippingAddress: fulfillmentType === "pickup" ? "Self Collection / Atelier Pickup" : (shippingAddress || null),
        city: fulfillmentType === "pickup" ? "Atelier Pickup" : (city || null),
        postalCode: postalCode || null,
        deliveryNotes: deliveryNotes || null,
        fulfillmentType: fulfillmentType === "pickup" ? "pickup" : "delivery",
        isGift: Boolean(isGift),
        giftCardType: isGift ? (giftCardType || "vintage-botanical") : null,
        giftMessage: isGift ? (giftMessage || null) : null,
        deliveryFee: deliveryFeeNum.toFixed(2),
        giftFee: giftFeeNum.toFixed(2),
      });

      return NextResponse.json({
        isDemo: true,
        orderId: demoOrderId,
        amount: amountInSmallestUnit,
        currency: "INR",
        productTitle: product.title,
      });
    }

    // Initialize Razorpay SDK if keys are configured
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const currency = process.env.RAZORPAY_CURRENCY || "INR";
    const options = {
      amount: amountInSmallestUnit,
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Save order record in database
    await db.insert(ordersTable).values({
      id: order.id,
      userId: session?.user?.id || null,
      postId: product.id,
      amount: totalAmountNum.toFixed(2),
      status: "created",
      customerName: customerName || session.user.name || null,
      customerEmail: customerEmail || session.user.email || null,
      customerPhone: customerPhone || null,
      shippingAddress: fulfillmentType === "pickup" ? "Self Collection / Atelier Pickup" : (shippingAddress || null),
      city: fulfillmentType === "pickup" ? "Atelier Pickup" : (city || null),
      postalCode: postalCode || null,
      deliveryNotes: deliveryNotes || null,
      fulfillmentType: fulfillmentType === "pickup" ? "pickup" : "delivery",
      isGift: Boolean(isGift),
      giftCardType: isGift ? (giftCardType || "vintage-botanical") : null,
      giftMessage: isGift ? (giftMessage || null) : null,
      deliveryFee: deliveryFeeNum.toFixed(2),
      giftFee: giftFeeNum.toFixed(2),
    });

    return NextResponse.json({
      orderId: order.id,
      amount: options.amount,
      currency: options.currency,
    });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
