import { createInsertSchema } from "drizzle-zod";
import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
};

export const categoriesTable = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  status: text("status").notNull().default("active"),
  ...timestamps,
});

export const brandsTable = pgTable("brands", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  status: text("status").notNull().default("active"),
  ...timestamps,
});

export const sellersTable = pgTable("sellers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  verified: boolean("verified").notNull().default(false),
  city: text("city").notNull(),
  status: text("status").notNull().default("active"),
  ...timestamps,
});

export const productsTable = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  brandId: uuid("brand_id").notNull().references(() => brandsTable.id),
  categoryId: uuid("category_id").notNull().references(() => categoriesTable.id),
  sellerId: uuid("seller_id").notNull().references(() => sellersTable.id),
  imageUrl: text("image_url").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  unit: text("unit").notNull(),
  compareAtPrice: numeric("compare_at_price", { precision: 12, scale: 2 }),
  rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("0"),
  reviewCount: integer("review_count").notNull().default(0),
  inStock: boolean("in_stock").notNull().default(true),
  sameDayEligible: boolean("same_day_eligible").notNull().default(false),
  badge: text("badge"),
  specifications: jsonb("specifications").notNull().$type<Array<{ label: string; value: string }>>().default([]),
  faqs: jsonb("faqs").notNull().$type<Array<{ question: string; answer: string }>>().default([]),
  status: text("status").notNull().default("published"),
  ...timestamps,
});

export const productVariantsTable = pgTable("product_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => productsTable.id),
  label: text("label").notNull(),
  value: text("value").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  inStock: boolean("in_stock").notNull().default(true),
  ...timestamps,
});

export const inventoryItemsTable = pgTable("inventory_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => productsTable.id),
  sellerId: uuid("seller_id").notNull().references(() => sellersTable.id),
  locationName: text("location_name").notNull(),
  city: text("city").notNull(),
  pincode: text("pincode").notNull(),
  stock: integer("stock").notNull().default(0),
  reserved: integer("reserved").notNull().default(0),
  ...timestamps,
});

export const insertCategorySchema = createInsertSchema(categoriesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBrandSchema = createInsertSchema(brandsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSellerSchema = createInsertSchema(sellersTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProductVariantSchema = createInsertSchema(productVariantsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInventoryItemSchema = createInsertSchema(inventoryItemsTable).omit({ id: true, createdAt: true, updatedAt: true });

export type Category = z.infer<typeof insertCategorySchema>;
export type Brand = z.infer<typeof insertBrandSchema>;
export type Seller = z.infer<typeof insertSellerSchema>;
export type Product = typeof productsTable.$inferSelect;
export type ProductVariant = typeof productVariantsTable.$inferSelect;
export type InventoryItem = typeof inventoryItemsTable.$inferSelect;