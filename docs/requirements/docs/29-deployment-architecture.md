# Deployment Architecture

## Production

```text
User
 ↓
Cloudflare DNS/CDN
 ↓
Cloudflare Pages
 ↓
React/Vite Frontend
 ↓
Supabase
 ├── Auth
 ├── PostgreSQL
 ├── Storage
 ├── Edge Functions
 └── Realtime where required
```

## Domain
Client-owned domain.

Domain should be purchased and owned by the client/company.

## Cloudflare
Use for:
- DNS
- CDN
- HTTPS
- Appropriate security/performance controls

## Environments
Prefer:
- Development
- Staging
- Production

Do not develop directly against production data.

## Environment Variables
Keep secrets and environment-specific configuration outside source code.

## Production Checklist
- Domain configured
- DNS verified
- HTTPS active
- Supabase production project configured
- RLS verified
- Storage policies verified
- Cashfree production credentials configured securely
- Webhooks configured
- Error monitoring/logging configured
- Sitemap/robots verified
- SEO metadata verified
- Backup/recovery plan documented

## Confirmed Decisions Update

The Replit project starts completely empty. First phase establishes React/Vite, project conventions, environment configuration, Supabase client architecture and development tooling. Production frontend deploys to Cloudflare Pages.
