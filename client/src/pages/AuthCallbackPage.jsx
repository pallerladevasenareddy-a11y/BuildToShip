import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import api from '../services/api';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { setUser, setLoading } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');
  const timeoutRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    let authSubscription = null;

    async function handleAuthCallback() {
      try {
        // 1. Inspect URL parameters and hash fragments for errors from OAuth provider
        const hash = window.location.hash ? window.location.hash.substring(1) : '';
        const hashParams = new URLSearchParams(hash);
        const searchParams = new URLSearchParams(window.location.search);

        const error = hashParams.get('error') || searchParams.get('error');
        const errorDescription =
          hashParams.get('error_description') || searchParams.get('error_description');

        if (error || errorDescription) {
          const userMsg =
            errorDescription ||
            (error === 'access_denied'
              ? 'Google sign-in was cancelled or access was denied.'
              : 'Failed to authenticate with Google. Please try again.');
          if (isMounted) setErrorMessage(userMsg);
          timeoutRef.current = setTimeout(() => {
            if (isMounted) {
              navigate(`/login?error=${encodeURIComponent(userMsg)}`, { replace: true });
            }
          }, 1800);
          return;
        }

        if (!supabase) {
          const msg = 'Supabase client is not configured.';
          if (isMounted) setErrorMessage(msg);
          timeoutRef.current = setTimeout(() => {
            if (isMounted) {
              navigate(`/login?error=${encodeURIComponent(msg)}`, { replace: true });
            }
          }, 1500);
          return;
        }

        // 2. Retrieve session from Supabase (detectSessionInUrl processes tokens/hashes)
        let activeSession = null;
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.warn('[DocuSense Auth] Supabase getSession warning:', sessionError.message);
        }
        activeSession = sessionData?.session;

        // If PKCE authorization code is present in query and getSession hasn't captured it yet
        const code = searchParams.get('code');
        if (!activeSession && code) {
          try {
            const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (!exchangeError && exchangeData?.session) {
              activeSession = exchangeData.session;
            } else if (exchangeError) {
              console.warn('[DocuSense Auth] Code exchange notice:', exchangeError.message);
            }
          } catch (exchangeErr) {
            console.warn('[DocuSense Auth] exchangeCodeForSession exception:', exchangeErr.message);
          }
        }

        if (activeSession && activeSession.user) {
          const session = activeSession;
          const meta = session.user.user_metadata || {};
          const mappedUser = {
            id: session.user.id,
            fullName:
              meta.full_name || meta.name || (session.user.email ? session.user.email.split('@')[0] : 'User'),
            email: session.user.email,
            avatarUrl: meta.avatar_url || meta.picture || null,
            provider: session.user.app_metadata?.provider || 'google',
          };

          localStorage.setItem('docusense_token', session.access_token);
          localStorage.setItem('docusense_user', JSON.stringify(mappedUser));

          // Immediately update AuthContext state so PrivateRoute grants access
          if (setUser) setUser(mappedUser);
          if (setLoading) setLoading(false);

          // 3. Proactively sync profile and scope with backend
          try {
            const syncRes = await api.post('/auth/sync', {});
            if (syncRes.data?.user) {
              const fullUser = { ...mappedUser, ...syncRes.data.user };
              localStorage.setItem('docusense_user', JSON.stringify(fullUser));
              if (setUser) setUser(fullUser);
            }
          } catch (syncErr) {
            console.warn('[DocuSense] Background profile synchronization warning:', syncErr.message);
          }

          if (isMounted) {
            navigate('/', { replace: true });
          }
          return;
        }

        // 3. If session is not immediately available, subscribe briefly for onAuthStateChange
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          if (newSession && newSession.user && isMounted) {
            const meta = newSession.user.user_metadata || {};
            const mappedUser = {
              id: newSession.user.id,
              fullName:
                meta.full_name || meta.name || (newSession.user.email ? newSession.user.email.split('@')[0] : 'User'),
              email: newSession.user.email,
              avatarUrl: meta.avatar_url || meta.picture || null,
              provider: newSession.user.app_metadata?.provider || 'google',
            };

            localStorage.setItem('docusense_token', newSession.access_token);
            localStorage.setItem('docusense_user', JSON.stringify(mappedUser));

            if (setUser) setUser(mappedUser);
            if (setLoading) setLoading(false);

            try {
              const syncRes = await api.post('/auth/sync', {});
              if (syncRes.data?.user && setUser) {
                const fullUser = { ...mappedUser, ...syncRes.data.user };
                localStorage.setItem('docusense_user', JSON.stringify(fullUser));
                setUser(fullUser);
              }
            } catch {
              // Non-blocking
            }

            subscription.unsubscribe();
            navigate('/', { replace: true });
          }
        });
        authSubscription = subscription;

        // Timeout fallback if no session is captured within 6 seconds
        timeoutRef.current = setTimeout(() => {
          if (isMounted) {
            if (authSubscription) authSubscription.unsubscribe();
            navigate('/login?error=Session%20establishment%20timed%20out.%20Please%20try%20logging%20in%20again.', {
              replace: true,
            });
          }
        }, 6000);
      } catch (err) {
        console.error('[DocuSense Auth Callback Exception]:', err);
        const friendly = err.message || 'Authentication failed. Please try again.';
        if (isMounted) setErrorMessage(friendly);
        timeoutRef.current = setTimeout(() => {
          if (isMounted) {
            navigate(`/login?error=${encodeURIComponent(friendly)}`, { replace: true });
          }
        }, 2000);
      }
    }

    handleAuthCallback();

    return () => {
      isMounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [navigate, setUser, setLoading]);

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent/20 via-accent to-accent/20" />

        <div className="w-14 h-14 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent mx-auto mb-5 shadow-lg glow-teal">
          <ShieldCheck className="w-8 h-8" />
        </div>

        {errorMessage ? (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-state-error/15 border border-state-error/30 text-state-error text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <p className="text-xs text-mutedText">Redirecting to login...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
            <h3 className="text-base font-bold text-primaryText">Authenticating with Google</h3>
            <p className="text-xs text-mutedText">
              Establishing secure workspace session and restoring your audit permissions...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthCallbackPage;
