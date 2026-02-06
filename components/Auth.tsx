
import React, { useState, useEffect } from 'react';
import { View } from '../App';
import { supabase, authHelpers, licenseHelpers, generateHWID } from '../lib/supabase';
import { Turnstile } from './Turnstile';

interface AuthProps {
  initialView: View;
  setView: (view: View) => void;
  onSignIn: (email: string, username: string, userId: string) => void;
}

// Turnstile Site Key
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAACYnEq-AJqvPrwIy';

// Rate limit tracking (client-side supplement to server-side)
const rateLimitTracker = {
  attempts: 0,
  lastAttempt: 0,
  lockoutUntil: 0,

  canAttempt(): boolean {
    const now = Date.now();
    if (now < this.lockoutUntil) return false;
    if (now - this.lastAttempt > 60000) {
      this.attempts = 0;
    }
    return this.attempts < 5;
  },

  recordAttempt(): void {
    this.attempts++;
    this.lastAttempt = Date.now();
    if (this.attempts >= 5) {
      this.lockoutUntil = Date.now() + 300000; // 5 minute lockout
    }
  },

  getRemainingLockout(): number {
    if (Date.now() >= this.lockoutUntil) return 0;
    return Math.ceil((this.lockoutUntil - Date.now()) / 1000);
  }
};

