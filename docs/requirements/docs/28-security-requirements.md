# Security Requirements

## Authentication
Use Supabase Auth.

Support:
- Email/password
- Phone OTP
- Guest checkout

## Authorization
Roles:
- Admin
- Seller
- Customer

Enforce permissions using Supabase RLS and trusted server-side logic.

## Sensitive Data
Protect:
- KYC documents
- Seller business information
- Payment references
- Customer personal data
- Internal financial data

## Payments
Never trust client-side payment success as authoritative.

Verify using Cashfree-supported server-side verification/webhooks.

## Financial Calculations
Commission, platform fees, delivery charges, order totals and settlements must be validated server-side.

## Input Validation
Validate:
- Forms
- Product data
- File uploads
- Quote inputs
- Addresses
- Quantities
- Prices
- Status transitions

## File Uploads
Restrict:
- File types
- File sizes
- Access permissions

Use private storage for sensitive documents.

## Secrets
No secret keys in frontend bundles.

## Audit
Maintain audit trails for:
- Seller verification
- Listing workflow
- Financial events
- Refunds
- Important admin actions

## Abuse Prevention
Consider:
- Rate limiting
- CAPTCHA/anti-bot measures where needed
- Authentication attempt controls
- File upload abuse protection

## Production
Use environment variables and separate development/staging/production configuration.
