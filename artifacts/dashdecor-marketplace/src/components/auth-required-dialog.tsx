import { ArrowRight, LockKeyhole, X } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/lib/auth';

const intentCopy = {
  wishlist: {
    eyebrow: 'Save your shortlist',
    title: 'Keep this material close.',
    body: 'Sign in to save materials across visits and return to your project shortlist whenever you need it.',
  },
  bag: {
    eyebrow: 'Build your project bag',
    title: 'Your materials should travel with you.',
    body: 'Sign in to add materials to your project bag and pick up your sourcing plan on any device.',
  },
  buyNow: {
    eyebrow: 'Continue your purchase',
    title: 'Ready when you are.',
    body: 'Sign in to continue with this purchase and keep your delivery details connected to the order.',
  },
  account: {
    eyebrow: 'Your DashDecor',
    title: 'Your shelf starts here.',
    body: 'Sign in to see saved materials, project bags and the sourcing conversations you have started.',
  },
} as const;

export function AuthRequiredDialog() {
  const { authPrompt, dismissAuthPrompt } = useAuth();
  useEffect(() => {
    if (!authPrompt) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismissAuthPrompt();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [authPrompt, dismissAuthPrompt]);
  if (!authPrompt) return null;

  const copy = intentCopy[authPrompt.intent];
  const accountHref = authPrompt.returnTo ? `/account?returnTo=${encodeURIComponent(authPrompt.returnTo)}` : '/account';
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-foreground/45 p-0 backdrop-blur-[2px] md:items-center md:p-6" role="presentation" data-testid="overlay-auth-required">
      <div
        className="relative w-full max-w-lg border border-border bg-card p-7 shadow-2xl animate-rise md:p-9"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-required-title"
        aria-describedby="auth-required-body"
        data-testid="dialog-auth-required"
      >
        <button
          type="button"
          onClick={dismissAuthPrompt}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center border border-border text-muted-foreground hover:border-primary hover:text-foreground"
          aria-label="Close sign-in prompt"
          data-testid="button-auth-required-close"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
        <span className="flex h-11 w-11 items-center justify-center bg-primary text-primary-foreground" data-testid="icon-auth-required">
          <LockKeyhole className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="mt-7 font-mono-ui text-[10px] uppercase tracking-[0.16em] text-primary" data-testid="text-auth-required-eyebrow">{copy.eyebrow}</p>
        <h2 id="auth-required-title" className="mt-3 display-serif text-4xl leading-none tracking-[-0.04em]" data-testid="text-auth-required-title">{copy.title}</h2>
         <p id="auth-required-body" className="mt-4 max-w-md text-sm leading-6 text-muted-foreground" data-testid="text-auth-required-body">{copy.body}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={accountHref}
            onClick={dismissAuthPrompt}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 bg-primary px-5 text-xs font-bold uppercase tracking-[0.1em] text-primary-foreground hover:-translate-y-0.5"
            data-testid="link-auth-required-account"
          >
            Continue to sign in <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={dismissAuthPrompt}
            className="h-12 border border-border bg-background px-5 text-xs font-bold uppercase tracking-[0.1em] hover:border-primary"
            data-testid="button-auth-required-later"
          >
            Keep browsing
          </button>
        </div>
        <p className="mt-5 font-mono-ui text-[9px] uppercase leading-5 tracking-[0.1em] text-muted-foreground" data-testid="text-auth-provider-boundary">
          Secure sign-in is provided by the DashDecor identity provider.
        </p>
      </div>
    </div>
  );
}