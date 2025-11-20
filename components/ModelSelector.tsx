
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
    <div className="relative w-full sm:w-72">
      <select
        id="model-select"
        value={model}
        onChange={(e) => setModel(e.target.value)}
        disabled={isLoading || models.length === 0}
        className="appearance-none bg-input border border-surface0 text-text text-sm rounded-lg focus:ring-2 focus:ring-primary focus:border-primary block w-full p-3 pr-10 transition-shadow shadow-sm"
        aria-label="Select image generation model"
      >
        <option value="" disabled className="text-subtext">
          {getLabel()}
        </option>
        {models.map((m) => (
          <option key={m.id} value={m.id} className="bg-input text-text py-2">
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
