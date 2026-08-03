import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getToken, setUnauthenticatedHandler } from '../services/api';
import {
  getCurrentUser,
  signIn as signInRequest,
  signOut as signOutRequest,
  ROLE_PROPRIETOR,
  type CurrentUser,
} from '../services/auth';

interface AuthState {
  user: CurrentUser | null;
  /** True until the stored token has been checked against the API on first load. */
  loading: boolean;
  isProprietor: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = useCallback(() => {
    signOutRequest();
    setUser(null);
  }, []);

  // A stored token may have expired while the tab was closed. Nothing may be rendered
  // behind a guard until the API has confirmed it.
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    getCurrentUser()
      .then((current) => {
        if (!cancelled) setUser(current);
      })
      .catch(() => {
        if (!cancelled) signOut();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [signOut]);

  // Any 401 from any request drops the session, so an expired token does not leave the
  // app sitting on a page it can no longer load.
  useEffect(() => {
    setUnauthenticatedHandler(() => setUser(null));
    return () => setUnauthenticatedHandler(null);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setUser(await signInRequest(email, password));
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      isProprietor: user?.role === ROLE_PROPRIETOR,
      signIn,
      signOut,
    }),
    [user, loading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider.');
  }

  return context;
}
