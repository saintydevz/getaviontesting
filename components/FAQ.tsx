
import React, { useState } from 'react';

const QUESTIONS = [
  {
    q: "Is Avion free?",
    a: "Yes, It is free but you will have to go to through an ads system to bypass it you need to buy a premium key.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 10V3L4 14H11V21L20 10H13Z" />
      </svg>
    )
  },
  {
    q: "Which payment methods do you accept?",
    a: "We currently accept various payment methods including Credit/Debit cards, PayPal, Crypto (BTC/ETH/LTC), and Roblox Giftcards (RBX).",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    q: "Does it support the latest platform updates?",
    a: "Our developers monitor platform patches 24/7. Avion typically updates within 1-2 hours of a major platform release.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    )
  },
  {
    q: "Is there a key system?",
    a: "Yes, Only if you do not have an premium key and your an freemium user.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    )
  }
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold hero-heading mb-4">Common Questions.</h2>
        <p className="text-zinc-500 text-lg font-medium">Still curious? We have answers.</p>
      </div>

      <div className="flex flex-col gap-4">
        {QUESTIONS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div 
              key={i} 
              className={`group border transition-all duration-500 rounded-[24px] overflow-hidden cursor-pointer ${
                isOpen 
                ? 'bg-[#0d0d14] border-[#ad92ff]/30 shadow-[0_0_50px_rgba(173,146,255,0.05)]' 
                : 'bg-[#08080c] border-white/[0.04] hover:border-white/[0.08]'
              }`}
              onClick={() => setOpenIndex(isOpen ? null : i)}
            >
              <div className="p-6 md:p-8 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  {/* Icon Container with Glow */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
                    isOpen 
                    ? 'bg-[#ad92ff] text-[#1a1a2e] shadow-[0_0_20px_rgba(173,146,255,0.4)]' 
                    : 'bg-[#1a1b23] text-zinc-500'
                  }`}>
                    {item.icon}
                  </div>
                  
                  <h3 className={`text-lg md:text-xl font-bold transition-colors duration-300 ${
                    isOpen ? 'text-white' : 'text-zinc-400'
                  }`}>
                    {item.q}
                  </h3>
                </div>

                <div className={`transition-transform duration-500 ${isOpen ? 'rotate-180 text-white' : 'text-zinc-700 group-hover:text-zinc-500'}`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Smooth Opening Content */}
              <div className={`grid transition-all duration-500 ease-in-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100 pb-8' : 'grid-rows-[0fr] opacity-0'
              }`}>
                <div className="overflow-hidden">
                  <div className="px-6 md:px-8 pl-24 text-zinc-500 leading-relaxed font-medium text-[16px] max-w-2xl">
                    {item.a}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
