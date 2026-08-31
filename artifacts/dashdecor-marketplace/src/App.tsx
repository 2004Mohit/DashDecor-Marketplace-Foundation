import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';
import { Heart, Search, ShoppingBag, UserRound, ArrowRight, Check, Menu, X, ChevronDown, ChevronUp, SlidersHorizontal, MapPin, Sparkles, RotateCcw, CircleAlert, LoaderCircle, BadgeCheck, Star } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getHealthCheckQueryKey, useGetCatalogHighlights, useGetProduct, useHealthCheck, useListBrands, useListCategories, useListProducts, useCheckServiceability } from '@workspace/api-client-react';
import type { Category, Product, ProductCard } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;

function Logo({ onDark = false }: { onDark?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-3" data-testid="link-logo">
      <span className="relative flex h-9 w-9 items-center justify-center bg-primary text-primary-foreground">
        <span className="absolute h-5 w-5 border border-primary-foreground/70 rotate-45" />
        <span className="relative font-mono-ui text-[10px] tracking-tight">DD</span>
      </span>
      <span className="leading-none">
        <span className={`block text-[15px] font-extrabold tracking-[-0.04em] ${onDark ? 'text-sidebar-foreground' : 'text-foreground'}`}>dash<span className="text-primary">decor</span></span>
        <span className={`mt-1 block font-mono-ui text-[8px] uppercase tracking-[0.18em] ${onDark ? 'text-sidebar-foreground/55' : 'text-muted-foreground'}`}>material library</span>
      </span>
    </Link>
  );
}

function SearchBar({ initialValue = '', compact = false }: { initialValue?: string; compact?: boolean }) {
  const [, setLocation] = useLocation();
  const [value, setValue] = useState(initialValue);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setLocation(`/catalog${value.trim() ? `?q=${encodeURIComponent(value.trim())}` : ''}`);
  };
  return (
    <form onSubmit={submit} className={`group flex items-center border border-border bg-card ${compact ? 'h-10' : 'h-12'} focus-within:border-primary`} data-testid="form-search">
      <Search className="ml-4 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search marble, handles, lights..."
        className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        aria-label="Search materials"
        data-testid="input-search"
      />
      <button type="submit" className="mr-1 h-9 bg-primary px-4 text-[11px] font-bold uppercase tracking-[0.1em] text-primary-foreground hover:bg-primary/90" data-testid="button-search">
        Search
      </button>
    </form>
  );
}

function ProductImage({ product, large = false }: { product: ProductCard | Product; large?: boolean }) {
  return (
    <div className={`material-image relative overflow-hidden ${large ? 'min-h-[360px] md:min-h-[530px]' : 'aspect-[1.08]'} flex items-center justify-center`}>
      <div className="pointer-events-none absolute inset-0 opacity-40 paper-grid" />
      <div className="pointer-events-none absolute left-[13%] top-[15%] h-1/2 w-1/2 rotate-[21deg] border border-secondary/30" />
      <div className="pointer-events-none absolute bottom-[14%] right-[12%] h-20 w-20 rounded-full border border-primary/25" />
      <img
        src={product.imageUrl}
        alt={product.name}
        className="relative z-10 h-full w-full object-cover mix-blend-multiply dark:mix-blend-normal"
        loading={large ? 'eager' : 'lazy'}
        onError={(event) => { event.currentTarget.style.display = 'none'; }}
      />
      {product.sameDayEligible && (
        <span className="absolute bottom-3 left-3 z-20 bg-card/90 px-2 py-1 font-mono-ui text-[9px] uppercase tracking-[0.12em] text-secondary">
          same day · Pune
        </span>
      )}
    </div>
  );
}

function ProductCardView({ product }: { product: ProductCard }) {
  const [saved, setSaved] = useState(false);
  return (
    <article className="group relative min-w-0" data-testid={`card-product-${product.id}`}>
      <Link href={`/product/${product.slug}`} className="block" data-testid={`link-product-${product.id}`}>
        <div className="relative overflow-hidden">
          <ProductImage product={product} />
          {product.badge && <span className={`absolute left-3 top-3 z-20 px-2 py-1 font-mono-ui text-[9px] uppercase tracking-[0.11em] ${/new|best value|fast delivery|special offer/i.test(product.badge) ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground'}`}>{product.badge}</span>}
          <span className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center bg-card/90 text-foreground opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
            <ArrowRight className="h-4 w-4 -rotate-45" aria-hidden="true" />
          </span>
        </div>
        <div className="pt-4">
          <p className="font-mono-ui text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{product.brand} / {product.category}</p>
          <h3 className="mt-2 min-h-[44px] text-[15px] font-bold leading-snug tracking-[-0.02em] group-hover:text-primary">{product.name}</h3>
          <div className="mt-3 flex items-end justify-between gap-2">
            <div>
              <span className="text-[16px] font-extrabold">{money(product.price)}</span>
              <span className="ml-1 text-xs text-muted-foreground">/ {product.unit}</span>
              {product.compareAtPrice && <span className="ml-2 text-xs text-muted-foreground line-through">{money(product.compareAtPrice)}</span>}
            </div>
            <span className="flex items-center gap-1 font-mono-ui text-[10px] text-accent-foreground"><Star className="h-3 w-3 fill-accent-foreground" /> {product.rating.toFixed(1)} ({product.reviewCount})</span>
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={() => setSaved(!saved)}
        className={`absolute right-2 top-2 z-30 flex h-8 w-8 items-center justify-center border ${saved ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card/90 text-foreground hover:border-primary hover:text-primary'}`}
        aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
        data-testid={`button-wishlist-${product.id}`}
      >
        <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} aria-hidden="true" />
      </button>
    </article>
  );
}

