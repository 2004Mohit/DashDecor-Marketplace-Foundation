import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type ProtectedIntent = 'wishlist' | 'bag' | 'buyNow' | 'account';

type AuthPrompt = {
  intent: ProtectedIntent;
  returnTo?: string;
} | null;

type AuthContextValue = {
  isAuthenticated: boolean;
  authPrompt: AuthPrompt;
  requireAuth: (intent: ProtectedIntent, returnTo?: string) => void;
  dismissAuthPrompt: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authPrompt, setAuthPrompt] = useState<AuthPrompt>(null);

  // Phase 1 deliberately stops at the provider boundary. The future auth
  // adapter can replace this value without changing protected-action callers.
  const value: AuthContextValue = {
    isAuthenticated: false,
    authPrompt,
    requireAuth: (intent, returnTo) => setAuthPrompt({ intent, returnTo }),
    dismissAuthPrompt: () => setAuthPrompt(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}