import { db } from "@/db/drizzle";
import { productsTable, ordersTable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth, isConfiguredAdminEmail } from "@/lib/auth";
import { headers } from "next/headers";
import { expireStalePendingOrders } from "@/lib/order-lifecycle";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.isAdmin && !isConfiguredAdminEmail(session.user.email)) {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // Lazy expiration of stale pending orders (serverless automatic cleanup)
    await expireStalePendingOrders(30);

    // 1. Total products count
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(productsTable);
    const totalCount = Number(countResult[0]?.count || 0);

    // 2. Total orders count
    const ordersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(ordersTable)
      .where(eq(ordersTable.status, "paid"));
    const paidOrders = Number(ordersResult[0]?.count || 0);

    // 3. New products in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newItemsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(productsTable)
      .where(sql`${productsTable.createdAt} >= ${thirtyDaysAgo}`);
    const newMonthlyItems = Number(newItemsResult[0]?.count || 0);

    // 4. Sum of all views across all items
    const totalViewsResult = await db
      .select({ totalViews: sql<number>`sum(${productsTable.views})` })
      .from(productsTable);
    const totalViews = Number(totalViewsResult[0]?.totalViews || 0);

    return NextResponse.json({
      success: true,
      data: {
        totalCount,
        paidOrders,
        newMonthlyItems,
        totalViews,
      },
    });
  } catch (error: any) {
    console.error("Failed to fetch admin stats:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