function ProductGrid({ products, emptyLabel = 'No materials found in this selection.' }: { products?: ProductCard[]; emptyLabel?: string }) {
  if (!products?.length) {
    return <EmptyState title="The shelf is quiet." description={emptyLabel} actionLabel="Browse the full library" href="/catalog" />;
  }
  return <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">{products.map((product) => <ProductCardView key={product.id} product={product} />)}</div>;
}

function SkeletonGrid() {
  return <div className="grid grid-cols-2 gap-5 md:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="skeleton-pulse" data-testid={`skeleton-product-${index}`}><div className="aspect-[1.08] bg-muted" /><div className="mt-4 h-2 w-2/5 bg-muted" /><div className="mt-3 h-4 w-4/5 bg-muted" /><div className="mt-4 h-4 w-2/5 bg-muted" /></div>)}</div>;
}

function QueryError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="border border-destructive/30 bg-destructive/5 px-6 py-10 text-center" role="alert" data-testid="status-query-error">
      <CircleAlert className="mx-auto h-6 w-6 text-destructive" aria-hidden="true" />
      <p className="mt-3 font-bold">The library is taking a moment.</p>
      <p className="mt-1 text-sm text-muted-foreground">We could not reach the catalog. Your shortlist is still here when it loads.</p>
      <button type="button" onClick={onRetry} className="mt-5 inline-flex items-center gap-2 border border-border bg-card px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] hover:border-primary" data-testid="button-retry">
        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Try again
      </button>
    </div>
  );
}

function EmptyState({ title, description, actionLabel, href }: { title: string; description: string; actionLabel?: string; href?: string }) {
  return (
    <div className="border border-dashed border-border bg-card/50 px-6 py-14 text-center" data-testid="status-empty">
      <div className="mx-auto flex h-12 w-12 items-center justify-center border border-border text-secondary"><Sparkles className="h-5 w-5" aria-hidden="true" /></div>
      <h3 className="mt-5 display-serif text-2xl">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      {href && actionLabel && <Link href={href} className="mt-6 inline-flex items-center gap-2 bg-primary px-4 py-3 text-xs font-bold uppercase tracking-[0.1em] text-primary-foreground hover:-translate-y-0.5" data-testid="link-empty-action">{actionLabel}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>}
    </div>
  );
}

function HealthStatus() {
  const { data } = useHealthCheck({ query: { staleTime: 60000, queryKey: getHealthCheckQueryKey() } });
  const live = data?.status === 'ok' || !!data;
  return <span className="hidden items-center gap-2 font-mono-ui text-[9px] uppercase tracking-[0.13em] text-muted-foreground md:flex" data-testid="status-api"><span className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-secondary' : 'bg-accent'}`} /> {live ? 'catalog live' : 'catalog syncing'}</span>;
}

function Shell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [location] = useLocation();
  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="border-b border-border bg-secondary px-4 py-2 text-center font-mono-ui text-[9px] uppercase tracking-[0.15em] text-secondary-foreground">Serving Pune & Pimpri-Chinchwad · verified materials, closer to home</div>
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-[74px] max-w-[1440px] items-center gap-5 px-5 lg:px-10">
          <Logo />
          <nav className="ml-8 hidden items-center gap-7 text-[12px] font-bold lg:flex" aria-label="Main navigation">
            <Link href="/catalog" className={location === '/catalog' ? 'text-primary' : 'hover:text-primary'} data-testid="link-nav-catalog">Shop materials</Link>
            <Link href="/business" className={location === '/business' ? 'text-primary' : 'hover:text-primary'} data-testid="link-nav-business">For business</Link>
            <Link href="/sell" className={location === '/sell' ? 'text-primary' : 'hover:text-primary'} data-testid="link-nav-sell">Sell with us</Link>
          </nav>
          <div className="ml-auto hidden w-full max-w-[330px] md:block"><SearchBar compact /></div>
          <HealthStatus />
          <div className="flex items-center gap-1">
            <Link href="/account" className="flex h-10 w-10 items-center justify-center hover:bg-muted" aria-label="Open account" data-testid="link-account"><UserRound className="h-[18px] w-[18px]" aria-hidden="true" /></Link>
            <div className="relative"><button type="button" onClick={() => setBagOpen(!bagOpen)} className="relative flex h-10 w-10 items-center justify-center hover:bg-muted" aria-label="Open shopping bag" data-testid="button-cart"><ShoppingBag className="h-[18px] w-[18px]" aria-hidden="true" /><span className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center bg-primary px-1 font-mono-ui text-[8px] text-primary-foreground">0</span></button>{bagOpen && <div className="absolute right-0 top-12 z-50 w-64 border border-border bg-card p-4 shadow-lg" role="status" data-testid="status-empty-bag"><p className="font-mono-ui text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Your bag / 00</p><p className="mt-3 text-sm font-bold">A quiet bag, for now.</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Save or add a material and it will wait here for you.</p><Link href="/catalog" onClick={() => setBagOpen(false)} className="mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-primary" data-testid="link-empty-bag">Browse materials <ArrowRight className="h-3 w-3" /></Link></div>}</div>
            <button type="button" className="flex h-10 w-10 items-center justify-center lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} data-testid="button-mobile-menu">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>
        </div>
        {menuOpen && <div className="border-t border-border bg-card px-5 py-5 lg:hidden"><div className="grid gap-4 text-sm font-bold"><Link href="/catalog" onClick={() => setMenuOpen(false)} data-testid="link-mobile-catalog">Shop materials</Link><Link href="/business" onClick={() => setMenuOpen(false)} data-testid="link-mobile-business">For business</Link><Link href="/sell" onClick={() => setMenuOpen(false)} data-testid="link-mobile-sell">Sell with us</Link><div className="pt-2"><SearchBar compact /></div></div></div>}
      </header>
      {children}
      <Footer />
    </div>
  );
}

