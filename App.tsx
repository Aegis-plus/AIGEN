
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { PromptInput } from './components/PromptInput';
import { ImageDisplay } from './components/ImageDisplay';
import { generateImage, hostImage, b64toBlob } from './services/AIService';
import { ModelSelector } from './components/ModelSelector';
import { Model, HistoryItem, AspectRatio } from './types';
import { FullScreenImageViewer } from './components/FullScreenImageViewer';
import { HistoryGallery } from './components/HistoryGallery';
import { AspectRatioSelector } from './components/AspectRatioSelector';
import { loadHistoryFromStorage, saveHistoryToStorage, clearHistoryInStorage, ITEMS_PER_PAGE } from './services/historyService';
import { getDisplayUrl, isPWA } from './utils/helpers';
import { saveImageToDB, clearImagesFromDB } from './services/indexedDbService';

const ALL_MODELS: Model[] = [
  { id: '@cf/leonardo/lucid-origin', provider: 'worker', name: 'Lucid Origin (Leonardo)' },
  { id: '@cf/leonardo/phoenix-1.0', provider: 'worker', name: 'Phoenix 1.0 (Leonardo)' },
  { id: 'imagen-3', provider: 'api.airforce', name: 'Imagen 3 (Google)' },
  { id: 'imagen-4', provider: 'api.airforce', name: 'Imagen 4 (Google)' },
  { id: 'gpt-image-1', provider: 'api.airforce', name: 'GPT Image (Openai)' },
  { id: 'ByteDance/Seedream-4', provider: 'deep-infra', name: 'Seedream 4 (ByteDance)' },
];

const App: React.FC = () => {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

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

  // Request Persistent Storage for PWA
  useEffect(() => {
    if (isPWA() && navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then(persistent => {
        console.log('Persistent storage granted:', persistent);
      });
    }
  }, []);

  // Theme effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

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
      // 1. Generate the image from the selected AI service.
      const result = await generateImage(prompt, selectedModel, aspectRatio);
      
      const baseHistoryItem = {
        prompt,
        modelId: selectedModel.id,
        createdAt: Date.now(),
      };

      // 2. Host the image.
      // Use a separate try/catch so generation success isn't hidden by hosting failure.
      let finalUrl: string;
      try {
         finalUrl = await hostImage(result);
      } catch (hostErr: any) {
         console.warn("Hosting failed, using temp URL:", hostErr);
         setHistoryError("Cloud upload failed. Image saved locally only.");
         setTimeout(() => setHistoryError(null), 5000);
         
         // Fallback to using the generated data directly (Data URI or original URL)
         if (result.type === 'url') {
            finalUrl = result.data;
         } else {
            finalUrl = `data:image/png;base64,${result.data}`;
         }
      }

      // 3. Create a new history item.
      const newHistoryItem: HistoryItem = {
        ...baseHistoryItem,
        hostedUrl: finalUrl,
      };
      
      // 4. Update the history state and localStorage.
      updateAndSaveHistory([newHistoryItem, ...history]);
      setImageUrl(getDisplayUrl(newHistoryItem));
      setHistoryPage(1);

      // 5. If PWA, save to IndexedDB for offline access
      if (isPWA()) {
         try {
             let blob: Blob;
             if (result.type === 'b64_json') {
                 blob = b64toBlob(result.data);
             } else {
                 // Fetch from the result URL (could be the hosted URL or the generated source URL)
                 const response = await fetch(result.type === 'url' ? result.data : finalUrl);
                 blob = await response.blob();
             }
             await saveImageToDB(newHistoryItem.createdAt, blob);
         } catch (idbError) {
             console.error('Failed to save image to persistent storage', idbError);
         }
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
    if (direction === 'next') {
        newIndex = currentIndex + 1;
    } else { // prev
        newIndex = currentIndex - 1;
    }

    if (newIndex >= 0 && newIndex < history.length) {
        setFullScreenHistoryId(history[newIndex].createdAt);
    }
  };

  const handleClearHistory = async () => {
    try {
      clearHistoryInStorage();
      setHistory([]);
      setHistoryPage(1);
      if (isPWA()) {
          await clearImagesFromDB();
      }
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
    if (isLoading) return 'Synthesizing...';
    if (isAirforceModelSelected && countdown > 0) return `Recharging (${countdown}s)`;
    return 'Generate';
  };
  
  const totalHistoryPages = Math.ceil(history.length / ITEMS_PER_PAGE);

  const fullScreenHistoryItem = fullScreenHistoryId
    ? history.find(item => item.createdAt === fullScreenHistoryId)
    : null;

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300 bg-base text-text">
      <Header isDark={isDark} toggleTheme={toggleTheme} />
      <main className="flex-grow flex flex-col items-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl flex flex-col items-center gap-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">
              Synthesize Reality
            </h2>
            <p className="text-lg text-subtext font-light">
              Transform text into visual output with advanced AI models.
            </p>
          </div>
          
          <ImageDisplay
            imageUrl={imageUrl}
            isLoading={isLoading}
            error={error}
            onImageClick={() => {
              if (history.length > 0) {
                // If the current image url corresponds to the first history item, use that timestamp
                // Otherwise fallback to the first item (most recent)
                if (history[0] && getDisplayUrl(history[0]) === imageUrl) {
                    openFullScreen(history[0].createdAt);
                } else if (history.length > 0) {
                    openFullScreen(history[0].createdAt);
                }
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
                className="flex-grow flex items-center justify-center px-6 py-2.5 bg-primary text-base font-semibold rounded-lg shadow-md hover:bg-primary-hover hover:shadow-lg disabled:bg-surface1 disabled:text-subtext disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200"
              >
                <span>{getButtonText()}</span>
              </button>
            </div>
            {!isWorkerModelSelected && (
              <p className="text-center text-xs text-warn mt-1">
                  Note: Aspect ratio selection is only available for Leonardo models.
              </p>
            )}
          </div>
          
          {historyError && (
            <div role="alert" aria-live="polite" className="w-full text-center text-sm text-warn animate-fade-in p-3 bg-warn/10 border border-warn/30 rounded-lg">
              {historyError}
            </div>
          )}

          {history.length > 0 && (
            <HistoryGallery
              history={history}
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
      <footer className="w-full p-6 border-t border-surface0">
        <div className="text-center text-xs text-subtext flex justify-center items-center gap-4">
          <span>Made by <a href="http://www.aegis-plus.my.id" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline decoration-wavy decoration-1">AEGIS+</a></span>
          <span className="text-surface1">|</span>
          <span>Powered by <a href="https://g4f.dev" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline decoration-wavy decoration-1">g4f.dev</a></span>
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