export const Auth: React.FC<AuthProps> = ({ initialView, setView, onSignIn }) => {
  const [isSignUp, setIsSignUp] = useState(initialView === 'signup');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Lockout countdown
  useEffect(() => {
    if (lockoutTime > 0) {
      const interval = setInterval(() => {
        const remaining = rateLimitTracker.getRemainingLockout();
        setLockoutTime(remaining);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutTime]);

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setView(!isSignUp ? 'signup' : 'signin');
    setError(null);
    // Don't reset turnstileToken - keep the verification
  };

  const handleTurnstileVerify = (token: string) => {
    setTurnstileToken(token);
    setTurnstileError(false);
  };

  const handleTurnstileError = () => {
    setTurnstileError(true);
    setError('Security verification failed. Please refresh and try again.');
  };

  const handleTurnstileExpire = () => {
    setTurnstileToken(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check Turnstile verification
    if (!turnstileToken) {
      setError('Please complete the security verification.');
      return;
    }

    // Check rate limit
    if (!rateLimitTracker.canAttempt()) {
      setLockoutTime(rateLimitTracker.getRemainingLockout());
      setError(`Too many attempts. Please wait ${rateLimitTracker.getRemainingLockout()} seconds.`);
      return;
    }

    setIsLoading(true);
    rateLimitTracker.recordAttempt();

    try {
      if (isSignUp) {
        // Enforce Mandatory License Key Validation BEFORE Account Creation
        const key = licenseKey.trim();
        if (!key) {
          setError('License key is required for sign up.');
          setIsLoading(false);
          return;
        }

        // 1. Validate License Key Existence and Status
        const license = await licenseHelpers.validateLicenseKey(key);

        if (!license) {
          setError('Invalid license key. Please check and try again.');
          setIsLoading(false);
          return;
        }

        if (license.user_id) {
          setError('This license key is already in use by another account.');
          setIsLoading(false);
          return;
        }

        // 2. Proceed with Sign Up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          // Create profile
          const hwid = generateHWID();
          const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            email,
            username,
            hwid,
          });

          if (profileError && !profileError.message.includes('duplicate')) {
            console.warn('Profile creation warning:', profileError);
          }

          // 3. Activate the License Key - CRITICAL STEP
          try {
            await licenseHelpers.activateLicenseKey(key, data.user.id, hwid);
          } catch (licenseError: any) {
            console.error('License activation failed:', licenseError);
            setError(`Account created, but license activation failed: ${licenseError.message}. Please contact support.`);
            // In a production app, we might want to delete the user here to prevent "zombie" accounts
            // But for now, we just rely on the Dashboard blocking them.
            setIsLoading(false);
            return;
          }

          onSignIn(email, username, data.user.id);
        }
      } else {
        // Sign In Flow
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        if (data.user) {
          // Get profile for username
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', data.user.id)
            .single();

          const displayName = profile?.username || email.split('@')[0];

          // Update last login
          await supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', data.user.id);

          onSignIn(email, displayName, data.user.id);
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);

      // User-friendly error messages
      if (err.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (err.message.includes('Email not confirmed')) {
        setError('Please check your email to confirm your account.');
      } else if (err.message.includes('User already registered')) {
        setError('An account with this email already exists. Try signing in.');
      } else if (err.message.includes('Password')) {
        setError('Password must be at least 6 characters long.');
      } else {
        setError(err.message || 'An error occurred. Please try again.');
      }

      // Reset Turnstile on error
      setTurnstileToken(null);
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
          {isSignUp ? 'Unlock the full power of Avion scripting.' : 'Continue your scripting journey with Avion.'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full bg-[#0d0d14] border border-white/[0.05] p-10 rounded-[32px] shadow-2xl space-y-5 overflow-hidden transition-all duration-500"
      >
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Lockout Warning */}
        {lockoutTime > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-amber-400 text-sm font-medium">
              Rate limited. Try again in {lockoutTime}s
            </p>
          </div>
        )}

        {/* Common Field: Email */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
          <input
            type="email"
            required
            disabled={isLoading || lockoutTime > 0}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/40 border border-white/[0.06] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#ad92ff]/40 transition-all text-[14px] font-medium placeholder:text-zinc-800 disabled:opacity-50"
            placeholder="name@example.com"
          />
        </div>

        {/* Sliding Extra Fields: Username */}
        <div className={`grid transition-all duration-500 ease-in-out ${isSignUp ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
          <div className="overflow-hidden space-y-5">
            <div className="space-y-2 pt-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Username</label>
              <input
                type="text"
                required={isSignUp}
                disabled={isLoading || lockoutTime > 0}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.06] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#ad92ff]/40 transition-all text-[14px] font-medium placeholder:text-zinc-800 disabled:opacity-50"
                placeholder="avion_user"
              />
            </div>
          </div>
        </div>

        {/* Common Field: Password */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Password</label>
          <input
            type="password"
            required
            disabled={isLoading || lockoutTime > 0}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/40 border border-white/[0.06] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#ad92ff]/40 transition-all text-[14px] font-medium placeholder:text-zinc-800 disabled:opacity-50"
            placeholder="••••••••"
            minLength={6}
          />
        </div>

        {/* Sliding Extra Fields: License Key */}
        <div className={`grid transition-all duration-500 ease-in-out ${isSignUp ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
          <div className="overflow-hidden space-y-5">
            <div className="space-y-2 pt-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">License Key (Required)</label>
              <input
                type="text"
                required={isSignUp}
                disabled={isLoading || lockoutTime > 0}
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                className="w-full bg-black/40 border border-white/[0.06] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#ad92ff]/40 transition-all text-[14px] font-medium uppercase tracking-wider placeholder:text-zinc-800 disabled:opacity-50"
                placeholder="AVION-XXXX-XXXX-XXXX"
              />
            </div>
          </div>
        </div>

        {/* Cloudflare Turnstile */}
        <div className="pt-2">
          <Turnstile
            siteKey={TURNSTILE_SITE_KEY}
            onVerify={handleTurnstileVerify}
            onError={handleTurnstileError}
            onExpire={handleTurnstileExpire}
            theme="dark"
          />
          {turnstileToken && (
            <div className="flex items-center justify-center gap-2 mt-3 text-emerald-400 text-xs">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Security verified</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || lockoutTime > 0 || !turnstileToken}
          className="w-full bg-[#ad92ff] text-[#1a1a2e] font-bold py-4 rounded-2xl hover:brightness-110 transition-all active:scale-[0.98] mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-[#1a1a2e]/30 border-t-[#1a1a2e] rounded-full animate-spin" />
              {isSignUp ? 'Verifying Key & creating...' : 'Signing In...'}
            </>
          ) : (
            isSignUp ? 'Activate & Join' : 'Sign In'
          )}
        </button>

        <p className="text-center text-zinc-500 text-sm font-medium pt-2 transition-all">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button type="button" onClick={toggleMode} className="text-[#ad92ff] hover:underline font-bold" disabled={isLoading}>
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>

        {/* Security Info */}
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
