import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { PromptInput } from './components/PromptInput';
import { ImageDisplay } from './components/ImageDisplay';
import { generateImage } from './services/AIService';
import { ModelSelector } from './components/ModelSelector';
import { Model, HistoryItem } from './types';
import { FullScreenImageViewer } from './components/FullScreenImageViewer';
import { HistoryGallery } from './components/HistoryGallery';

const ALL_MODELS: Model[] = [
  { id: '@cf/leonardo/lucid-origin', provider: 'worker', name: 'Lucid Origin (Worker)' },
  { id: '@cf/leonardo/phoenix-1.0', provider: 'worker', name: 'Phoenix 1.0 (Worker)' },
  { id: 'imagen-3', provider: 'api.airforce', name: 'Imagen 3 (API Airforce - 1/min)' },
  { id: 'imagen-4', provider: 'api.airforce', name: 'Imagen 4 (API Airforce - 1/min)' },
];

const App: React.FC = () => {
  // Image generation state
  const [prompt, setPrompt] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Model selection state
  const [selectedModelId, setSelectedModelId] = useState<string>(ALL_MODELS[0].id);

  // Cooldown state
  const [airforceCooldownUntil, setAirforceCooldownUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Full screen state
  const [fullScreenImageUrl, setFullScreenImageUrl] = useState<string | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('generationHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Failed to load history from localStorage:', error);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('generationHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save history to localStorage:', error);
    }
  }, [history]);

  useEffect(() => {
    if (!airforceCooldownUntil) {
        setCountdown(0);
        return;
    }

    const intervalId = setInterval(() => {
        const now = Date.now();
        const remaining = Math.ceil((airforceCooldownUntil - now) / 1000);

        if (remaining > 0) {
            setCountdown(remaining);
        } else {
            setCountdown(0);
            setAirforceCooldownUntil(null);
            clearInterval(intervalId);
        }
    }, 1000);
    
    // Set initial countdown value immediately
    const remaining = Math.ceil((airforceCooldownUntil - Date.now()) / 1000);
    setCountdown(remaining > 0 ? remaining : 0);

    return () => clearInterval(intervalId);
  }, [airforceCooldownUntil]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    if (!selectedModelId) {
        setError('Please select a model.');
        return;
    }

    const selectedModel = ALL_MODELS.find(m => m.id === selectedModelId);
    if (!selectedModel) {
        setError('Invalid model selected. Please try again.');
        return;
    }
    
    if (selectedModel.provider === 'api.airforce' && airforceCooldownUntil && Date.now() < airforceCooldownUntil) {
      setError(`Please wait for the cooldown to finish.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setImageUrl(null);
    
    if (selectedModel.provider === 'api.airforce') {
        setAirforceCooldownUntil(Date.now() + 60 * 1000);
    }

    try {
      const generatedImageUrl = await generateImage(prompt, selectedModel);
      setImageUrl(generatedImageUrl);

      // Add to history
      const newHistoryItem: HistoryItem = {
        imageUrl: generatedImageUrl,
        prompt,
        modelId: selectedModel.id,
        createdAt: Date.now(),
      };
      setHistory(prev => [newHistoryItem, ...prev]);

    } catch (err: any)      {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, selectedModelId, airforceCooldownUntil]);

  const openFullScreen = (url: string) => {
    setFullScreenImageUrl(url);
  };

  const closeFullScreen = () => {
    setFullScreenImageUrl(null);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const selectedModel = ALL_MODELS.find(m => m.id === selectedModelId);
  const isAirforceModelSelected = selectedModel?.provider === 'api.airforce';
  const isGenerateDisabled = isLoading || (isAirforceModelSelected && countdown > 0);

  return (
    <div className="min-h-screen bg-[#0D1117] text-gray-200 flex flex-col font-mono">
      <Header />
      <main className="flex-grow flex flex-col items-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl flex flex-col items-center gap-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cyan-400" style={{ textShadow: '0 0 8px rgba(0, 187, 255, 0.7)' }}>
              SYNTHESIZE REALITY
            </h2>
            <p className="mt-2 text-lg text-gray-400">
              Input data stream. Generate visual output.
            </p>
          </div>
          
          <ImageDisplay
            imageUrl={imageUrl}
            isLoading={isLoading}
            error={error}
            onImageClick={openFullScreen}
          />

          <HistoryGallery
            history={history}
            models={ALL_MODELS}
            onImageClick={openFullScreen}
            onClearHistory={handleClearHistory}
          />
        </div>
      </main>
      <footer className="w-full p-4 sticky bottom-0 bg-[#0D1117]/80 backdrop-blur-sm border-t border-cyan-500/20">
        <div className="max-w-4xl mx-auto flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <ModelSelector
              model={selectedModelId}
              setModel={setSelectedModelId}
              isLoading={isLoading}
              models={ALL_MODELS}
            />
            <PromptInput
              prompt={prompt}
              setPrompt={setPrompt}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              isDisabled={isGenerateDisabled}
              countdown={countdown}
            />
          </div>
          <div className="text-center text-xs text-gray-500 pt-1">
            <span>Made by <a href="http://www.aegis.zone.id" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">AEGIS+</a></span>
            <span className="mx-2">|</span>
            <span>Powered by <a href="https://g4f.dev" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">g4f.dev</a></span>
          </div>
        </div>
      </footer>
      {fullScreenImageUrl && (
        <FullScreenImageViewer imageUrl={fullScreenImageUrl} onClose={closeFullScreen} />
      )}
    </div>
  );
};

export default App;