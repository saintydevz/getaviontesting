
import React from 'react';

const FEATURE_LIST = [
  {
    title: "100% UNC Support",
    description: "Fully compatible with the Unified Naming Convention, ensuring every script runs exactly as intended.",
    icon: (props: any) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  },
  {
    title: "Stable Environment",
    description: "Built on a custom-engineered kernel that prevents crashes and maintains performance under heavy loads.",
    icon: (props: any) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
  },
  {
    title: "200+ Functions",
    description: "Access a massive library of built-in functions designed to give you complete control over your environment.",
    icon: (props: any) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
  },
  {
    title: "Security First",
    description: "Integrated obfuscation and anti-tamper mechanisms to keep your scripts and identity protected.",
    icon: (props: any) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
  }
];

export const Features: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold hero-heading mb-4">Powerful Core.</h2>
        <p className="text-zinc-500 text-lg font-medium">Everything you need to dominate the scene.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {FEATURE_LIST.map((feature, i) => (
          <div key={i} className="bg-[#0a0a0f] border border-white/[0.05] p-8 rounded-3xl hover:border-[#ad92ff]/30 transition-all group">
            <div className="w-12 h-12 bg-[#ad92ff]/10 rounded-2xl flex items-center justify-center text-[#ad92ff] mb-6 group-hover:scale-110 transition-transform">
              <feature.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-zinc-500 leading-relaxed font-medium text-[15px]">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
