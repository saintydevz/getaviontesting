
import React from 'react';

export const TermsOfService: React.FC = () => {
  return (
    <div className="w-full max-w-4xl px-4 pt-48 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-bold hero-heading mb-6 leading-tight">Terms of Service</h1>
        <p className="text-zinc-500 font-medium text-lg">Last updated: June 9, 2025</p>
      </div>

      <div className="space-y-6">
        {[
          { title: "1. Introduction", content: "These Terms of Service govern your use of Avion. By purchasing or using Avion, you agree to these Terms. If you do not agree, do not use the software." },
          { title: "2. License", content: "Avion is a paid product. Purchase of a license grants you personal, non-transferable, and revocable access to the software. You may not resell, share, or distribute your license." },
          { title: "3. Blacklisting", content: "We reserve the right to block or blacklist any account, HWID, or IP address at any time, with or without notice for reasons including security bypass attempts, license sharing, or reverse engineering." },
          { title: "4. Refund Policy", content: "All sales are final. Refunds are only considered within 72 hours of purchase if the license has not been redeemed or used. Chargebacks result in permanent blacklisting." },
          { title: "5. User Responsibilities", content: "You agree not to attempt to reverse engineer, crack, or bypass the software's security. You must use the software only as intended and keep your account secure." },
          { title: "6. Data Collection", content: "By using Avion, you consent to the collection of account info, HWID, IP address, and device info for management and security enforcement." },
          { title: "7. Limitation of Liability", content: "Avion is provided 'as is' without warranties. We are not responsible for any damages or losses arising from the use of the software." },
          { title: "8. Age Requirement", content: "You must be at least 13 years old to use Avion. By using the software, you confirm that you meet this requirement." }
        ].map((item, i) => (
          <div key={i} className="bg-[#0d0d14] border border-white/[0.05] p-8 md:p-10 rounded-[32px] hover:border-[#ad92ff]/20 transition-all group">
            <h2 className="text-2xl font-bold mb-4 text-white group-hover:text-[#ad92ff] transition-colors">{item.title}</h2>
            <p className="text-zinc-500 leading-relaxed font-medium text-lg">{item.content}</p>
          </div>
        ))}
        
        <div className="bg-[#ad92ff]/5 border border-[#ad92ff]/20 p-10 rounded-[32px] text-center mt-12">
           <p className="text-zinc-400 mb-4">If you have any questions regarding these terms, contact us at:</p>
           <a href="mailto:contact@getavion.xyz" className="text-[#ad92ff] text-xl font-bold hover:underline">contact@getavion.xyz</a>
        </div>
      </div>
    </div>
  );
};
