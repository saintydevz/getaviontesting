
import React from 'react';

const PRANS = [
  {
    name: "Standard",
    price: "$0",
    period: "Free",
    features: ["Undetected", "Full sUNC", "Key system (ads)", "Discord Support", "Undetected"],
    buttonText: "Get Started",
    highlight: false
  },
  {
    name: "Weekly",
    price: "$4.99",
    period: "per Week",
    features: ["Priority execution", "Full sUNC environment", "Private Discord role", "Discord Support", "Undetected"],
    buttonText: "Buy Now",
    highlight: true
  },
  {
    name: "Monthly",
    price: "$12.50",
    period: "per Month",
    features: ["Priority execution", "Full sUNC environment", "Private Discord role", "Discord Support", "Undetected"],
    buttonText: "Subscribe",
    highlight: false
  }
];

export const Pricing: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold hero-heading mb-4">Simple Pricing.</h2>
        <p className="text-zinc-500 text-lg font-medium">Choose the path that fits your journey.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PRANS.map((plan, i) => (
          <div
            key={i}
            className={`relative p-10 rounded-3xl flex flex-col ${plan.highlight
              ? 'bg-[#ad92ff]/10 border-[#ad92ff]/40'
              : 'bg-[#0a0a0f] border-white/[0.05]'
              } border`}
          >
            {plan.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#ad92ff] text-[#1a1a2e] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
            )}
            <div className="text-zinc-400 text-sm font-bold uppercase tracking-widest mb-6">{plan.name}</div>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-5xl font-bold">{plan.price}</span>
              <span className="text-zinc-500 font-medium">{plan.period}</span>
            </div>

            <div className="flex flex-col gap-4 mb-10 flex-1">
              {plan.features.map((feature, j) => (
                <div key={j} className="flex items-center gap-3 text-sm font-medium text-zinc-400">
                  <svg className="w-5 h-5 text-[#ad92ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </div>
              ))}
            </div>

            <button className={`w-full py-4 rounded-2xl font-bold transition-all active:scale-95 ${plan.highlight
              ? 'bg-[#ad92ff] text-[#1a1a2e] hover:brightness-110'
              : 'bg-white/5 text-white hover:bg-white/10'
              }`}>
              {plan.buttonText}
            </button>
          </div>
        ))
        }
      </div >
    </div >
  );
};
