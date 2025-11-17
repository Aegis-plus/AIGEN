
import React, { useState, useEffect } from 'react';
import { AspectRatio } from '../types';
import { ChevronDownIcon } from './icons';

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


const RATIOS: { id: AspectRatio; label: string; icon: React.ReactElement; descriptiveLabel: string; }[] = [
  { id: 'portrait-tall', label: '9:16', icon: <PortraitTallIcon />, descriptiveLabel: '9:16 (Tall)' },
  { id: 'portrait', label: '3:4', icon: <PortraitIcon />, descriptiveLabel: '3:4 (Portrait)' },
  { id: 'square', label: '1:1', icon: <SquareIcon />, descriptiveLabel: '1:1 (Square)' },
  { id: 'landscape', label: '4:3', icon: <LandscapeIcon />, descriptiveLabel: '4:3 (Landscape)' },
  { id: 'landscape-wide', label: '16:9', icon: <LandscapeWideIcon />, descriptiveLabel: '16:9 (Wide)' },
];

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selectedRatio, onRatioChange, isDisabled }) => {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobileView) {
    return (
      <div className="relative flex-1">
        <select
          value={selectedRatio}
          onChange={(e) => onRatioChange(e.target.value as AspectRatio)}
          disabled={isDisabled}
          className="appearance-none bg-black/50 border-2 border-gray-700 text-gray-200 text-sm rounded-md focus:ring-cyan-500 focus:border-cyan-500 block w-full p-3 font-mono pr-10"
          aria-label="Select aspect ratio"
        >
          {RATIOS.map(({ id, descriptiveLabel }) => (
            <option key={id} value={id} className="bg-[#0D1117] text-gray-200">
              {descriptiveLabel}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
          <ChevronDownIcon />
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-black/50 border-2 border-gray-700 rounded-md p-1 gap-1 flex-shrink-0">
      {RATIOS.map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => onRatioChange(id)}
          disabled={isDisabled}
          className={`flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md transition-colors duration-200
            ${selectedRatio === id 
              ? 'bg-cyan-500 text-black font-bold' 
              : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
            }
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400`}
          aria-pressed={selectedRatio === id}
          title={`Aspect ratio: ${label}`}
        >
          {icon}
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
};
