import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { ordersTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, reason, code, description } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Missing required orderId" }, { status: 400 });
    }

    const compiledReason = description || reason || (code ? `Error code: ${code}` : "Payment cancelled or declined");

    // Safety guard: only transition if current status is 'pending'
    // Never overwrite an already 'paid' order!
    const result = await db
      .update(ordersTable)
      .set({
        status: "failed",
        failureReason: compiledReason,
        updatedAt: new Date(),
      })
      .where(and(eq(ordersTable.id, orderId), eq(ordersTable.status, "pending")));

    console.log(`[Order Failure] Order ${orderId} marked as failed. Reason: ${compiledReason}`);

    return NextResponse.json({ success: true, orderId, status: "failed" });
  } catch (error: any) {
    console.error("[Order Failure API] Error marking order as failed:", error);
    return NextResponse.json({ error: error?.message || "Failed to update order status" }, { status: 500 });
  }
}

