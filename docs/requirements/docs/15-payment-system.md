# Payment System

## Provider
Cashfree.

## V1 Payment Methods
### Pay Online
- UPI
- UPI QR
- Net Banking
- Credit Card

### Pay on Delivery
Supported where the configured delivery/product rules allow it.

## Excluded
- Partial payment
- EMI

## Payment Principles
- Payment creation must occur through trusted server-side logic where secrets are required.
- Payment success must not be trusted solely from browser redirect/query parameters.
- Verify payment status using Cashfree's supported server-side mechanisms.
- Support webhook processing.
- Ensure webhook handling is idempotent.
- Prevent duplicate order/payment processing.

## Payment States
Suggested:
- Initiated
- Pending
- Authorized
- Paid
- Failed
- Cancelled
- Refunded
- Partially Refunded

## Reconciliation
Store provider references and payment events so transactions can be audited and reconciled.

## Customer UX
Checkout must clearly display available payment methods and final payable amount before confirmation.

## Confirmed Decisions Update

Cashfree payment/order amount must use the persisted tax and applicable fee/delivery calculation. Never trust client-side payment success alone; verify server-side and process provider webhooks idempotently.
