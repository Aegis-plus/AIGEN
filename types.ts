
export type Model = {
  id: string;
  provider: string;
  name: string;
};

export type HistoryItem = {
  imageUrl: string;
  prompt: string;
  modelId: string;
  createdAt: number;
};
