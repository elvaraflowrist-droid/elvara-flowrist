import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { systemSettingsTable } from "@/db/schema";
import { auth, isConfiguredAdminEmail } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

const DEFAULT_SETTINGS: Record<string, string> = {
  delivery_fee: "150.00",
  gift_price: "100.00",
  pickup_address: "Elvara Floral Atelier, Road No. 36, Jubilee Hills, Hyderabad 500033",
  pickup_hours: "Monday – Sunday, 09:00 AM – 08:00 PM",
};

export async function GET() {
  try {
    const settings = await db.select().from(systemSettingsTable);
    const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS };

    for (const item of settings) {
      settingsMap[item.key] = item.value;
    }

    return NextResponse.json({
      success: true,
      data: settingsMap,
    });
  } catch (error: any) {
    console.error("Failed to fetch system settings:", error);
    return NextResponse.json(
      { success: false, data: DEFAULT_SETTINGS, error: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = Boolean(session.user.isAdmin || isConfiguredAdminEmail(session.user.email));
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const body = await req.json();
    const { key, value, settings } = body;

    // Handle batch update or single update
    const entriesToUpdate: Array<{ key: string; value: string }> = [];

    if (settings && typeof settings === "object") {
      for (const [k, v] of Object.entries(settings)) {
        if (typeof v === "string" || typeof v === "number") {
          entriesToUpdate.push({ key: k, value: String(v) });
        }
      }
    } else if (key && value !== undefined) {
      entriesToUpdate.push({ key, value: String(value) });
    } else {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    for (const entry of entriesToUpdate) {
      const existing = await db
        .select()
        .from(systemSettingsTable)
        .where(eq(systemSettingsTable.key, entry.key));

      if (existing.length > 0) {
        await db
          .update(systemSettingsTable)
          .set({ value: entry.value, updatedAt: new Date() })
          .where(eq(systemSettingsTable.key, entry.key));
      } else {
        await db.insert(systemSettingsTable).values({
          key: entry.key,
          value: entry.value,
          updatedAt: new Date(),
        });
      }
    }

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/collections");

    return NextResponse.json({ success: true, message: "Settings updated successfully" });
  } catch (error: any) {
    console.error("Failed to update system settings:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
