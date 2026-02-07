import React from 'react';

export const Hero: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
      <h1 className="text-6xl md:text-[84px] hero-heading mb-8 leading-[1.05] font-bold">
        Experience The<br />Future.
      </h1>

      <p className="max-w-[580px] text-[#9ca3af] text-lg md:text-[19px] leading-[1.6] mb-12 px-4 font-normal tracking-tight">
        One of the most powerful Roblox scripting utulities<br className="hidden md:block" />
        available. Seamless execution, stable, and a 100%<br className="hidden md:block" />
        UNC environment with over 200 functions to use.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button className="btn-purple flex items-center justify-center gap-3 px-10 py-3.5 rounded-xl font-bold text-[14px] hover:brightness-110 transition-all active:scale-[0.98] shadow-lg shadow-purple-500/10">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 3.449L9.75 2.1V11.719H0V3.449ZM0 12.332H9.75V21.9L0 20.551V12.332ZM10.706 1.969L24 0V11.719H10.706V1.969ZM10.706 12.332H24V24L10.706 22.031V12.332Z" />
          </svg>
          Download for Windows
        </button>

        <button className="btn-discord flex items-center justify-center gap-3 px-7 py-3.5 rounded-xl font-bold text-[14px] hover:bg-[#20212b] transition-all active:scale-[0.98]">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2758-3.68-.2758-5.4868 0-.1636-.3905-.4051-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1971.3728.2914a.077.077 0 01-.0066.1277 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
          </svg>
          Join Discord
        </button>
      </div>
    </div>
  );
};