function Footer() {
  const [helpOpen, setHelpOpen] = useState(false);
  return (
    <footer className="mt-24 border-t border-border bg-sidebar text-sidebar-foreground">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10">
        <div><Logo onDark /><p className="mt-5 max-w-xs text-sm leading-6 text-sidebar-foreground/65">A considered material library for the places Pune calls home.</p><span className="mt-8 block font-mono-ui text-[9px] uppercase tracking-[0.14em] text-sidebar-foreground/45">DD / 01—PUNE</span></div>
        <div><p className="font-mono-ui text-[10px] uppercase tracking-[0.14em] text-sidebar-foreground/45">Explore</p><div className="mt-4 grid gap-3 text-sm"><Link href="/catalog" className="hover:text-primary" data-testid="link-footer-catalog">All materials</Link><Link href="/catalog?availability=same-day" className="hover:text-primary" data-testid="link-footer-sameday">Same-day in Pune</Link><Link href="/business" className="hover:text-primary" data-testid="link-footer-business">Trade desk</Link></div></div>
        <div><p className="font-mono-ui text-[10px] uppercase tracking-[0.14em] text-sidebar-foreground/45">Work with us</p><div className="mt-4 grid gap-3 text-sm"><Link href="/sell" className="hover:text-primary" data-testid="link-footer-sell">Become a seller</Link><Link href="/account" className="hover:text-primary" data-testid="link-footer-account">Your account</Link><button type="button" onClick={() => setHelpOpen(!helpOpen)} className="w-fit text-left hover:text-primary" aria-expanded={helpOpen} data-testid="button-footer-help">Delivery & support</button>{helpOpen && <p className="max-w-[190px] text-xs leading-5 text-sidebar-foreground/60" data-testid="text-footer-help">Pune delivery questions? Send your pincode through a product page and we’ll show the quickest route.</p>}</div></div>
        <div className="border-l border-sidebar-border pl-6"><p className="font-mono-ui text-[10px] uppercase tracking-[0.14em] text-sidebar-foreground/45">For the trade</p><p className="mt-4 text-sm leading-6 text-sidebar-foreground/70">Project pricing, reliable lead times, and one person who knows your BOQ.</p><Link href="/business" className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-primary" data-testid="link-footer-quote">Start a quote <ArrowRight className="h-3.5 w-3.5" /></Link></div>
      </div>
      <div className="border-t border-sidebar-border px-5 py-4 text-center font-mono-ui text-[9px] uppercase tracking-[0.12em] text-sidebar-foreground/40">© 2025 DashDecor Marketplace · Pune, Maharashtra</div>
    </footer>
  );
}

