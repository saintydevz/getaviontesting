
import React from 'react';

const RESELLERS = [
  { name: "floodline", website: "https://floodline.mysellauth.com", contact: "discord.gg/floodline" },
  { name: "munch", website: "https://munch.mysellauth.com", contact: "Discord: me8j" },
];

export const Resellers: React.FC = () => {
  return (
    <div className="w-full max-w-4xl px-4 pt-48 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center mb-20">
        <div className="inline-flex items-center gap-2 bg-[#ad92ff]/10 text-[#ad92ff] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          Verified Partners
        </div>
        <h1 className="text-5xl md:text-7xl font-bold hero-heading mb-6 leading-tight">Official Resellers</h1>
        <p className="text-zinc-500 font-medium text-lg max-w-2xl mx-auto">Only purchase from authorized partners to ensure your keys are valid and supported by Avion.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {RESELLERS.map((r, i) => (
          <div key={i} className="bg-[#0d0d14] border border-white/[0.05] p-10 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-8 hover:border-[#ad92ff]/30 transition-all group">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-[#ad92ff]/10 rounded-2xl flex items-center justify-center text-[#ad92ff]">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white group-hover:text-[#ad92ff] transition-colors capitalize">{r.name}</h2>
                <p className="text-zinc-500 font-medium mt-1">{r.contact}</p>
              </div>
            </div>
            
            <a 
              href={r.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-black font-bold px-10 py-4 rounded-2xl hover:bg-[#ad92ff] transition-all active:scale-95"
            >
              Visit Store
            </a>
          </div>
        ))}
      </div>
      
      <div className="mt-20 p-10 bg-white/5 border border-white/10 rounded-[40px] text-center">
        <h3 className="text-xl font-bold mb-4">Want to become a reseller?</h3>
        <p className="text-zinc-500 mb-8 max-w-lg mx-auto leading-relaxed">Join our Discord community and create a support ticket to apply for our official reseller program.</p>
        <button className="text-[#ad92ff] font-bold text-lg hover:underline">Apply Now →</button>
      </div>
    </div>
  );
};
