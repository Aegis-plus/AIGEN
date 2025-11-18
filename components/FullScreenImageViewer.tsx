
import React, { useState } from 'react';
import { CloseIcon, DownloadIcon, CopyIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';
import { HistoryItem, Model } from '../types';
import { getDisplayUrl } from '../utils/helpers';

interface FullScreenImageViewerProps {
  historyItem: HistoryItem;
  history: HistoryItem[];
  models: Model[];
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export const FullScreenImageViewer: React.FC<FullScreenImageViewerProps> = ({ historyItem, history, models, onClose, onNavigate }) => {
  const [isCopied, setIsCopied] = useState(false);

  const { prompt, createdAt, modelId } = historyItem;
  const imageUrl = getDisplayUrl(historyItem);

  const model = models.find(m => m.id === modelId);
  const creationDate = new Date(createdAt).toLocaleString();

  const currentIndex = history.findIndex(item => item.createdAt === createdAt);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < history.length - 1;

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Failed to fetch image');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      const fileExtension = blob.type.split('/')[1] || 'png';
      a.download = `ai-generated-${Date.now()}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: Open in new tab
      window.open(imageUrl, '_blank');
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  // Effect to handle closing on 'Escape' key and prevent background scroll
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && canGoPrev) {
        onNavigate('prev');
      } else if (e.key === 'ArrowRight' && canGoNext) {
        onNavigate('next');
      }
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onNavigate, canGoPrev, canGoNext]);

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      {/* Prev Button */}
      {canGoPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate('prev'); }}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 hover:scale-110 transition-all"
          aria-label="Previous image"
        >
          <ChevronLeftIcon />
        </button>
      )}

      <div 
        className="relative max-w-7xl w-full my-auto lg:max-h-[85vh] flex flex-col lg:flex-row items-center lg:items-stretch gap-4 lg:gap-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Column */}
        <div className="flex-1 flex items-center justify-center w-full">
          <img 
            src={imageUrl} 
            alt="Full screen AI generated" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl shadow-cyan-500/20"
          />
        </div>

        {/* Info & Actions Column */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 flex flex-col gap-4">
          <div className="w-full bg-black/50 p-4 rounded-md border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                  <h3 className="text-cyan-400 font-bold tracking-widest">PROMPT</h3>
                  <button 
                    onClick={handleCopyPrompt}
                    className="flex-shrink-0 p-2 bg-gray-700/80 rounded-md hover:bg-cyan-500 hover:text-black transition-all duration-200 relative"
                    aria-label="Copy prompt"
                    title="Copy prompt"
                  >
                    <CopyIcon />
                    {isCopied && (
                        <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-xs font-bold px-2 py-1 rounded-md animate-fade-in">
                            Copied!
                        </div>
                    )}
                  </button>
              </div>
              <p className="text-gray-300 text-sm font-mono max-h-48 overflow-y-auto break-words pr-2">
                {prompt}
              </p>
          </div>

          <div className="w-full bg-black/50 p-4 rounded-md border border-gray-700">
            <h3 className="text-cyan-400 font-bold tracking-widest mb-2">DETAILS</h3>
            <div className="text-gray-300 text-sm font-mono space-y-2 break-words">
              <div>
                <strong className="font-bold text-gray-400">Model:</strong>
                <p>{model?.name || 'Unknown'}</p>
              </div>
              <div>
                <strong className="font-bold text-gray-400">Created:</strong>
                <p>{creationDate}</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500 text-black font-bold rounded-md hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-200 mt-auto"
            aria-label="Download image"
          >
            <DownloadIcon />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Next Button */}
      {canGoNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate('next'); }}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 hover:scale-110 transition-all"
          aria-label="Next image"
        >
          <ChevronRightIcon />
        </button>
      )}

      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 hover:scale-110 transition-all z-20"
        aria-label="Close full screen view"
      >
        <CloseIcon size={28} />
      </button>
    </div>
  );
};
