
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AppPreview } from './components/AppPreview';
import { Features } from './components/Features';
import { Pricing } from './components/Pricing';
import { FAQ } from './components/FAQ';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { TermsOfService } from './components/TermsOfService';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { Resellers } from './components/Resellers';
import { Docs } from './components/Docs';
import { CloudflareLoading } from './components/CloudflareLoading';
import { supabase } from './lib/supabase';

export type View = 'home' | 'signin' | 'signup' | 'dashboard' | 'tos' | 'privacy' | 'resellers' | 'docs';

interface UserData {
  email: string;
  username: string;
  id: string;
}

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserData | null>(null);
  const [showSecurityCheck, setShowSecurityCheck] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for existing Supabase session
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Get user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', session.user.id)
            .single();

          setUser({
            email: session.user.email || '',
            username: profile?.username || session.user.email?.split('@')[0] || 'User',
            id: session.user.id,
          });
        } else {
          // Fallback to localStorage for backwards compatibility
          const savedUser = localStorage.getItem('avion_user');
          if (savedUser) {
            const parsed = JSON.parse(savedUser);
            setUser(parsed);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Fallback to localStorage
        const savedUser = localStorage.getItem('avion_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();

        const userData: UserData = {
          email: session.user.email || '',
          username: profile?.username || session.user.email?.split('@')[0] || 'User',
          id: session.user.id,
        };

        setUser(userData);
        localStorage.setItem('avion_user', JSON.stringify(userData));
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('avion_user');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
    localStorage.removeItem('avion_user');
    setUser(null);
    navigate('/');
  };

  const handleSignIn = (email: string, username: string, userId: string) => {
    const userData: UserData = { email, username, id: userId };
    setUser(userData);
    localStorage.setItem('avion_user', JSON.stringify(userData));
    navigate('/dashboard');
  };

  const setView = (view: View) => {
    const pathMap: Record<View, string> = {
      home: '/',
      signin: '/auth',
      signup: '/auth',
      dashboard: '/dashboard',
      tos: '/os',
      privacy: '/privacy',
      resellers: '/resellers',
      docs: '/docs'
    };
    navigate(pathMap[view]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentView = (): View => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/auth') return 'signin';
    if (path === '/dashboard') return 'dashboard';
    if (path === '/os') return 'tos';
    if (path === '/privacy') return 'privacy';
    if (path === '/resellers') return 'resellers';
    if (path === '/docs') return 'docs';
    return 'home';
  };

  // Show Cloudflare security check
  if (showSecurityCheck) {
    return <CloudflareLoading onVerified={() => setShowSecurityCheck(false)} />;
  }

  // Show loading while initializing auth
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#ad92ff]/20 border-t-[#ad92ff] rounded-full animate-spin" />
          <p className="text-zinc-500 font-medium">Loading Avion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white relative flex flex-col items-center overflow-x-hidden">
      <Navbar currentView={currentView()} setView={setView} user={user} onSignOut={handleSignOut} />

      <div className="absolute top-[50%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#ad92ff]/15 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 w-full flex flex-col items-center flex-grow">
        <Routes>
          <Route path="/" element={
            <>
              <section id="home" className="w-full max-w-6xl px-4 pt-32 md:pt-48 flex flex-col items-center">
                <Hero />
                <div className="mt-16 md:mt-20 w-full flex justify-center relative">
                  <AppPreview />
                </div>
              </section>
              <section id="features" className="w-full mt-32">
                <Features />
              </section>
              <section id="pricing" className="w-full mt-32">
                <Pricing />
              </section>
              <section id="faq" className="w-full mt-32">
                <FAQ />
              </section>
            </>
          } />

          <Route path="/auth" element={
            <Auth initialView="signin" setView={setView} onSignIn={handleSignIn} />
          } />

          <Route path="/dashboard" element={
            user ? <Dashboard user={user} onSignOut={handleSignOut} /> : <Auth initialView="signin" setView={setView} onSignIn={handleSignIn} />
          } />

          <Route path="/os" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/resellers" element={<Resellers />} />
          <Route path="/docs" element={<Docs />} />
        </Routes>
      </main>

      <footer className="w-full max-w-6xl mt-32 mb-16 px-4">
        <div className="flex flex-col md:flex-row items-center justify-between border-t border-white/[0.05] pt-12 gap-8">
          <div className="flex flex-col items-center md:items-start">
            <div className="text-white font-bold text-xl tracking-tighter mb-2">AVION</div>
            <div className="opacity-40 text-[11px] font-medium tracking-widest uppercase">
              © 2026 Avion. All rights reserved.
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            <button onClick={() => setView('tos')} className="text-zinc-500 hover:text-[#ad92ff] text-sm font-medium transition-colors">Terms of Service</button>
            <button onClick={() => setView('privacy')} className="text-zinc-500 hover:text-[#ad92ff] text-sm font-medium transition-colors">Privacy Policy</button>
            <button onClick={() => setView('resellers')} className="text-zinc-500 hover:text-[#ad92ff] text-sm font-medium transition-colors">Resellers</button>
            <button onClick={() => setView('docs')} className="text-zinc-500 hover:text-[#ad92ff] text-sm font-medium transition-colors">Documentation</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
