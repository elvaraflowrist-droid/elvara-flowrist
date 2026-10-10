import { boolean, integer, numeric, pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';

// ==============================================
// Better Auth Core Tables
// ==============================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow()
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" })
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: "date" }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: "date" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow()
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow()
});

// ==============================================
// Store Products / Catalog (postsTable)
// ==============================================

export const productsTable = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }),
  url: text("url"),
  aspect: text("aspect").$type<"horizontal" | "vertical">().default("horizontal").notNull(),
  imageUrl: text("image_url"),
  fileUrl: text("file_url"),
  thumbnails: text("thumbnails").array().default([]).notNull(),
  activeThumbnailIndex: integer("active_thumbnail_index").default(0).notNull(),
  assetType: text("asset_type").default("bouquets").notNull(),
  sourceLink: text("source_link"),
  tags: text("tags").array().default([]).notNull(),
  references: jsonb("references").$type<{ label: string; url: string }[]>().default([]).notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  views: integer("views").default(0).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
});

// Alias for 1:1 backward compatibility with code expecting postsTable
export const postsTable = productsTable;

// ==============================================
// Razorpay Orders Table
// ==============================================

export const ordersTable = pgTable("orders", {
  id: text("id").primaryKey(), // Razorpay order ID (e.g. order_O123456)
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  postId: uuid("post_id").notNull().references(() => productsTable.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("created").notNull(), // 'created' | 'paid' | 'failed'
  paymentId: text("payment_id"), // Razorpay payment ID (e.g. pay_P123456)
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  shippingAddress: text("shipping_address"),
  city: text("city"),
  postalCode: text("postal_code"),
  deliveryNotes: text("delivery_notes"),
  fulfillmentType: text("fulfillment_type").default("delivery").notNull(), // 'delivery' | 'pickup'
  isGift: boolean("is_gift").default(false).notNull(),
  giftCardType: text("gift_card_type"), // 'vintage-botanical' | 'minimal-ivory' | 'blush-rose' | 'midnight-noir'
  giftMessage: text("gift_message"),
  deliveryFee: numeric("delivery_fee", { precision: 10, scale: 2 }).default("0"),
  giftFee: numeric("gift_fee", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
});

// ==============================================
// System Settings Table
// ==============================================

export const systemSettingsTable = pgTable("system_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

// Type definitions
export type InsertUser = typeof user.$inferInsert;
export type SelectUser = typeof user.$inferSelect;

export type InsertSession = typeof session.$inferInsert;
export type SelectSession = typeof session.$inferSelect;

export type InsertAccount = typeof account.$inferInsert;
export type SelectAccount = typeof account.$inferSelect;

export type InsertVerification = typeof verification.$inferInsert;
export type SelectVerification = typeof verification.$inferSelect;

export type InsertProduct = typeof productsTable.$inferInsert;
export type SelectProduct = typeof productsTable.$inferSelect;
export type InsertPost = InsertProduct;
export type SelectPost = SelectProduct;

export type InsertOrder = typeof ordersTable.$inferInsert;
export type SelectOrder = typeof ordersTable.$inferSelect;

// ==============================================
// Testimonials Table
// ==============================================

export const testimonialsTable = pgTable("testimonials", {
  id: uuid("id").defaultRandom().primaryKey(),
  author: text("author").notNull(),
  location: text("location"),
  quote: text("quote").notNull(),
  rating: integer("rating").default(5).notNull(),
  isApproved: boolean("is_approved").default(true).notNull(),
  orderIndex: integer("order_index").default(0).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
});

export type InsertTestimonial = typeof testimonialsTable.$inferInsert;
export type SelectTestimonial = typeof testimonialsTable.$inferSelect;
