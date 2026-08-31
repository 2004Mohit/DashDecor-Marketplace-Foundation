# Database Schema

## Core Tables / Domains

### Identity
- profiles/users
- roles
- addresses

### Sellers
- sellers
- seller_documents
- seller_verification_events

### Catalogue
- categories
- brands
- products
- product_variants
- attributes
- attribute_values
- category_attributes
- product_attribute_values
- product_images

### Seller Listings
- seller_products/listings
- listing_submissions
- listing_revisions
- listing_workflow_events

### Inventory
- inventory_locations
- inventory_items
- inventory_movements

### Commerce
- carts
- cart_items
- wishlists
- wishlist_items
- orders
- order_items
- payments
- refunds

### B2B
- enquiries
- quotes
- quote_items
- quote_events

### Delivery
- delivery_zones
- delivery_rules
- delivery_classes
- delivery_assignments
- delivery_events

### Fees
- commission_rules
- platform_fee_rules
- seller_fee_rules
- seller_settlements
- settlement_items

### Reviews
- reviews
- review_media
- review_moderation_events

### Notifications
- notifications
- notification_events

### Content / SEO
- blog_posts
- content_pages
- seo_metadata

## Principles
- Use UUIDs.
- Use foreign keys.
- Add created_at/updated_at consistently.
- Use status fields with controlled values.
- Avoid duplicated authoritative data.
- Preserve historical financial/order/listing records.
- Use transactions or server-side operations for critical state transitions.
- Design seller/inventory relationships so multiple warehouses can be introduced later.

## Confirmed Decisions Update

Add/support business_profiles, business_profile_documents, business_verification_events, inventory_reservations, tax_classifications, tax_rules and transaction_tax_lines. Seller inventory is authoritative. Persist financial/tax snapshots. Use atomic reservation/stock operations to reduce overselling.
