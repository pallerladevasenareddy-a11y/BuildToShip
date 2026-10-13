import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@docusense.ai');
    setPassword('DemoPass123!');
    setError('');
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center items-center p-4 selection:bg-accent selection:text-canvas">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent/20 via-accent to-accent/20" />

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent mx-auto mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-primaryText tracking-tight">DocuSense AI</h2>
          <p className="text-sm text-mutedText mt-1">Intelligent Document Processing &amp; Invoice Auditor</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-state-error/15 border border-state-error/30 text-state-error text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-mutedText uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full px-4 py-2.5 rounded-lg bg-surface border border-border text-primaryText placeholder-mutedText/50 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-mutedText uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg bg-surface border border-border text-primaryText placeholder-mutedText/50 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-accent text-canvas font-semibold text-sm hover:bg-accent-hover transition-colors flex items-center justify-center gap-2 shadow-lg glow-teal disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Shortcut */}
        <div className="mt-6 pt-6 border-t border-border text-center">
          <button
            type="button"
            onClick={handleFillDemo}
            className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-medium"
          >
            <KeyRound className="w-3.5 h-3.5" />
            Auto-fill Pre-seeded Demo Credentials (Arjun Mehta)
          </button>
        </div>

        {/* Switch to Register */}
        <p className="mt-6 text-center text-xs text-mutedText">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent hover:underline font-semibold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
