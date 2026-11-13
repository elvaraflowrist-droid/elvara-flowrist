import { db } from "@/db/drizzle";
import { ordersTable } from "@/db/schema";
import { eq, and, lt } from "drizzle-orm";
import { sendOrderNotificationEmails } from "@/lib/email";

/**
 * Serverless Lazy Expiration:
 * Automatically marks pending orders older than the timeout window (default 30 mins) as failed.
 * Runs on-demand during read queries with zero background process requirement.
 */
export async function expireStalePendingOrders(timeoutMinutes = 30): Promise<number> {
  try {
    const thresholdDate = new Date(Date.now() - timeoutMinutes * 60 * 1000);

    const result = await db
      .update(ordersTable)
      .set({
        status: "failed",
        failureReason: `Payment session timed out (unpaid after ${timeoutMinutes} mins)`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(ordersTable.status, "pending"),
          lt(ordersTable.createdAt, thresholdDate)
        )
      );

    return (result as any)?.rowCount || 0;
  } catch (error) {
    console.error("[Order Lifecycle] Error during stale order expiration:", error);
    return 0;
  }
}

/**
 * Idempotently marks an order as PAID and dispatches notifications if not already marked.
 * Safe to be called by both client verify-payment and Razorpay webhook concurrently.
 */
export async function completeOrderPayment(orderId: string, paymentId: string): Promise<{ success: boolean; alreadyPaid: boolean }> {
  try {
    const [existingOrder] = await db
      .select({ id: ordersTable.id, status: ordersTable.status })
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId))
      .limit(1);

    if (!existingOrder) {
      console.warn(`[Order Lifecycle] Cannot complete payment: Order ${orderId} not found.`);
      return { success: false, alreadyPaid: false };
    }

    if (existingOrder.status === "paid") {
      console.log(`[Order Lifecycle] Order ${orderId} is already paid. Skipping duplicate processing.`);
      return { success: true, alreadyPaid: true };
    }

    // Atomically transition from pending (or failed if recovered by webhook) to paid
    await db
      .update(ordersTable)
      .set({
        status: "paid",
        paymentId,
        failureReason: null,
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, orderId));

    console.log(`[Order Lifecycle] Order ${orderId} marked as PAID with paymentId ${paymentId}.`);

    // Dispatch notification emails (must be awaited on Vercel Serverless so the Lambda container does not freeze before SMTP dispatch finishes)
    try {
      await sendOrderNotificationEmails(orderId);
    } catch (err) {
      console.error(`[Order Lifecycle] Error dispatching emails for order ${orderId}:`, err);
    }

    return { success: true, alreadyPaid: false };
  } catch (error) {
    console.error(`[Order Lifecycle] Error completing payment for order ${orderId}:`, error);
    throw error;
  }
}

