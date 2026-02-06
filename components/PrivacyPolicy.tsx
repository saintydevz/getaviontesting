
import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="w-full max-w-4xl px-4 pt-48 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-bold hero-heading mb-6 leading-tight">Privacy Policy</h1>
        <p className="text-zinc-500 font-medium text-lg">Last updated: September 21, 2025</p>
      </div>

      <div className="space-y-6">
        {[
          { title: "1. Introduction", content: "Your privacy matters. This policy explains how Avion collects, uses, and protects your information. By using our services, you agree to these practices." },
          { title: "2. Information We Collect", content: "We collect basic account data (username/email), your Hardware ID (HWID) to lock licenses, and IP addresses to prevent multi-region abuse and security breaches." },
          { title: "3. How We Use Data", content: "Data is used for license verification, account management, and security enforcement. We DO NOT sell or share your data with third parties for marketing purposes." },
          { title: "4. Data Security", content: "We implement robust security measures to protect your sensitive info. Passwords are salted and hashed. However, no digital system is 100% impenetrable." },
          { title: "5. Blacklisting Rights", content: "We reserve the right to blacklist HWIDs or accounts that violate our terms. This data is retained indefinitely to maintain platform integrity." },
          { title: "6. Data Retention", content: "We retain your information as long as your account is active. You may request account deletion via our support tickets." }
        ].map((item, i) => (
          <div key={i} className="bg-[#0d0d14] border border-white/[0.05] p-8 md:p-10 rounded-[32px] hover:border-[#ad92ff]/20 transition-all group">
            <h2 className="text-2xl font-bold mb-4 text-white group-hover:text-[#ad92ff] transition-colors">{item.title}</h2>
            <p className="text-zinc-500 leading-relaxed font-medium text-lg">{item.content}</p>
          </div>
        ))}

        <div className="bg-[#ad92ff]/5 border border-[#ad92ff]/20 p-10 rounded-[32px] text-center mt-12">
           <p className="text-zinc-400 mb-4">For data-related inquiries, reach out to our privacy team:</p>
           <a href="mailto:contact@getavion.xyz" className="text-[#ad92ff] text-xl font-bold hover:underline">contact@getavion.xyz</a>
        </div>
      </div>
    </div>
  );
};
