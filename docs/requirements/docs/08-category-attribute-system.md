# Category and Dynamic Attribute System

## Goal
Support flexible product information without allowing uncontrolled seller-defined global fields.

## Field Types

### System Fields
Platform-defined fields used across products.

Examples:
- Product name
- Brand
- SKU
- Description
- Price
- Images
- GST/tax
- Stock

### Category-Specific Fields
Fields associated with a category.

Examples:
- Plywood: Thickness, Grade, Size
- Sofa: Seating Capacity, Upholstery, Foam Density
- Wire: Gauge, Length, Colour

### Optional Category Fields
Reusable but optional fields.

### Seller-Suggested Custom Fields
Seller can suggest a new field during product creation.

Seller-created fields:
- Do not automatically become global.
- Must be reviewed by Admin.
- Can be approved/rejected by Admin.

## Reusable Approved Fields
Once Admin approves a seller-suggested field, it may be reused by other sellers and attached to relevant categories.

## Data Model Requirements
Fields should have:
- Name
- Key/slug
- Type
- Category scope
- Required/optional status
- Allowed values where applicable
- Unit where applicable
- Display order
- Active/inactive state
- Creator
- Approval status

Avoid hard-coding category attributes in React components.

## Confirmed Decisions Update

Admin creates and manages categories, subcategories and attributes. Seller-suggested fields require Admin approval before becoming reusable. Categories/products reference configurable tax classifications used by the transaction tax engine.
