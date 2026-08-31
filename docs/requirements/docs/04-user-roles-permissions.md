# User Roles and Permissions

## Customer
Can:
- Browse products
- Search/filter/sort
- View product details
- Add to cart
- Checkout as guest or authenticated user
- Use email/password or phone OTP authentication
- Manage profile
- Manage addresses
- Place orders
- View order history
- Track orders
- Wishlist products
- Review eligible products/orders
- Receive notifications
- Submit enquiries and quotation requests
- View quote status

## Seller
Can:
- Register
- Submit required business/KYC information
- Upload product photos/catalogue/material
- Fill product information manually
- Submit product/listing requests
- Review admin-edited listings
- Approve/confirm listings
- Request changes
- Reject/request corrections
- Manage approved seller-owned information where permitted
- Receive relevant order/quote/notification information

Seller must not bypass admin approval for marketplace publication.

## Admin
Can:
- Manage users
- Verify seller documents/KYC
- Approve/reject sellers
- Manage products
- Manage categories
- Manage brands
- Manage variants and attributes
- Review and edit seller submissions
- Approve/reject listings
- Manage listing revisions
- Manage inventory
- Manage orders
- Manage payments/refunds
- Manage enquiries/quotes
- Manage reviews
- Manage delivery rules
- Manage blogs/content
- Manage SEO settings
- Configure commissions and fees

## Security
Permissions must be enforced server-side using Supabase RLS and trusted server/Edge Function logic. UI hiding alone is never sufficient.

## Confirmed Decisions Update

B2B customers must submit a business profile for Admin verification before verified B2B capabilities are enabled. Seller can manage seller-owned inventory and submit/manage product imagery subject to listing approval. Admin can manage categories, tax rules, B2B verification and seller/admin listing workflow.
