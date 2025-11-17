import React from 'react';
import { AspectRatio } from '../types';

interface AspectRatioSelectorProps {
  selectedRatio: AspectRatio;
  onRatioChange: (ratio: AspectRatio) => void;
  isDisabled: boolean;
}

const SquareIcon: React.FC = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 3h18v18H3z"/></svg>;
const PortraitIcon: React.FC = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 3h12v18H6z"/></svg>;
const LandscapeIcon: React.FC = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 6h18v12H3z"/></svg>;
const PortraitTallIcon: React.FC = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 3h8v18H8z"/></svg>;
const LandscapeWideIcon: React.FC = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 8h18v8H3z"/></svg>;


const RATIOS: { id: AspectRatio; label: string; icon: React.ReactElement; }[] = [
  { id: 'portrait-tall', label: '9:16', icon: <PortraitTallIcon /> },
  { id: 'portrait', label: '3:4', icon: <PortraitIcon /> },
  { id: 'square', label: '1:1', icon: <SquareIcon /> },
  { id: 'landscape', label: '4:3', icon: <LandscapeIcon /> },
  { id: 'landscape-wide', label: '16:9', icon: <LandscapeWideIcon /> },
];

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selectedRatio, onRatioChange, isDisabled }) => {
  return (
    <div className="flex bg-black/50 border-2 border-gray-700 rounded-md p-1 gap-1 flex-shrink-0">
      {RATIOS.map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => onRatioChange(id)}
          disabled={isDisabled}
          className={`flex items-center justify-center px-2 md:px-3 py-2 text-sm rounded-md transition-colors duration-200
            ${selectedRatio === id 
              ? 'bg-cyan-500 text-black font-bold' 
              : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
            }
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400`}
          aria-pressed={selectedRatio === id}
          title={`Aspect ratio: ${label}`}
        >
          {icon}
          <span className="hidden md:inline ml-2">{label}</span>
        </button>
      ))}
    </div>
  );
};
