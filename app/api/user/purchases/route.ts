import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { ordersTable, productsTable, user } from "@/db/schema";
import { auth, isConfiguredAdminEmail } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, desc, count, SQL } from "drizzle-orm";
import { expireStalePendingOrders } from "@/lib/order-lifecycle";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE_SIZE = 6;

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Lazy cleanup of timed out pending orders
    await expireStalePendingOrders(30);

    const isAdmin = Boolean(session.user.isAdmin || isConfiguredAdminEmail(session.user.email));

    const { searchParams } = new URL(req.url);
    const pageParam = Number.parseInt(searchParams.get("page") || "1", 10);
    const limitParam = Number.parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE), 10);
    const filter = searchParams.get("filter") || "all";
    const statusParam = searchParams.get("status") || "paid"; // 'paid' (default) | 'pending' | 'failed' | 'all'

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit =
      Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : DEFAULT_PAGE_SIZE;

    const conditions: SQL[] = [];

    // User scope: admin sees all customer orders; regular user sees their own
    if (!isAdmin) {
      conditions.push(eq(ordersTable.userId, session.user.id));
    }

    // Status filter
    if (statusParam === "pending" || statusParam === "failed" || statusParam === "paid") {
      conditions.push(eq(ordersTable.status, statusParam));
    }

    // Category / Fulfillment filter from dashboard tabs
    if (filter === "gift") {
      conditions.push(eq(ordersTable.isGift, true));
    } else if (filter === "pickup") {
      conditions.push(eq(ordersTable.fulfillmentType, "pickup"));
    } else if (filter === "delivery") {
      conditions.push(eq(ordersTable.fulfillmentType, "delivery"));
    }

    const whereCondition = conditions.length > 1
      ? and(...conditions)
      : conditions[0] || undefined;

    // Total count for pagination
    const [{ total }] = await db
      .select({ total: count() })
      .from(ordersTable)
      .innerJoin(productsTable, eq(ordersTable.postId, productsTable.id))
      .where(whereCondition);

    const totalOrders = Number(total || 0);
    const totalPages = Math.max(1, Math.ceil(totalOrders / limit));
    const safePage = Math.min(page, totalPages);

    // Join orders with products and user to return purchased items & customer info
    const purchases = await db
      .select({
        orderId: ordersTable.id,
        paymentId: ordersTable.paymentId,
        status: ordersTable.status,
        failureReason: ordersTable.failureReason,
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
      .orderBy(desc(ordersTable.createdAt))
      .limit(limit)
      .offset((safePage - 1) * limit);

    // Normalize customer name and email fallbacks
    const normalizedPurchases = purchases.map((p) => ({
      ...p,
      customerName: p.customerName || p.accountName || "Patron",
      customerEmail: p.customerEmail || p.accountEmail || "",
    }));

    return NextResponse.json({
      purchases: normalizedPurchases,
      isAdmin,
      page: safePage,
      limit,
      totalOrders,
      totalPages,
    });
  } catch (error: any) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}
