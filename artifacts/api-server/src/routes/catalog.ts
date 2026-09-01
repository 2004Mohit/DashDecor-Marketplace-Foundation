import { Router, type IRouter } from "express";
import { and, asc, desc, eq, exists, ilike, or, sql } from "drizzle-orm";
import { db, brandsTable, categoriesTable, inventoryItemsTable, productVariantsTable, productsTable, sellersTable } from "@workspace/db";
import {
  GetCatalogHighlightsResponse,
  GetProductParams,
  GetProductResponse,
  ListBrandsResponse,
  ListCategoriesResponse,
  ListProductsQueryParams,
  ListProductsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

type ProductRow = {
  product: typeof productsTable.$inferSelect;
  brand: typeof brandsTable.$inferSelect;
  category: typeof categoriesTable.$inferSelect;
  seller: typeof sellersTable.$inferSelect;
};

const toProductCard = (row: ProductRow) => ({
  id: row.product.id,
  slug: row.product.slug,
  name: row.product.name,
  brand: row.brand.name,
  category: row.category.name,
  categorySlug: row.category.slug,
  imageUrl: row.product.imageUrl,
  price: Number(row.product.price),
  unit: row.product.unit,
  compareAtPrice: row.product.compareAtPrice == null ? null : Number(row.product.compareAtPrice),
  rating: Number(row.product.rating),
  reviewCount: row.product.reviewCount,
  inStock: row.product.inStock,
  sameDayEligible: row.product.sameDayEligible,
  badge: row.product.badge,
});

const getCategories = async () => {
  const rows = await db
    .select({
      category: categoriesTable,
      productCount: sql<number>`count(${productsTable.id})`,
    })
    .from(categoriesTable)
    .leftJoin(productsTable, and(eq(productsTable.categoryId, categoriesTable.id), eq(productsTable.status, "published")))
    .where(eq(categoriesTable.status, "active"))
    .groupBy(categoriesTable.id)
    .orderBy(asc(categoriesTable.name));

  return rows.map(({ category, productCount }) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    productCount: Number(productCount),
    imageUrl: category.imageUrl,
  }));
};

const getBrands = async () => {
  const rows = await db
    .select({
      brand: brandsTable,
      productCount: sql<number>`count(${productsTable.id})`,
    })
    .from(brandsTable)
    .leftJoin(productsTable, and(eq(productsTable.brandId, brandsTable.id), eq(productsTable.status, "published")))
    .where(eq(brandsTable.status, "active"))
    .groupBy(brandsTable.id)
    .orderBy(asc(brandsTable.name));

  return rows.map(({ brand, productCount }) => ({
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    productCount: Number(productCount),
  }));
};

const productQuery = () =>
  db
    .select({
      product: productsTable,
      brand: brandsTable,
      category: categoriesTable,
      seller: sellersTable,
    })
    .from(productsTable)
    .innerJoin(brandsTable, eq(productsTable.brandId, brandsTable.id))
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .innerJoin(sellersTable, eq(productsTable.sellerId, sellersTable.id));

router.get("/catalog/highlights", async (req, res): Promise<void> => {
  const rows = await productQuery()
    .where(eq(productsTable.status, "published"))
    .orderBy(desc(productsTable.reviewCount))
    .limit(4);
  const categories = await getCategories();
  const data = {
    featuredProducts: rows.map(toProductCard),
    categories,
    trustSignals: [
      "Verified local sellers",
      "Material pricing you can see clearly",
      "Ground-level delivery across Pune",
    ],
    serviceArea: "Pune · Pimpri-Chinchwad",
  };

  req.log.info({ featuredCount: data.featuredProducts.length }, "Catalog highlights requested");
  res.json(GetCatalogHighlightsResponse.parse(data));
});

router.get("/categories", async (_req, res): Promise<void> => {
  res.json(ListCategoriesResponse.parse(await getCategories()));
});

router.get("/brands", async (_req, res): Promise<void> => {
  res.json(ListBrandsResponse.parse(await getBrands()));
});

router.get("/products", async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { q, category, brand, sort, availability, pincode, page, pageSize } = parsed.data;
  const filters = [eq(productsTable.status, "published")];
  if (q) {
    filters.push(
      or(
        ilike(productsTable.name, `%${q}%`),
        ilike(productsTable.description, `%${q}%`),
        ilike(brandsTable.name, `%${q}%`),
        ilike(categoriesTable.name, `%${q}%`),
      )!,
    );
  }
  if (category) {
    filters.push(eq(categoriesTable.slug, category));
  }
  if (brand) {
    filters.push(eq(brandsTable.slug, brand));
  }
  if (availability === "in-stock" || availability === "same-day") {
    filters.push(eq(productsTable.inStock, true));
  }
  if (availability === "same-day") {
    filters.push(eq(productsTable.sameDayEligible, true));
  }
  if (pincode) {
    filters.push(
      exists(
        db
          .select({ id: inventoryItemsTable.id })
          .from(inventoryItemsTable)
          .where(and(eq(inventoryItemsTable.productId, productsTable.id), eq(inventoryItemsTable.pincode, pincode))),
      ),
    );
  }

  const where = and(...filters);
  const order =
    sort === "price-low"
      ? asc(productsTable.price)
      : sort === "price-high"
        ? desc(productsTable.price)
        : sort === "newest"
          ? desc(productsTable.createdAt)
          : desc(productsTable.reviewCount);

  const [rows, totalRows] = await Promise.all([
    productQuery()
      .where(where)
      .orderBy(order)
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`count(${productsTable.id})` })
      .from(productsTable)
      .innerJoin(brandsTable, eq(productsTable.brandId, brandsTable.id))
      .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(where),
  ]);

  const categories = await getCategories();
  const brands = await getBrands();
  const prices = rows.map((row) => Number(row.product.price));
  const data = {
    products: rows.map(toProductCard),
    total: Number(totalRows[0]?.count ?? 0),
    page,
    pageSize,
    facets: {
      categories,
      brands,
      price: {
        min: prices.length ? Math.min(...prices) : 0,
        max: prices.length ? Math.max(...prices) : 0,
      },
    },
  };

  res.json(ListProductsResponse.parse(data));
});

router.get("/products/:slug", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await productQuery()
    .where(and(eq(productsTable.slug, params.data.slug), eq(productsTable.status, "published")))
    .limit(1);
  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const variants = await db
    .select()
    .from(productVariantsTable)
    .where(eq(productVariantsTable.productId, row.product.id))
    .orderBy(asc(productVariantsTable.price));

  const data = {
    ...toProductCard(row),
    description: row.product.description,
    specifications: row.product.specifications,
    variants: variants.map((variant) => ({
      id: variant.id,
      label: variant.label,
      value: variant.value,
      price: Number(variant.price),
      inStock: variant.inStock,
    })),
    faqs: row.product.faqs,
    seller: {
      name: row.seller.name,
      verified: row.seller.verified,
      city: row.seller.city,
    },
  };

  res.json(GetProductResponse.parse(data));
});

export default router;