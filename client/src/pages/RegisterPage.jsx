import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

export function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must be at least 8 characters and include at least one uppercase letter and one number.');
      return;
    }

    setLoading(true);
    try {
      await register(fullName, email, password, confirmPassword);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center items-center p-4 selection:bg-accent selection:text-canvas">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent/20 via-accent to-accent/20" />

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent mx-auto mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-primaryText tracking-tight">Create Account</h2>
          <p className="text-sm text-mutedText mt-1">Get started with AI-powered invoice auditing</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-state-error/15 border border-state-error/30 text-state-error text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-mutedText uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Arjun Mehta"
              className="w-full px-4 py-2.5 rounded-lg bg-surface border border-border text-primaryText placeholder-mutedText/50 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-mutedText uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="arjun@company.com"
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
            <p className="text-[10px] text-mutedText mt-1">Min 8 chars, 1 uppercase, 1 number</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-mutedText uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg bg-surface border border-border text-primaryText placeholder-mutedText/50 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-accent text-canvas font-semibold text-sm hover:bg-accent-hover transition-colors flex items-center justify-center gap-2 shadow-lg glow-teal disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-mutedText">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
