import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { ordersTable, productsTable, user } from "@/db/schema";
import { auth, isConfiguredAdminEmail } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = Boolean(session.user.isAdmin || isConfiguredAdminEmail(session.user.email));

    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view"); // 'all' | 'mine'

    // If admin and not explicitly requesting 'mine', fetch all paid customer orders for delivery
    const shouldFetchAll = isAdmin && view !== "mine";

    const whereCondition = shouldFetchAll
      ? eq(ordersTable.status, "paid")
      : and(
          eq(ordersTable.userId, session.user.id),
          eq(ordersTable.status, "paid")
        );

    // Join orders (status = 'paid') with products and user to return purchased items & customer info
    const purchases = await db
      .select({
        orderId: ordersTable.id,
        paymentId: ordersTable.paymentId,
        amount: ordersTable.amount,
        purchasedAt: ordersTable.createdAt,
        postId: productsTable.id,
        title: productsTable.title,
        description: productsTable.description,
        price: productsTable.price,
        url: productsTable.url,
        aspect: productsTable.aspect,
        imageUrl: productsTable.imageUrl,
        thumbnails: productsTable.thumbnails,
        activeThumbnailIndex: productsTable.activeThumbnailIndex,
        customerName: ordersTable.customerName,
        customerEmail: ordersTable.customerEmail,
        customerPhone: ordersTable.customerPhone,
        shippingAddress: ordersTable.shippingAddress,
        city: ordersTable.city,
        postalCode: ordersTable.postalCode,
        deliveryNotes: ordersTable.deliveryNotes,
        fulfillmentType: ordersTable.fulfillmentType,
        isGift: ordersTable.isGift,
        giftCardType: ordersTable.giftCardType,
        giftMessage: ordersTable.giftMessage,
        deliveryFee: ordersTable.deliveryFee,
        giftFee: ordersTable.giftFee,
        orderUserId: ordersTable.userId,
        accountName: user.name,
        accountEmail: user.email,
      })
      .from(ordersTable)
      .innerJoin(productsTable, eq(ordersTable.postId, productsTable.id))
      .leftJoin(user, eq(ordersTable.userId, user.id))
      .where(whereCondition)
      .orderBy(desc(ordersTable.createdAt));

    // Normalize customer name and email fallbacks
    const normalizedPurchases = purchases.map((p) => ({
      ...p,
      customerName: p.customerName || p.accountName || "Patron",
      customerEmail: p.customerEmail || p.accountEmail || "",
    }));

    return NextResponse.json({
      purchases: normalizedPurchases,
      isAdmin,
      view: shouldFetchAll ? "all" : "mine",
      totalOrders: normalizedPurchases.length,
    });
  } catch (error: any) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}
