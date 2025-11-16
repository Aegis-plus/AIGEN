import React from 'react';
import { Model } from '../types';

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
    <div className="w-64 flex-shrink-0">
      <select
        id="model-select"
        value={model}
        onChange={(e) => setModel(e.target.value)}
        disabled={isLoading || models.length === 0}
        className="bg-black/50 border-2 border-gray-700 text-gray-200 text-sm rounded-md focus:ring-cyan-500 focus:border-cyan-500 block w-full p-3 font-mono"
        aria-label="Select image generation model"
      >
        <option value="" disabled>
          {getLabel()}
        </option>
        {models.map((m) => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>
    </div>
  );
};