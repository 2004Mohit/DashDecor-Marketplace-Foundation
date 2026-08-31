# Order Lifecycle

## B2C Flow

```text
Cart
 ↓
Checkout
 ↓
Address
 ↓
Delivery Eligibility
 ↓
Payment / Pay on Delivery
 ↓
Order Created
 ↓
Seller/Order Processing
 ↓
Packed
 ↓
Assigned for Delivery
 ↓
Out for Delivery
 ↓
Delivered
```

Possible exception states:
- Payment Failed
- Cancelled
- Refund Pending
- Refunded
- Delivery Failed
- Returned
- Disputed

## B2B Flow
B2B may follow:

```text
Enquiry / Bulk Request
 ↓
Quote
 ↓
Negotiation / Revision
 ↓
Customer Acceptance
 ↓
Payment
 ↓
Order
 ↓
Fulfilment
```

## State Rules
- State transitions must be validated.
- Invalid transitions must be rejected.
- Critical transitions should be audited.
- Payment confirmation must come from trusted verification/webhook logic.
- Order totals must be persisted and not recalculated inconsistently after placement.

## Order History
Customers should see meaningful status history.

Admins and relevant sellers should see operational events according to permissions.

## Confirmed Decisions Update

Calculate tax, platform/transaction fees and delivery charges using trusted server-side logic before final order confirmation; persist the financial snapshot. Seller inventory must be reserved/decremented atomically according to the chosen inventory strategy.
