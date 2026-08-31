# Supabase RLS and Security

## Mandatory
Row Level Security must be enabled on all relevant production tables.

## Customer
Customer can only access their own:
- Profile
- Addresses
- Orders
- Order items belonging to their orders
- Wishlist
- Reviews
- Enquiries/quotes
- Notifications

## Seller
Seller can only access:
- Their own seller profile
- Their own documents where permitted
- Their own listings/submissions
- Their own listing revisions/workflow records
- Their own relevant orders
- Their own relevant inventory
- Their own settlement information
- Seller-specific notifications

Seller must not access another seller's data.

## Admin
Admin access must be based on trusted role claims/database-backed authorization and protected server-side.

## KYC Documents
KYC documents must use private storage and controlled access.

## Financial Data
Commission, settlement, payment verification and refund logic must not rely solely on client-side calculations.

## Webhooks
Cashfree webhooks must be authenticated/verified according to provider requirements before changing payment/order state.

## Secrets
Never expose:
- Supabase service role key
- Cashfree secret credentials
- Other private API keys

in frontend code or public environment variables.

## Audit
Security-sensitive actions should create audit records where appropriate.
