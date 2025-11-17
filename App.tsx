
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { PromptInput } from './components/PromptInput';
import { ImageDisplay } from './components/ImageDisplay';
import { generateImage } from './services/AIService';
import { ModelSelector } from './components/ModelSelector';
import { Model, HistoryItem, AspectRatio } from './types';
import { FullScreenImageViewer } from './components/FullScreenImageViewer';
import { HistoryGallery } from './components/HistoryGallery';
import { AspectRatioSelector } from './components/AspectRatioSelector';

const ALL_MODELS: Model[] = [
  { id: '@cf/leonardo/lucid-origin', provider: 'worker', name: 'Lucid Origin (Leonardo)' },
  { id: '@cf/leonardo/phoenix-1.0', provider: 'worker', name: 'Phoenix 1.0 (Leonardo)' },
  { id: 'imagen-3', provider: 'api.airforce', name: 'Imagen 3 (Google)' },
  { id: 'imagen-4', provider: 'api.airforce', name: 'Imagen 4 (Google)' },
  { id: 'ByteDance/Seedream-4', provider: 'deep-infra', name: 'Seedream 4 (ByteDance)' },
];

const ITEMS_PER_PAGE = 10;

const App: React.FC = () => {
  // Image generation state
  const [prompt, setPrompt] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Model selection state
  const [selectedModelId, setSelectedModelId] = useState<string>(ALL_MODELS[0].id);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('square');

  // Cooldown state
  const [airforceCooldownUntil, setAirforceCooldownUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyPage, setHistoryPage] = useState<number>(1);

  // Full screen state
  const [fullScreenData, setFullScreenData] = useState<{imageUrl: string, prompt: string} | null>(null);

  // Load history and prompt from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('generationHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
      const savedPrompt = localStorage.getItem('lastPrompt');
      if (savedPrompt) {
        setPrompt(savedPrompt);
      }
    } catch (error) {
      console.error('Failed to load state from localStorage:', error);
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
  
  // Save prompt to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('lastPrompt', prompt);
    } catch (error) {
      console.error('Failed to save prompt to localStorage:', error);
    }
  }, [prompt]);

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

  // Automatically adjust settings based on the selected model
  useEffect(() => {
    const currentModel = ALL_MODELS.find(m => m.id === selectedModelId);
    // For any provider other than 'worker', force square aspect ratio as others are unreliable.
    if (currentModel?.provider !== 'worker') {
      setAspectRatio('square');
    }
  }, [selectedModelId]);

  // Adjust history page if it goes out of bounds
  useEffect(() => {
    const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
    if (historyPage > totalPages && totalPages > 0) {
      setHistoryPage(totalPages);
    }
  }, [history, historyPage]);

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
      const generatedImageUrl = await generateImage(prompt, selectedModel, aspectRatio);
      setImageUrl(generatedImageUrl);

      // Add to history
      const newHistoryItem: HistoryItem = {
        imageUrl: generatedImageUrl,
        prompt,
        modelId: selectedModel.id,
        createdAt: Date.now(),
      };
      setHistory(prev => [newHistoryItem, ...prev]);
      setHistoryPage(1); // Go to first page to show the new item

    } catch (err: any)      {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, selectedModelId, airforceCooldownUntil, aspectRatio]);

  const openFullScreen = (imageUrl: string, prompt: string) => {
    setFullScreenData({ imageUrl, prompt });
  };

  const closeFullScreen = () => {
    setFullScreenData(null);
  };

  const handleClearHistory = () => {
    setHistory([]);
    setHistoryPage(1);
  };

  const selectedModel = ALL_MODELS.find(m => m.id === selectedModelId);
  const isAirforceModelSelected = selectedModel?.provider === 'api.airforce';
  const isWorkerModelSelected = selectedModel?.provider === 'worker';
  const isGenerateDisabled = isLoading || (isAirforceModelSelected && countdown > 0);

  const getButtonText = () => {
    if (isLoading) return 'SYNTHESIZING...';
    if (isAirforceModelSelected && countdown > 0) return `RECHARGING (${countdown}s)`;
    return 'GENERATE';
  };
  
  const totalHistoryPages = Math.ceil(history.length / ITEMS_PER_PAGE);
  const paginatedHistory = history.slice(
    (historyPage - 1) * ITEMS_PER_PAGE,
    historyPage * ITEMS_PER_PAGE
  );

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
            onImageClick={(url) => openFullScreen(url, prompt)}
          />

          {history.length > 0 && (
            <HistoryGallery
              history={paginatedHistory}
              models={ALL_MODELS}
              onImageClick={openFullScreen}
              onClearHistory={handleClearHistory}
              currentPage={historyPage}
              totalPages={totalHistoryPages}
              onPageChange={setHistoryPage}
            />
          )}
        </div>
      </main>
      <footer className="w-full p-2 sticky bottom-0 bg-[#0D1117]/80 backdrop-blur-sm border-t border-cyan-500/20">
        <div className="max-w-4xl mx-auto flex flex-col gap-2">
          <PromptInput
            prompt={prompt}
            setPrompt={setPrompt}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            isSubmitDisabled={isGenerateDisabled}
          />
          <div className="flex flex-wrap items-stretch gap-2">
            <ModelSelector
              model={selectedModelId}
              setModel={setSelectedModelId}
              isLoading={isLoading}
              models={ALL_MODELS}
            />
            {isWorkerModelSelected && (
              <AspectRatioSelector
                selectedRatio={aspectRatio}
                onRatioChange={setAspectRatio}
                isDisabled={isLoading}
              />
            )}
            <button
              onClick={handleGenerate}
              disabled={isGenerateDisabled || !prompt.trim()}
              className="flex-grow flex items-center justify-center px-4 py-2 bg-cyan-500 text-black font-bold rounded-md shadow-lg hover:bg-cyan-400 hover:shadow-cyan-500/50 disabled:hover:shadow-none disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span>{getButtonText()}</span>
            </button>
          </div>
          {!isWorkerModelSelected && (
            <p className="text-center text-xs text-yellow-400/80 mt-1">
                Note: Aspect ratio selection is only available for Leonardo models.
            </p>
          )}
          <div className="text-center text-xs text-gray-500 pt-1">
            <span>Made by <a href="http://www.aegis.zone.id" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">AEGIS+</a></span>
            <span className="mx-2">|</span>
            <span>Powered by <a href="https://g4f.dev" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">g4f.dev</a></span>
          </div>
        </div>
      </footer>
      {fullScreenData && (
        <FullScreenImageViewer
          imageUrl={fullScreenData.imageUrl}
          prompt={fullScreenData.prompt}
          onClose={closeFullScreen}
        />
      )}
    </div>
  );
};

export default App;
