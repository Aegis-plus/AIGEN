import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-[#0D1117]/50 backdrop-blur-sm border-b border-cyan-500/30 p-4 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex items-baseline justify-center gap-2">
        <h1 className="text-3xl font-bold text-white tracking-widest" style={{ textShadow: '0 0 8px rgba(0, 187, 255, 0.7)' }}>
          A<span className="text-cyan-400">I</span>GEN
        </h1>
        <span className="text-xs font-bold text-cyan-500 border border-cyan-500 rounded-full px-2 py-0.5 tracking-wider">
          FREE
        </span>
      </div>
    </header>
  );
};