function Home() {
  const { data, isLoading, isError, refetch } = useGetCatalogHighlights();
  const { data: categories } = useListCategories();
  const highlights = data;
  const categoryList = highlights?.categories?.length ? highlights.categories : categories;
  return (
    <main>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 paper-grid opacity-60" />
        <div className="relative mx-auto grid max-w-[1440px] gap-12 px-5 pb-16 pt-14 md:grid-cols-[1.05fr_.95fr] md:items-center md:gap-16 md:pb-24 md:pt-20 lg:px-10">
          <div className="animate-rise">
            <p className="font-mono-ui text-[10px] uppercase tracking-[0.18em] text-primary">The Pune material library / 01</p>
            <h1 className="mt-5 max-w-2xl display-serif text-[clamp(3.6rem,8vw,7.8rem)] leading-[.9] tracking-[-0.055em] text-foreground">Make room<br /><span className="text-primary">for better.</span></h1>
            <p className="mt-7 max-w-md text-[15px] leading-7 text-muted-foreground">Surfaces, fixtures and finishing details chosen for how Pune lives now. Shop from verified local businesses, without the guesswork.</p>
            <div className="mt-9 max-w-lg"><SearchBar /></div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-mono-ui text-[9px] uppercase tracking-[0.12em] text-muted-foreground"><span className="flex items-center gap-2"><Check className="h-3 w-3 text-secondary" /> verified sellers</span><span className="flex items-center gap-2"><Check className="h-3 w-3 text-secondary" /> clear pricing</span><span className="flex items-center gap-2"><Check className="h-3 w-3 text-secondary" /> local delivery</span></div>
          </div>
          <div className="animate-rise animate-rise-delay-2 relative min-h-[380px] overflow-hidden bg-secondary/15 md:min-h-[520px]">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,hsl(var(--secondary)/.09),transparent_45%,hsl(var(--primary)/.22))]" />
            <div className="absolute left-[12%] top-[12%] h-[73%] w-[56%] border border-secondary/40 bg-card/20" />
            <div className="absolute bottom-[8%] right-[8%] h-[44%] w-[42%] border border-primary/40 bg-primary/10" />
            <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between border-t border-foreground/20 pt-4"><span className="font-mono-ui text-[9px] uppercase tracking-[0.14em]">material / light / shadow</span><span className="font-mono-ui text-[9px]">18.5204° N</span></div>
            <div className="absolute left-7 top-7 font-mono-ui text-[9px] uppercase tracking-[0.14em] text-secondary">Curated locally</div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1440px] px-5 py-16 lg:px-10 lg:py-24">
        <div className="flex items-end justify-between gap-4"><div><p className="font-mono-ui text-[10px] uppercase tracking-[0.16em] text-primary">Shop by material</p><h2 className="mt-3 display-serif text-4xl tracking-[-0.04em] md:text-5xl">Start with a surface.</h2></div><Link href="/catalog" className="hidden items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] hover:text-primary md:flex" data-testid="link-home-all-materials">View all materials <ArrowRight className="h-4 w-4" /></Link></div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categoryList?.slice(0, 4).map((category, index) => <CategoryTile category={category} index={index} key={category.id} />)}
          {!categoryList && [0, 1, 2, 3].map((index) => <div key={index} className="skeleton-pulse h-64 bg-muted" data-testid={`skeleton-category-${index}`} />)}
        </div>
      </section>
      <section className="bg-card">
        <div className="mx-auto max-w-[1440px] px-5 py-16 lg:px-10 lg:py-24">
          <div className="flex items-end justify-between gap-4"><div><p className="font-mono-ui text-[10px] uppercase tracking-[0.16em] text-primary">The short list</p><h2 className="mt-3 display-serif text-4xl tracking-[-0.04em] md:text-5xl">Good bones, selected.</h2></div><Link href="/catalog" className="hidden items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] hover:text-primary md:flex" data-testid="link-home-featured">Browse catalog <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="mt-10">{isError ? <QueryError onRetry={() => { void refetch(); }} /> : isLoading ? <SkeletonGrid /> : <ProductGrid products={highlights?.featuredProducts} />}</div>
        </div>
      </section>
      <TrustBand trustSignals={highlights?.trustSignals} />
      <ServiceArea area={highlights?.serviceArea} />
    </main>
  );
}

function CategoryTile({ category, index }: { category: Category; index: number }) {
  return (
    <Link href={`/catalog?category=${category.slug}`} className={`group relative flex h-64 flex-col justify-end overflow-hidden p-5 text-primary-foreground ${index % 2 ? 'bg-primary' : 'bg-secondary'}`} data-testid={`card-category-${category.id}`}>
      <div className="absolute inset-0 opacity-45"><img src={category.imageUrl} alt="" className="h-full w-full object-cover mix-blend-luminosity" onError={(event) => { event.currentTarget.style.display = 'none'; }} /></div>
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/5 to-transparent" />
      <div className="relative"><p className="font-mono-ui text-[9px] uppercase tracking-[0.13em] text-primary-foreground/70">{String(index + 1).padStart(2, '0')} / {category.productCount} pieces</p><h3 className="mt-2 text-xl font-bold tracking-[-0.03em]">{category.name}</h3><p className="mt-1 max-w-[210px] text-xs leading-5 text-primary-foreground/75">{category.description}</p><span className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] opacity-0 group-hover:opacity-100">Explore <ArrowRight className="h-3.5 w-3.5" /></span></div>
    </Link>
  );
}

function TrustBand({ trustSignals }: { trustSignals?: string[] }) {
  const signals = trustSignals?.length ? trustSignals : ['Verified local sellers', 'Honest unit pricing', 'Delivery you can plan around'];
  return <section className="border-y border-border bg-accent/20"><div className="mx-auto grid max-w-[1440px] gap-6 px-5 py-10 md:grid-cols-3 lg:px-10">{signals.slice(0, 3).map((signal, index) => <div className="flex items-start gap-4" key={signal} data-testid={`text-trust-signal-${index}`}><span className="font-mono-ui text-[10px] text-primary">0{index + 1}</span><div><p className="text-sm font-bold">{signal}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{index === 0 ? 'Every business is checked before it joins the shelf.' : index === 1 ? 'What you see is what you budget for.' : 'Know what arrives, and when, before you buy.'}</p></div></div>)}</div></section>;
}

function ServiceArea({ area }: { area?: string }) {
  return <section className="mx-auto max-w-[1440px] px-5 py-16 lg:px-10"><div className="grid items-center gap-8 border border-border bg-secondary px-6 py-10 text-secondary-foreground md:grid-cols-[1fr_auto] md:px-12"><div><p className="font-mono-ui text-[10px] uppercase tracking-[0.16em] text-accent">Local by design</p><h2 className="mt-3 display-serif text-4xl tracking-[-0.04em]">From our shelf to your site.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-secondary-foreground/70">{area || 'Delivery across Pune and Pimpri-Chinchwad, with same-day options on selected essentials.'}</p></div><Link href="/catalog" className="inline-flex items-center justify-center gap-3 border border-secondary-foreground/30 px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] hover:bg-secondary-foreground hover:text-secondary" data-testid="link-service-area">Check your pincode <ArrowRight className="h-4 w-4" /></Link></div></section>;
}

