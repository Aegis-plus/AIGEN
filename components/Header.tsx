
import React from 'react';
import { SunIcon, MoonIcon } from './icons';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isDark, toggleTheme }) => {
  return (
    <header className="bg-mantle/80 backdrop-blur-md border-b border-surface0 p-3 sticky top-0 z-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4">
        <div className="flex items-baseline gap-2.5">
          <h1 className="text-xl sm:text-2xl font-bold text-text tracking-tight">
            AI<span className="text-primary">GEN</span>
          </h1>
          <span className="text-[10px] font-bold text-primary border border-primary/50 rounded-full px-2 py-0.5 uppercase tracking-wide">
            Free
          </span>
        </div>
        
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-surface0 text-subtext hover:text-text transition-all duration-200"
          aria-label="Toggle theme"
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
};
