
import React from 'react';
import { View } from '../App';

interface NavbarProps {
  currentView: View;
  setView: (view: View) => void;
  user: { email: string; username: string } | null;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView, user, onSignOut }) => {
  const scrollToOrNavigate = (id: string) => {
    if (currentView !== 'home') {
      setView('home');
      // Small timeout to allow home to render before scrolling
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-auto">
      <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/[0.08] rounded-full px-8 py-3.5 flex items-center gap-12 shadow-2xl">
        <div 
          onClick={() => setView('home')}
          className="text-white font-bold text-lg tracking-tighter cursor-pointer hover:opacity-80 transition-opacity"
        >
          AVION
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => setView('home')} className={`text-[13px] font-medium transition-colors ${currentView === 'home' ? 'text-white' : 'text-zinc-400 hover:text-white'}`}>Home</button>
          <button onClick={() => scrollToOrNavigate('features')} className="text-[13px] font-medium text-zinc-400 hover:text-white transition-colors">Features</button>
          <button onClick={() => scrollToOrNavigate('pricing')} className="text-[13px] font-medium text-zinc-400 hover:text-white transition-colors">Pricing</button>
          <button onClick={() => scrollToOrNavigate('faq')} className="text-[13px] font-medium text-zinc-400 hover:text-white transition-colors">FAQ</button>
        </div>

        {user ? (
          <button 
            onClick={() => setView('dashboard')}
            className={`text-[12px] font-bold px-5 py-1.5 rounded-full transition-all active:scale-95 ${
              currentView === 'dashboard' ? 'bg-white text-black' : 'bg-[#ad92ff] text-[#1a1a2e] hover:brightness-110'
            }`}
          >
            Dashboard
          </button>
        ) : (
          <button 
            onClick={() => setView('signin')}
            className="bg-[#ad92ff] text-[#1a1a2e] text-[12px] font-bold px-6 py-1.5 rounded-full hover:brightness-110 transition-all active:scale-95"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};
