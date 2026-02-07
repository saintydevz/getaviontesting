import React from 'react';

export const AppPreview: React.FC = () => {
  return (
    <div className="w-full max-w-2xl rounded-2xl overflow-hidden border border-white/[0.08] bg-[#000000] shadow-[0_40px_100px_rgba(0,0,0,0.9)] flex flex-col transition-transform duration-700 hover:scale-[1.01]">
      <div className="relative group">
        <img
          src="https://i.imgur.com/u2AH7J4.png"
          alt="App Preview"
          className="w-full h-auto object-cover opacity-95 transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 pointer-events-none" />
      </div>
    </div>
  );
};
