import React from 'react';
import { Model } from '../types';
import { ChevronDownIcon } from './icons';

interface ModelSelectorProps {
  model: string;
  setModel: (model: string) => void;
  isLoading: boolean;
  models: Model[];
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ model, setModel, isLoading, models }) => {
  
  const getLabel = () => {
    if (models.length === 0) return 'No models available';
    return 'Select a model...';
  }

  return (
    <div className="relative w-64 flex-shrink-0">
      <select
        id="model-select"
        value={model}
        onChange={(e) => setModel(e.target.value)}
        disabled={isLoading || models.length === 0}
        className="appearance-none bg-black/50 border-2 border-gray-700 text-gray-200 text-sm rounded-md focus:ring-cyan-500 focus:border-cyan-500 block w-full p-3 font-mono pr-10"
        aria-label="Select image generation model"
      >
        <option value="" disabled className="text-gray-500 bg-[#0D1117]">
          {getLabel()}
        </option>
        {models.map((m) => (
          <option key={m.id} value={m.id} className="bg-[#0D1117] text-gray-200">
            {m.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
        <ChevronDownIcon />
      </div>
    </div>
  );
};