function Catalog() {
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const paramsFromUrl = useMemo(() => new URLSearchParams(location.split('?')[1] || ''), [location]);
  const [query, setQuery] = useState(paramsFromUrl.get('q') || '');
  const [category, setCategory] = useState(paramsFromUrl.get('category') || '');
  const [brand, setBrand] = useState(paramsFromUrl.get('brand') || '');
  const [sort, setSort] = useState('relevance');
  const [availability, setAvailability] = useState('all');
  const [page, setPage] = useState(1);
  const [mobileFilters, setMobileFilters] = useState(false);
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    setQuery(urlParams.get('q') || '');
    setCategory(urlParams.get('category') || '');
    setBrand(urlParams.get('brand') || '');
    setPage(1);
  }, [location]);
  const productParams = useMemo(() => ({ q: query || undefined, category: category || undefined, brand: brand || undefined, sort: sort as 'relevance' | 'price-low' | 'price-high' | 'newest', availability: availability as 'all' | 'in-stock' | 'same-day', page, pageSize: 12 }), [query, category, brand, sort, availability, page]);
  const { data, isLoading, isError, refetch } = useListProducts(productParams);
  const { data: categories } = useListCategories();
  const { data: brands } = useListBrands();
  const totalPages = Math.max(1, Math.ceil((data?.total || 0) / (data?.pageSize || 12)));
  const clearFilters = () => { setQuery(''); setCategory(''); setBrand(''); setSort('relevance'); setAvailability('all'); setPage(1); setLocation('/catalog'); };
  return (
    <main className="mx-auto max-w-[1440px] px-5 py-10 lg:px-10 lg:py-14">
      <div className="animate-rise flex flex-col justify-between gap-5 border-b border-border pb-8 md:flex-row md:items-end"><div><p className="font-mono-ui text-[10px] uppercase tracking-[0.16em] text-primary">The full library / 02</p><h1 className="mt-3 display-serif text-5xl tracking-[-0.05em] md:text-6xl">Shop materials.</h1><p className="mt-3 text-sm text-muted-foreground">{data?.total ? `${data.total} materials ready for your next room.` : 'Browse surfaces, fixtures and finishing details.'}</p></div><div className="w-full md:w-[360px]"><SearchBar initialValue={query} /></div></div>
      <div className="mt-8 flex items-center justify-between gap-3 border-b border-border pb-4"><button type="button" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] lg:hidden" onClick={() => setMobileFilters(!mobileFilters)} data-testid="button-toggle-filters"><SlidersHorizontal className="h-4 w-4" /> Filters</button><p className="hidden text-xs text-muted-foreground lg:block" data-testid="text-catalog-count">{data?.total || 0} results</p><div className="ml-auto flex items-center gap-2"><label htmlFor="sort-products" className="font-mono-ui text-[9px] uppercase tracking-[0.1em] text-muted-foreground">Sort by</label><select id="sort-products" value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} className="h-9 border border-border bg-card px-3 text-xs font-bold outline-none" data-testid="select-sort"><option value="relevance">Relevance</option><option value="newest">Newest</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></div></div>
      <div className="grid gap-10 pt-8 lg:grid-cols-[215px_1fr]">
        <aside className={`${mobileFilters ? 'block' : 'hidden'} lg:block`} aria-label="Catalog filters"><div className="sticky top-28 space-y-8"><FilterSelect label="Category" value={category} onChange={(value) => { setCategory(value); setPage(1); }} options={categories?.map((item) => ({ value: item.slug, label: item.name })) || []} testId="select-category" /><FilterSelect label="Brand" value={brand} onChange={(value) => { setBrand(value); setPage(1); }} options={brands?.map((item) => ({ value: item.slug, label: item.name })) || []} testId="select-brand" /><div><p className="font-mono-ui text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Availability</p><div className="mt-3 grid gap-2">{[['all', 'All materials'], ['in-stock', 'In stock'], ['same-day', 'Same-day eligible']].map(([value, label]) => <label className="flex cursor-pointer items-center gap-3 text-xs" key={value}><input type="radio" name="availability" value={value} checked={availability === value} onChange={() => { setAvailability(value); setPage(1); }} className="accent-primary" data-testid={`radio-availability-${value}`} />{label}</label>)}</div></div><button type="button" onClick={clearFilters} className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-primary hover:text-foreground" data-testid="button-clear-filters">Clear all <X className="h-3 w-3" /></button></div></aside>
        <section>{isError ? <QueryError onRetry={() => { void refetch(); }} /> : isLoading ? <SkeletonGrid /> : <><ProductGrid products={data?.products} emptyLabel="Try a broader search or clear one of your filters." /><div className="mt-14 flex items-center justify-between border-t border-border pt-5"><p className="font-mono-ui text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Page {page} / {totalPages}</p><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="flex h-9 w-9 items-center justify-center border border-border disabled:opacity-35" aria-label="Previous page" data-testid="button-page-previous">←</button><button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="flex h-9 w-9 items-center justify-center border border-border disabled:opacity-35" aria-label="Next page" data-testid="button-page-next">→</button></div></div></>}</section>
      </div>
    </main>
  );
}

