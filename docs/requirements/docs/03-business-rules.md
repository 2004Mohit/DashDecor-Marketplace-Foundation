# Business Rules

## Marketplace
The platform supports both B2C and B2B customers and third-party sellers.

## Pricing and Fees
Admin-configurable:
- Commission percentage
- Fixed transaction/platform fee where applicable
- Delivery margin
- Seller/category-specific fee rules where required

Fees must not be hard-coded.

Customer-facing charges must be transparent and show:
- Applied percentage where applicable
- Fee amount
- Other applicable charges
- Final payable amount

## B2B
B2B may use bulk ordering and quotation workflows. The system must support negotiation/quotation without forcing every B2B transaction through normal retail checkout.

## Delivery
Same-day delivery is supported only where eligible. Eligibility is determined by configurable rules based on seller, product, pincode, distance, inventory, capacity, product type and schedule.

## Floor-Shifting Limitation
Delivery does not include shifting products to upper floors.
Delivery includes unloading and keeping the product at the designated place on ground level.
This limitation must be displayed before order placement.

## Payments
Cashfree is the payment provider.
V1 payment methods:
- UPI
- UPI QR
- Net Banking
- Credit Card
- Pay on Delivery

Not included:
- Partial payment
- EMI

## V1 Roles
Only:
- Admin
- Seller
- Customer

## Interior Services
Interior design/service booking is not part of V1.

## Confirmed Decisions Update

Tax/GST rules and classifications are Admin-configurable and must not be hard-coded in React. Calculate applicable tax from transaction context and persist the final tax breakdown with the order/transaction. Support CGST, SGST and IGST where applicable. Seller-managed inventory is authoritative for seller-owned listings. Categories are database-driven and Admin-managed. B2B capabilities require an approved business profile.
