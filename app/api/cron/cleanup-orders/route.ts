import { NextRequest, NextResponse } from "next/server";
import { expireStalePendingOrders } from "@/lib/order-lifecycle";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is configured, enforce Bearer authentication
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const expiredCount = await expireStalePendingOrders(30);

    console.log(`[Vercel Cron] Cleaned up ${expiredCount} stale pending orders.`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      expiredOrdersCount: expiredCount,
    });
  } catch (error: any) {
    console.error("[Vercel Cron] Error during scheduled order cleanup:", error);
    return NextResponse.json({ error: error?.message || "Cron job failed" }, { status: 500 });
  }
}