function FilterSelect({ label, value, onChange, options, testId }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; testId: string }) {
  return <div><label htmlFor={testId} className="font-mono-ui text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</label><div className="relative mt-3"><select id={testId} value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full appearance-none border border-border bg-card px-3 pr-8 text-xs outline-none focus:border-primary" data-testid={testId}><option value="">All {label.toLowerCase()}s</option>{options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" /></div></div>;
}

function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, isError, refetch } = useGetProduct(slug || '');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [saved, setSaved] = useState(false);
  const [added, setAdded] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  if (isLoading) return <main className="mx-auto max-w-[1440px] px-5 py-12 lg:px-10"><div className="grid gap-10 md:grid-cols-2"><div className="skeleton-pulse min-h-[520px] bg-muted" /><div className="space-y-5"><div className="h-3 w-1/4 bg-muted" /><div className="h-12 w-4/5 bg-muted" /><div className="h-6 w-1/3 bg-muted" /><div className="h-32 w-full bg-muted" /></div></div></main>;
  if (isError || !product) return <main className="mx-auto max-w-2xl px-5 py-24"><QueryError onRetry={() => { void refetch(); }} /></main>;
  const currentVariant = product.variants.find((variant) => variant.id === selectedVariant);
  const price = currentVariant?.price || product.price;
  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10 lg:py-12">
      <div className="mb-8 flex items-center gap-2 font-mono-ui text-[9px] uppercase tracking-[0.12em] text-muted-foreground"><Link href="/catalog" className="hover:text-primary" data-testid="link-breadcrumb-catalog">Catalog</Link><span>/</span><span>{product.category}</span><span>/</span><span className="text-foreground">{product.name}</span></div>
      <div className="grid gap-10 md:grid-cols-[1.06fr_.94fr] md:gap-16">
        <div className="relative"><ProductImage product={product} large /><button type="button" onClick={() => setSaved(!saved)} className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center border ${saved ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card/90 hover:border-primary hover:text-primary'}`} aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'} data-testid="button-product-wishlist"><Heart className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} /></button></div>
        <div className="animate-rise animate-rise-delay-1"><p className="font-mono-ui text-[10px] uppercase tracking-[0.14em] text-primary">{product.brand} · {product.category}</p><h1 className="mt-4 max-w-xl text-4xl font-extrabold leading-[1.03] tracking-[-0.055em] md:text-6xl">{product.name}</h1><div className="mt-5 flex items-center gap-4"><span className="flex items-center gap-1 font-mono-ui text-xs"><Star className="h-3 w-3 fill-primary text-primary" /> {product.rating.toFixed(1)} <span className="text-muted-foreground">/ {product.reviewCount} reviews</span></span>{product.badge && <span className="bg-accent px-2 py-1 font-mono-ui text-[9px] uppercase tracking-[0.1em]">{product.badge}</span>}</div><p className="mt-8 text-2xl font-extrabold">{money(price)} <span className="text-sm font-normal text-muted-foreground">/ {product.unit}</span></p>{product.compareAtPrice && <p className="mt-1 text-sm text-muted-foreground">Usually <span className="line-through">{money(product.compareAtPrice)}</span></p>}<p className="mt-7 max-w-lg text-sm leading-7 text-muted-foreground">{product.description}</p>
          {product.variants.length > 0 && <div className="mt-8 border-t border-border pt-6"><p className="font-mono-ui text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Choose a variant</p><div className="mt-3 flex flex-wrap gap-2">{product.variants.map((variant) => <button type="button" key={variant.id} onClick={() => setSelectedVariant(variant.id)} disabled={!variant.inStock} className={`border px-3 py-2 text-xs ${selectedVariant === variant.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:border-primary'} disabled:cursor-not-allowed disabled:opacity-35`} data-testid={`button-variant-${variant.id}`}>{variant.label}: {variant.value}</button>)}</div></div>}
          <div className="mt-8 flex gap-3"><button type="button" onClick={() => setAdded(true)} disabled={!product.inStock} className="flex h-12 flex-1 items-center justify-center gap-2 bg-primary text-xs font-bold uppercase tracking-[0.1em] text-primary-foreground hover:-translate-y-0.5 disabled:opacity-40" data-testid="button-add-to-bag">{added ? <><Check className="h-4 w-4" /> Added to bag</> : <><ShoppingBag className="h-4 w-4" /> Add to bag</>}</button><button type="button" onClick={() => setSaved(!saved)} className="flex h-12 w-12 items-center justify-center border border-border bg-card hover:border-primary hover:text-primary md:w-14" aria-label="Save product" data-testid="button-save-product"><Heart className={`h-4 w-4 ${saved ? 'fill-primary text-primary' : ''}`} /></button></div>
          <DeliveryCheck slug={product.slug} />
          <SellerCard product={product} />
        </div>
      </div>
      <div className="mt-20 grid gap-12 border-t border-border pt-12 md:grid-cols-[1fr_1fr]"><section><p className="font-mono-ui text-[10px] uppercase tracking-[0.14em] text-primary">Specifications</p><h2 className="mt-3 display-serif text-4xl tracking-[-0.04em]">The useful details.</h2><div className="mt-7 divide-y divide-border border-y border-border">{product.specifications.map((spec) => <div className="grid grid-cols-[.8fr_1.2fr] gap-4 py-4 text-sm" key={spec.label}><span className="text-muted-foreground">{spec.label}</span><span className="font-bold">{spec.value}</span></div>)}</div></section><section><p className="font-mono-ui text-[10px] uppercase tracking-[0.14em] text-primary">Questions, answered</p><h2 className="mt-3 display-serif text-4xl tracking-[-0.04em]">Before it arrives.</h2><div className="mt-7 divide-y divide-border border-y border-border">{product.faqs.map((faq, index) => <div key={faq.question}><button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-bold" aria-expanded={openFaq === index} data-testid={`button-faq-${index}`}>{faq.question}{openFaq === index ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}</button>{openFaq === index && <p className="pb-4 pr-8 text-sm leading-6 text-muted-foreground">{faq.answer}</p>}</div>)}</div></section></div>
    </main>
  );
}

function DeliveryCheck({ slug }: { slug: string }) {
  const [pincode, setPincode] = useState('');
  const { mutate, data, isPending, isError, reset } = useCheckServiceability();
  const submit = (event: FormEvent) => { event.preventDefault(); if (/^[0-9]{6}$/.test(pincode)) mutate({ data: { pincode, productSlug: slug } }); };
  return <div className="mt-8 border border-border bg-card p-4" data-testid="card-delivery-check"><div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-secondary" /><p className="text-sm font-bold">Check delivery to your door</p></div><form onSubmit={submit} className="mt-4 flex gap-2"><input inputMode="numeric" maxLength={6} value={pincode} onChange={(event) => { setPincode(event.target.value.replace(/\D/g, '')); reset(); }} placeholder="Enter 6-digit pincode" className="h-10 min-w-0 flex-1 border border-border bg-background px-3 text-xs outline-none focus:border-primary" aria-label="Pincode" data-testid="input-pincode" /><button type="submit" disabled={pincode.length !== 6 || isPending} className="h-10 bg-secondary px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-secondary-foreground disabled:opacity-40" data-testid="button-check-delivery">{isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Check'}</button></form>{data && <p className={`mt-3 flex items-start gap-2 text-xs leading-5 ${data.serviceable ? 'text-secondary' : 'text-destructive'}`} role="status" data-testid="status-serviceability"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />{data.message}{data.estimatedDays ? ` · ${data.estimatedDays}–${data.estimatedDays + 1} days` : ''}</p>}{isError && <p className="mt-3 text-xs text-destructive" role="alert" data-testid="status-serviceability-error">We could not check that pincode. Please try again.</p>}</div>;
}

function SellerCard({ product }: { product: Product }) {
  return <div className="mt-5 flex items-center gap-3 border-t border-border pt-5"><span className="flex h-10 w-10 items-center justify-center bg-accent text-sm font-bold text-accent-foreground">{product.seller.name.slice(0, 1)}</span><div><p className="text-xs font-bold">{product.seller.name} {product.seller.verified && <BadgeCheck className="ml-1 inline h-3.5 w-3.5 text-secondary" />}</p><p className="mt-1 font-mono-ui text-[9px] uppercase tracking-[0.1em] text-muted-foreground">{product.seller.city} · verified seller</p></div><Link href="/business" className="ml-auto text-[10px] font-bold uppercase tracking-[0.1em] text-primary" data-testid="link-view-seller">Seller details</Link></div>;
}

function EntryPage({ kind }: { kind: 'sell' | 'business' }) {
  const isBusiness = kind === 'business';
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const submit = (event: FormEvent) => { event.preventDefault(); if (email && name) setSubmitted(true); };
  return <main className="mx-auto max-w-[1440px] px-5 py-10 lg:px-10 lg:py-16"><div className="grid overflow-hidden border border-border md:grid-cols-[.9fr_1.1fr]"><div className="relative min-h-[430px] bg-secondary p-7 text-secondary-foreground md:p-12"><div className="absolute inset-0 paper-grid opacity-20" /><span className="relative font-mono-ui text-[10px] uppercase tracking-[0.16em] text-accent">{isBusiness ? 'DashDecor trade desk / 04' : 'Join the shelf / 03'}</span><h1 className="relative mt-8 max-w-lg display-serif text-5xl leading-[.98] tracking-[-0.05em] md:text-7xl">{isBusiness ? <>Source with<br /><span className="text-accent">certainty.</span></> : <>Your stock.<br /><span className="text-accent">Better found.</span></>}</h1><p className="relative mt-7 max-w-md text-sm leading-7 text-secondary-foreground/70">{isBusiness ? 'A faster way to source materials for residential, hospitality and commercial projects across Pune.' : 'Put your materials in front of homeowners, designers and businesses already looking for them.'}</p><div className="relative mt-10 flex items-center gap-3 font-mono-ui text-[9px] uppercase tracking-[0.12em] text-secondary-foreground/60"><span className="h-px w-8 bg-accent" /> Pune · Pimpri-Chinchwad</div></div><div className="bg-card p-7 md:p-12">{submitted ? <div className="flex min-h-[430px] flex-col justify-center" data-testid="status-entry-submitted"><span className="flex h-12 w-12 items-center justify-center bg-secondary text-secondary-foreground"><Check className="h-5 w-5" /></span><h2 className="mt-6 display-serif text-4xl">You’re on the list.</h2><p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">{isBusiness ? 'A member of the trade desk will reach out with the next step for your project.' : 'We’ll review your details and send the seller starter kit to your inbox.'}</p><button type="button" onClick={() => setSubmitted(false)} className="mt-7 w-fit text-xs font-bold uppercase tracking-[0.1em] text-primary" data-testid="button-entry-again">Submit another enquiry</button></div> : <div className="max-w-md"><p className="font-mono-ui text-[10px] uppercase tracking-[0.14em] text-primary">A little context goes a long way</p><h2 className="mt-4 text-3xl font-extrabold tracking-[-0.04em]">{isBusiness ? 'Tell us what you’re building.' : 'Tell us about your business.'}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{isBusiness ? 'Share a few details and we’ll match you with the right materials and verified sellers.' : 'We keep the process light. Start with your basics; we’ll take it from there.'}</p><form onSubmit={submit} className="mt-8 grid gap-5">{<Field label={isBusiness ? 'Your name' : 'Business / studio name'} value={name} onChange={setName} placeholder={isBusiness ? 'Your name' : 'e.g. Stonehouse Studio'} testId="input-entry-name" />}<Field label="Work email" type="email" value={email} onChange={setEmail} placeholder="you@company.com" testId="input-entry-email" />{isBusiness && <Field label="Project note" value="" onChange={() => undefined} placeholder="What are you sourcing?" testId="input-entry-project" textarea />}<button type="submit" className="mt-2 flex h-12 items-center justify-center gap-2 bg-primary text-xs font-bold uppercase tracking-[0.1em] text-primary-foreground hover:-translate-y-0.5" data-testid="button-entry-submit">{isBusiness ? 'Start a sourcing conversation' : 'Request seller starter kit'} <ArrowRight className="h-4 w-4" /></button><p className="text-[11px] leading-5 text-muted-foreground">By continuing, you agree to be contacted about DashDecor Marketplace.</p></form></div>}</div></div><div className="grid gap-8 border-x border-b border-border bg-background p-7 md:grid-cols-3 md:p-10">{(isBusiness ? [['01', 'One clear brief', 'Send a project need once. We’ll help shape the shortlist.'], ['02', 'Verified supply', 'Source from businesses we know and can stand behind.'], ['03', 'A human reply', 'No ticket maze. A trade desk person gets back to you.']] : [['01', 'List what you have', 'Share your material range, lead times and location.'], ['02', 'Meet better demand', 'Get discovered by people already shopping with intent.'], ['03', 'Grow with support', 'A considered storefront and a team in your corner.']]).map(([number, title, description]) => <div key={number}><span className="font-mono-ui text-[10px] text-primary">{number}</span><h3 className="mt-3 font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></div>)}</div></main>;
}

