
import React from 'react';
import { AspectRatio } from '../types';

interface AspectRatioSelectorProps {
  selectedRatio: AspectRatio;
  onRatioChange: (ratio: AspectRatio) => void;
  isDisabled: boolean;
}

const SquareIcon: React.FC = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 3h18v18H3z"/></svg>;
const PortraitIcon: React.FC = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 3h12v18H6z"/></svg>;
const LandscapeIcon: React.FC = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 6h18v12H3z"/></svg>;
const PortraitTallIcon: React.FC = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 3h8v18H8z"/></svg>;
const LandscapeWideIcon: React.FC = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 8h18v8H3z"/></svg>;


const RATIOS: { id: AspectRatio; label: string; icon: React.ReactElement; }[] = [
  { id: 'portrait-tall', label: '9:16', icon: <PortraitTallIcon /> },
  { id: 'portrait', label: '3:4', icon: <PortraitIcon /> },
  { id: 'square', label: '1:1', icon: <SquareIcon /> },
  { id: 'landscape', label: '4:3', icon: <LandscapeIcon /> },
  { id: 'landscape-wide', label: '16:9', icon: <LandscapeWideIcon /> },
];

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selectedRatio, onRatioChange, isDisabled }) => {
  return (
    <div className="flex bg-input border border-surface0 rounded-lg p-1 gap-1 flex-shrink-0 overflow-x-auto shadow-sm">
      {RATIOS.map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => onRatioChange(id)}
          disabled={isDisabled}
          className={`flex items-center justify-center px-3 py-2 text-xs sm:text-sm rounded-md transition-all duration-200 whitespace-nowrap
            ${selectedRatio === id 
              ? 'bg-primary text-base font-semibold shadow-sm' 
              : 'text-subtext hover:bg-surface0 hover:text-text'
            }
            disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-pressed={selectedRatio === id}
          title={`Aspect ratio: ${label}`}
        >
          {icon}
          <span className="hidden lg:inline ml-1.5">{label}</span>
        </button>
      ))}
    </div>
  );
};
