
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
  
  hostedUrl?: string;
  source?: {
    type: 'url' | 'b64_json';
    data: string;
  };
};