function Field({ label, value, onChange, placeholder, testId, type = 'text', textarea = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; testId: string; type?: string; textarea?: boolean }) {
  return <label className="grid gap-2 text-xs font-bold"><span>{label}</span>{textarea ? <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={3} className="resize-none border border-border bg-background px-3 py-3 text-sm font-normal outline-none focus:border-primary" data-testid={testId} /> : <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required className="h-11 border border-border bg-background px-3 text-sm font-normal outline-none focus:border-primary" data-testid={testId} />}</label>;
}

function Account() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  return <main className="mx-auto max-w-[1440px] px-5 py-10 lg:px-10 lg:py-16"><div className="grid min-h-[560px] border border-border md:grid-cols-[1fr_1fr]"><div className="relative overflow-hidden bg-primary p-8 text-primary-foreground md:p-14"><div className="absolute -right-20 -top-16 h-72 w-72 rounded-full border border-primary-foreground/20" /><div className="absolute bottom-10 right-10 h-28 w-28 rotate-45 border border-primary-foreground/30" /><p className="relative font-mono-ui text-[10px] uppercase tracking-[0.16em] text-primary-foreground/70">Your DashDecor / 05</p><h1 className="relative mt-8 max-w-sm display-serif text-5xl leading-[.98] tracking-[-0.05em] md:text-7xl">Keep your<br /><span className="text-accent">eye</span> on it.</h1><p className="relative mt-7 max-w-sm text-sm leading-7 text-primary-foreground/75">Save materials you love, keep your shortlist close, and pick up where your project left off.</p></div><div className="flex items-center bg-card p-8 md:p-14">{submitted ? <div data-testid="status-account-submitted"><span className="flex h-12 w-12 items-center justify-center bg-secondary text-secondary-foreground"><Check className="h-5 w-5" /></span><h2 className="mt-6 display-serif text-4xl">Check your inbox.</h2><p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">We sent a sign-in link to {email}. It’ll be waiting when you are.</p><button type="button" onClick={() => setSubmitted(false)} className="mt-7 text-xs font-bold uppercase tracking-[0.1em] text-primary" data-testid="button-account-again">Use another email</button></div> : <form onSubmit={(event) => { event.preventDefault(); if (email) setSubmitted(true); }} className="w-full max-w-md"><p className="font-mono-ui text-[10px] uppercase tracking-[0.14em] text-primary">Welcome back</p><h2 className="mt-4 text-3xl font-extrabold tracking-[-0.04em]">Sign in to your shelf.</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">No password to remember. We’ll email you a secure link.</p><label className="mt-8 grid gap-2 text-xs font-bold"><span>Email address</span><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="h-12 border border-border bg-background px-3 text-sm font-normal outline-none focus:border-primary" data-testid="input-account-email" /></label><button type="submit" className="mt-5 flex h-12 w-full items-center justify-center gap-2 bg-primary text-xs font-bold uppercase tracking-[0.1em] text-primary-foreground hover:-translate-y-0.5" data-testid="button-account-submit">Email me a sign-in link <ArrowRight className="h-4 w-4" /></button></form>}</div></div></main>;
}

function Router() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><Switch><Route path="/" component={Home} /><Route path="/catalog" component={Catalog} /><Route path="/product/:slug" component={ProductDetail} /><Route path="/sell"><EntryPage kind="sell" /></Route><Route path="/business"><EntryPage kind="business" /></Route><Route path="/account" component={Account} /><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Shell><Router /></Shell></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;