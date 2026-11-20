import { db } from "@/db/drizzle";
import { productsTable } from "@/db/schema";
import { PRODUCT_PUBLIC_FIELDS, getOrderByClause } from "@/db/queries";
import { arrayContains, eq, and, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "views";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "20"));
    const tagsParam = searchParams.get("tags");
    const assetType = searchParams.get("type") || searchParams.get("assetType");

    const tags = tagsParam
      ? tagsParam.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const orderByClause = getOrderByClause(sort);
    const offset = (page - 1) * limit;

    const conditions = [];
    if (tags.length > 0) {
      conditions.push(arrayContains(productsTable.tags, tags));
    }
    if (assetType) {
      conditions.push(eq(productsTable.assetType, assetType));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const products = await db
      .select(PRODUCT_PUBLIC_FIELDS)
      .from(productsTable)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: products,
      page,
      limit,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch catalog items",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { auth, isConfiguredAdminEmail } = await import("@/lib/auth");
    const { headers } = await import("next/headers");
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized: Please sign in" }, { status: 401 });
    }

    if (!session.user.isAdmin && !isConfiguredAdminEmail(session.user.email)) {
      return NextResponse.json({ success: false, error: "Unauthorized: Admin privileges required" }, { status: 403 });
    }

    const body = await request.json();
    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    const [inserted] = await db
      .insert(productsTable)
      .values({
        title: body.title.trim(),
        description: body.description?.trim() || null,
        price: body.price ? body.price.toString().trim() : null,
        url: body.url || null,
        aspect: body.aspect || "horizontal",
        thumbnails: Array.isArray(body.thumbnails) ? body.thumbnails : [],
        activeThumbnailIndex: body.activeThumbnailIndex || 0,
        assetType: body.assetType || "bouquets",
        sourceLink: body.sourceLink || null,
        tags: Array.isArray(body.tags) ? body.tags : [],
        fileUrl: body.fileUrl || null,
        references: Array.isArray(body.references) ? body.references : [],
        userId: session.user.id,
      })
      .returning();

    revalidatePath("/");
    revalidatePath("/collections");
    revalidatePath("/bouquets");
    revalidatePath("/admin");

    return NextResponse.json({
      success: true,
      data: inserted,
    });
  } catch (error: any) {
    console.error("Failed to create product:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { auth, isConfiguredAdminEmail } = await import("@/lib/auth");
    const { headers } = await import("next/headers");
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized: Please sign in" }, { status: 401 });
    }

    if (!session.user.isAdmin && !isConfiguredAdminEmail(session.user.email)) {
      return NextResponse.json({ success: false, error: "Unauthorized: Admin privileges required" }, { status: 403 });
    }

    const body = await request.json();
    const ids = body?.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: "No product IDs provided" }, { status: 400 });
    }

    await db.delete(productsTable).where(inArray(productsTable.id, ids));

    revalidatePath("/");
    revalidatePath("/collections");
    revalidatePath("/bouquets");
    revalidatePath("/admin");

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${ids.length} product(s)`,
      count: ids.length,
    });
  } catch (error: any) {
    console.error("Failed to bulk delete products:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to bulk delete products" },
      { status: 500 }
    );
  }
}


