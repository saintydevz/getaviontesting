import React, { useState, useEffect } from 'react';
import { View } from '../App';
import { authHelpers } from '../lib/supabase';
import { Turnstile } from './Turnstile';
import { CONFIG } from '../lib/config';

interface AuthProps {
  initialView: View;
  setView: (view: View) => void;
  onSignIn: (email: string, username: string, userId: string) => void;
}

const TURNSTILE_SITE_KEY = CONFIG.TURNSTILE_SITE_KEY;

export const Auth: React.FC<AuthProps> = ({ initialView, setView, onSignIn }) => {
  const [isSignUp, setIsSignUp] = useState(initialView === 'signup');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setView(!isSignUp ? 'signup' : 'signin');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!turnstileToken && !isLocalhost) {
      setError('Please complete the security verification.');
      return;
    }

    if (isSignUp && !licenseKey.trim()) {
      setError('Please enter a valid license key.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { user } = await authHelpers.signUp(email, password, username);
        onSignIn(email, username, user.id);
      } else {
        const { data, error: signInError }: any = await authHelpers.signIn(email, password);
        if (signInError) throw signInError;
        onSignIn(email, data.user.username, data.user.id);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-md mt-48 px-4 flex flex-col items-center transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
      <div className="text-center mb-10 h-32 flex flex-col justify-center">
        <h2 className="text-5xl font-bold hero-heading mb-4 transition-all duration-500">
          {isSignUp ? 'Get Started.' : 'Welcome Back.'}
        </h2>
        <p className="text-zinc-500 font-medium transition-all duration-500">
          {isSignUp ? 'Unlock the full power of Avion.' : 'Continue your journey with Avion.'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full bg-[#0d0d14] border border-white/[0.05] p-10 rounded-[32px] shadow-2xl space-y-5 relative overflow-hidden transition-all duration-500"
      >
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
          <input
            type="email"
            required
            disabled={isLoading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/40 border border-white/[0.06] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#ad92ff]/40 transition-all text-[14px] font-medium placeholder:text-zinc-800 disabled:opacity-50"
            placeholder="name@example.com"
          />
        </div>

        <div className={`grid transition-all duration-500 ease-in-out ${isSignUp ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
          <div className="overflow-hidden space-y-5">
            <div className="space-y-2 pt-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Username</label>
              <input
                type="text"
                required={isSignUp}
                disabled={isLoading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.06] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#ad92ff]/40 transition-all text-[14px] font-medium placeholder:text-zinc-800 disabled:opacity-50"
                placeholder="avion_user"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">License Key</label>
              <input
                type="text"
                required={isSignUp}
                disabled={isLoading}
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                className="w-full bg-black/40 border border-white/[0.06] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#ad92ff]/40 transition-all text-[14px] font-mono uppercase tracking-wider placeholder:text-zinc-800 disabled:opacity-50"
                placeholder="AVION-XXXX-XXXX-XXXX"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Password</label>
          <input
            type="password"
            required
            disabled={isLoading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/40 border border-white/[0.06] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#ad92ff]/40 transition-all text-[14px] font-medium placeholder:text-zinc-800 disabled:opacity-50"
            placeholder="••••••••"
            minLength={6}
          />
        </div>

        <div className="pt-2">
          <Turnstile
            siteKey={TURNSTILE_SITE_KEY}
            onVerify={(token) => setTurnstileToken(token)}
            onError={() => setError('Security verification failed.')}
            onExpire={() => setTurnstileToken(null)}
            theme="dark"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || (!turnstileToken && !(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))}
          className="w-full bg-[#ad92ff] text-[#1a1a2e] font-bold py-4 rounded-2xl hover:brightness-110 transition-all active:scale-[0.98] mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-[#1a1a2e]/30 border-t-[#1a1a2e] rounded-full animate-spin" />
          ) : (
            isSignUp ? 'Create Account' : 'Sign In'
          )}
        </button>

        <p className="text-center text-zinc-500 text-sm font-medium pt-2 transition-all">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button type="button" onClick={toggleMode} className="text-[#ad92ff] hover:underline font-bold" disabled={isLoading}>
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>

        <div className="flex items-center justify-center gap-2 pt-4 text-zinc-700 text-xs">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Protected by Cloudflare Turnstile</span>
        </div>
      </form>
    </div>
  );
};
