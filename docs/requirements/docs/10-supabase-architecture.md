# Supabase Architecture

## Services

### PostgreSQL
Primary transactional database.

### Supabase Auth
Authentication:
- Email/password
- Phone OTP

Guest checkout must be supported without requiring an account.

### Supabase Storage
Use for:
- Product images
- Seller-uploaded catalogues/material
- KYC documents with private access
- Review media
- Other controlled assets

Private documents must never be exposed through public buckets.

### Edge Functions
Use for trusted server-side logic such as:
- Cashfree integration
- Payment verification
- Webhook processing
- Order state transitions where privileged logic is required
- Financial calculations requiring trusted execution
- Notifications
- Secure third-party API calls
- Other operations that must not expose secrets to the browser

### Realtime
Use only where it materially improves:
- Order status
- Seller/Admin workflow status
- Notifications
- Other real-time operational views

Do not use Realtime everywhere by default.

## Client Application
React/Vite frontend should access Supabase through typed service/repository layers rather than scattering database queries throughout UI components.
