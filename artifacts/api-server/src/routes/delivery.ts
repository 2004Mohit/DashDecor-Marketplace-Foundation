import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, inventoryItemsTable, productsTable } from "@workspace/db";
import { CheckServiceabilityBody, CheckServiceabilityResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const serviceAreas = new Map([
  ["411001", { city: "Pune", sameDayEligible: true }],
  ["411004", { city: "Pune", sameDayEligible: true }],
  ["411014", { city: "Pune", sameDayEligible: true }],
  ["411026", { city: "Pimpri-Chinchwad", sameDayEligible: true }],
  ["411033", { city: "Pimpri-Chinchwad", sameDayEligible: false }],
]);

router.post("/delivery/serviceability", async (req, res): Promise<void> => {
  const parsed = CheckServiceabilityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { pincode, productSlug } = parsed.data;
  const area = serviceAreas.get(pincode);
  if (!area) {
    res.json(CheckServiceabilityResponse.parse({
      pincode,
      serviceable: false,
      city: null,
      message: "We’re not in this pincode yet. Try Pune or Pimpri-Chinchwad for local delivery.",
      sameDayEligible: false,
      estimatedDays: null,
    }));
    return;
  }

  let sameDayEligible = area.sameDayEligible;
  if (productSlug) {
    const [product] = await db
      .select({ id: productsTable.id, sameDayEligible: productsTable.sameDayEligible })
      .from(productsTable)
      .where(and(eq(productsTable.slug, productSlug), eq(productsTable.status, "published")))
      .limit(1);
    if (!product) {
      res.status(400).json({ error: "Product is not available" });
      return;
    }
    const [inventory] = await db
      .select({ stock: inventoryItemsTable.stock, reserved: inventoryItemsTable.reserved })
      .from(inventoryItemsTable)
      .where(and(eq(inventoryItemsTable.productId, product.id), eq(inventoryItemsTable.pincode, pincode)))
      .limit(1);
    sameDayEligible = area.sameDayEligible && product.sameDayEligible && Boolean(inventory && inventory.stock > inventory.reserved);
  }

  res.json(CheckServiceabilityResponse.parse({
    pincode,
    serviceable: true,
    city: area.city,
    message: sameDayEligible
      ? "Good news — this address is eligible for same-day delivery."
      : "This address is serviceable. Delivery is estimated in 2–4 days.",
    sameDayEligible,
    estimatedDays: sameDayEligible ? 0 : 3,
  }));
});

export default router;