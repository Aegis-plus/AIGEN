
export type AspectRatio = 'square' | 'portrait' | 'landscape' | 'portrait-tall' | 'landscape-wide';

export type Model = {
  id: string;
  provider: string;
  name: string;
};

export type HistoryItem = {
  createdAt: number; // Use as unique ID
  prompt: string;
  modelId: string;
  hostedUrl?: string; // All new items will have a hosted URL. Optional for backward compatibility.
};
