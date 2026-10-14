import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('docusense_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Initialize and synchronize authentication state
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        if (supabase) {
          // 1. Check for active Supabase session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            console.warn('[DocuSense Auth] Supabase getSession warning:', sessionError.message);
          }

          if (session && session.user) {
            const meta = session.user.user_metadata || {};
            const mappedUser = {
              id: session.user.id,
              fullName: meta.full_name || meta.name || (session.user.email ? session.user.email.split('@')[0] : 'User'),
              email: session.user.email,
              avatarUrl: meta.avatar_url || meta.picture || null,
              provider: session.user.app_metadata?.provider || 'google',
            };

            localStorage.setItem('docusense_token', session.access_token);
            localStorage.setItem('docusense_user', JSON.stringify(mappedUser));
            if (isMounted) setUser(mappedUser);

            // Synchronize with backend API to ensure profile and data scoping exist
            try {
              const res = await api.get('/auth/me');
              if (res.data?.success && res.data?.user && isMounted) {
                setUser((prev) => ({
                  ...prev,
                  ...res.data.user,
                  avatarUrl: res.data.user.avatarUrl || mappedUser.avatarUrl,
                }));
                localStorage.setItem(
                  'docusense_user',
                  JSON.stringify({
                    ...mappedUser,
                    ...res.data.user,
                    avatarUrl: res.data.user.avatarUrl || mappedUser.avatarUrl,
                  })
                );
              }
            } catch (syncErr) {
              // Non-blocking: session remains authenticated locally
              console.warn('[DocuSense Auth] Background user profile sync notice:', syncErr.message);
            }

            if (isMounted) setLoading(false);
            return;
          }
        }

        // 2. Fallback to existing token in localStorage (for demo or credentials login)
        const localToken = localStorage.getItem('docusense_token');
        if (localToken) {
          try {
            const res = await api.get('/auth/me');
            if (res.data?.success && isMounted) {
              setUser(res.data.user);
              localStorage.setItem('docusense_user', JSON.stringify(res.data.user));
            }
          } catch (err) {
            localStorage.removeItem('docusense_token');
            localStorage.removeItem('docusense_user');
            if (isMounted) setUser(null);
          }
        }
      } catch (err) {
        console.error('[DocuSense Auth Initialization Error]:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    // 3. Subscribe to Supabase auth state changes (OAuth redirect completion, token refresh, sign out)
    let authSubscription = null;
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;

        if (session && session.user) {
          const meta = session.user.user_metadata || {};
          const mappedUser = {
            id: session.user.id,
            fullName: meta.full_name || meta.name || (session.user.email ? session.user.email.split('@')[0] : 'User'),
            email: session.user.email,
            avatarUrl: meta.avatar_url || meta.picture || null,
            provider: session.user.app_metadata?.provider || 'google',
          };

          localStorage.setItem('docusense_token', session.access_token);
          localStorage.setItem('docusense_user', JSON.stringify(mappedUser));
          setUser(mappedUser);

          // Verify/sync with backend
          try {
            const res = await api.get('/auth/me');
            if (res.data?.success && res.data?.user && isMounted) {
              setUser((prev) => ({
                ...prev,
                ...res.data.user,
                avatarUrl: res.data.user.avatarUrl || mappedUser.avatarUrl,
              }));
            }
          } catch {
            // Non-blocking
          }
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem('docusense_token');
          localStorage.removeItem('docusense_user');
          setUser(null);
        }
      });
      authSubscription = subscription;
    }

    return () => {
      isMounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  // Dynamic origin resolution for OAuth redirect URL
  const getOAuthRedirectUrl = () => {
    if (typeof window !== 'undefined' && window.location?.origin) {
      const origin = window.location.origin.replace(/\/$/, '');
      return `${origin}/auth/callback`;
    }
    const envUrl = import.meta.env.VITE_SITE_URL || import.meta.env.VITE_FRONTEND_URL;
    if (envUrl) {
      return `${envUrl.replace(/\/$/, '')}/auth/callback`;
    }
    return 'http://localhost:5173/auth/callback';
  };

  // Google OAuth Sign-in through Supabase Auth
  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error(
        'Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.'
      );
    }

    const callbackUrl = getOAuthRedirectUrl();
    console.log('[DocuSense Auth] Initiating Google OAuth with redirect destination:', callbackUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      throw error;
    }

    return data;
  };

  // Password Login (Existing / Demo workflow preservation)
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      setUser(res.data.user);
      localStorage.setItem('docusense_token', res.data.token);
      localStorage.setItem('docusense_user', JSON.stringify(res.data.user));
      return res.data;
    }
  };

  // Registration
  const register = async (fullName, email, password, confirmPassword) => {
    const res = await api.post('/auth/register', {
      fullName,
      email,
      password,
      confirmPassword,
    });
    if (res.data?.success) {
      setUser(res.data.user);
      localStorage.setItem('docusense_token', res.data.token);
      localStorage.setItem('docusense_user', JSON.stringify(res.data.user));
      return res.data;
    }
  };

  // Logout
  const logout = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors during signout
    } finally {
      localStorage.removeItem('docusense_token');
      localStorage.removeItem('docusense_user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        setLoading,
        isSupabaseConfigured,
        signInWithGoogle,
        login,
        register,
        logout,
        getOAuthRedirectUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
