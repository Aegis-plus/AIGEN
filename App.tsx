
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { PromptInput } from './components/PromptInput';
import { ImageDisplay } from './components/ImageDisplay';
import { generateImage, hostImage } from './services/AIService';
import { ModelSelector } from './components/ModelSelector';
import { Model, HistoryItem, AspectRatio } from './types';
import { FullScreenImageViewer } from './components/FullScreenImageViewer';
import { HistoryGallery } from './components/HistoryGallery';
import { AspectRatioSelector } from './components/AspectRatioSelector';
import { loadHistoryFromStorage, saveHistoryToStorage, clearHistoryInStorage, ITEMS_PER_PAGE } from './services/historyService';
import { getDisplayUrl } from './utils/helpers';

const ALL_MODELS: Model[] = [
  { id: '@cf/leonardo/lucid-origin', provider: 'worker', name: 'Lucid Origin (Leonardo)' },
  { id: '@cf/leonardo/phoenix-1.0', provider: 'worker', name: 'Phoenix 1.0 (Leonardo)' },
  { id: 'imagen-3', provider: 'api.airforce', name: 'Imagen 3 (Google)' },
  { id: 'imagen-4', provider: 'api.airforce', name: 'Imagen 4 (Google)' },
  { id: 'ByteDance/Seedream-4', provider: 'deep-infra', name: 'Seedream 4 (ByteDance)' },
];

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
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Full screen state
  const [fullScreenHistoryId, setFullScreenHistoryId] = useState<number | null>(null);

  // Load history and prompt from localStorage on mount
  useEffect(() => {
    setHistory(loadHistoryFromStorage());
    const savedPrompt = localStorage.getItem('lastPrompt');
    if (savedPrompt) {
      setPrompt(savedPrompt);
    }
  }, []);
  
  // Save prompt to localStorage whenever it changes
  useEffect(() => {
    try {
      if (prompt) {
        localStorage.setItem('lastPrompt', prompt);
      }
    } catch (error) {
      console.error('Failed to save prompt to localStorage:', error);
    }
  }, [prompt]);

  // Cooldown countdown timer effect
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
    
    const remaining = Math.ceil((airforceCooldownUntil - Date.now()) / 1000);
    setCountdown(remaining > 0 ? remaining : 0);

    return () => clearInterval(intervalId);
  }, [airforceCooldownUntil]);

  // Automatically adjust settings based on the selected model
  useEffect(() => {
    const currentModel = ALL_MODELS.find(m => m.id === selectedModelId);
    if (currentModel?.provider !== 'worker') {
      setAspectRatio('square');
    }
  }, [selectedModelId]);

  // Adjust history page if it goes out of bounds
  useEffect(() => {
    const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
    if (historyPage > totalPages && totalPages > 0) {
      setHistoryPage(totalPages);
    } else if (history.length === 0) {
      setHistoryPage(1);
    }
  }, [history, historyPage]);

  const updateAndSaveHistory = useCallback((newHistory: HistoryItem[]) => {
    try {
      const originalLength = newHistory.length;
      const savedHistory = saveHistoryToStorage(newHistory);
      setHistory(savedHistory);
      
      if (savedHistory.length < originalLength) {
        setHistoryError('Storage limit reached. Oldest items were removed to make space.');
        setTimeout(() => setHistoryError(null), 5000);
      } else {
        setHistoryError(null);
      }
    } catch (e: any) {
      setHistoryError(e.message || 'Could not save history.');
      setTimeout(() => setHistoryError(null), 5000);
    }
  }, []);

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
      const result = await generateImage(prompt, selectedModel, aspectRatio);
      
      const displayUrl = result.type === 'b64_json'
        ? `data:image/png;base64,${result.data}`
        : result.data;

      const baseHistoryItem = {
        prompt,
        modelId: selectedModel.id,
        createdAt: Date.now(),
      };

      if (selectedModel.id === 'ByteDance/Seedream-4') {
        // For Seedream, add to history immediately without hosting.
        const newHistoryItem: HistoryItem = { ...baseHistoryItem };
        if (result.type === 'url') {
          newHistoryItem.hostedUrl = result.data;
        } else {
          // If it's base64, save it in the source field for local display.
          newHistoryItem.source = result;
        }
        updateAndSaveHistory([newHistoryItem, ...history]);
        setImageUrl(getDisplayUrl(newHistoryItem));
        setHistoryPage(1);
      } else {
        // For all other models, host the image first before adding to history.
        const hostedUrl = await hostImage(result);
        
        const newHistoryItem: HistoryItem = {
          ...baseHistoryItem,
          hostedUrl: hostedUrl, // Only store the final, hosted URL
        };
        
        updateAndSaveHistory([newHistoryItem, ...history]);
        setImageUrl(getDisplayUrl(newHistoryItem));
        setHistoryPage(1);
      }
    } catch (err: any)      {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, selectedModelId, airforceCooldownUntil, aspectRatio, history, updateAndSaveHistory]);

  const openFullScreen = (createdAt: number) => {
    setFullScreenHistoryId(createdAt);
  };

  const closeFullScreen = () => {
    setFullScreenHistoryId(null);
  };
  
  const handleFullScreenNavigate = (direction: 'prev' | 'next') => {
    if (!fullScreenHistoryId) return;
    
    const currentIndex = history.findIndex(item => item.createdAt === fullScreenHistoryId);
    if (currentIndex === -1) return;

    let newIndex;
    // History is sorted newest to oldest (0 is newest).
    // 'prev' moves to a newer item (lower index).
    // 'next' moves to an older item (higher index).
    if (direction === 'next') {
        newIndex = currentIndex + 1;
    } else { // prev
        newIndex = currentIndex - 1;
    }

    if (newIndex >= 0 && newIndex < history.length) {
        setFullScreenHistoryId(history[newIndex].createdAt);
    }
  };

  const handleClearHistory = () => {
    try {
      clearHistoryInStorage();
      setHistory([]);
      setHistoryPage(1);
    } catch (e: any) {
      setHistoryError(e.message || 'Could not clear history.');
      setTimeout(() => setHistoryError(null), 5000);
    }
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

  const fullScreenHistoryItem = fullScreenHistoryId
    ? history.find(item => item.createdAt === fullScreenHistoryId)
    : null;

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
            onImageClick={() => {
              // The main display always shows the latest generated image, which is history[0].
              if (history.length > 0) {
                openFullScreen(history[0].createdAt);
              }
            }}
          />

          <div className="w-full flex flex-col gap-4">
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
          </div>
          
          {historyError && (
            <div role="alert" aria-live="polite" className="w-full text-center text-xs text-yellow-400/90 animate-fade-in p-2 bg-yellow-900/20 border border-yellow-500/30 rounded-md">
              {historyError}
            </div>
          )}

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
      <footer className="w-full p-4">
        <div className="text-center text-xs text-gray-500">
          <span>Made by <a href="http://www.aegis.zone.id" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">AEGIS+</a></span>
          <span className="mx-2">|</span>
          <span>Powered by <a href="https://g4f.dev" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">g4f.dev</a></span>
        </div>
      </footer>
      {fullScreenHistoryItem && (
        <FullScreenImageViewer
          historyItem={fullScreenHistoryItem}
          history={history}
          models={ALL_MODELS}
          onClose={closeFullScreen}
          onNavigate={handleFullScreenNavigate}
        />
      )}
    </div>
  );
};

export default App;
