# Product Listing Workflow

## Required Workflow

```text
Seller
  ↓
Submit Product
  ↓
Admin Review
  ↓
Admin Creates/Edits Listing
  ↓
Seller Review
  ↓
┌──────────────────┬────────────────────┐
│ Approve          │ Request Change     │
↓                  ↓                    │
Admin Approval     Admin Revision ←────┘
  ↓
Published
  ↓
Customer
```

## Rules
- A seller submission must not become customer-visible immediately.
- Admin can edit, create, complete or correct listing information.
- Admin can modify images/content where required.
- Admin can correct category, brand, variants and product information.
- Seller must be able to review the admin-edited listing.
- Seller can approve/confirm or request changes.
- Listing can move back and forth between Seller and Admin.
- Publication requires the required approval process to be completed.

## Revision History
Never simply overwrite the prior workflow state.

Maintain:
- Revision number
- Previous state
- New state
- Changed fields
- Changed images/content where feasible
- Changed by user
- Timestamp
- Reason/comment
- Seller/admin action

## Auditability
The system must provide an auditable timeline of listing submissions, revisions, approvals, rejections and change requests.

## Confirmed Decisions Update

Seller-submitted and Admin-modified images must be traceable to the relevant listing revision/workflow event where practical. Seller-owned inventory is separate from approval records, and customer availability must respect listing status, stock and serviceability.
