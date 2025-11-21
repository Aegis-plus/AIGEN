
import React, { useState } from 'react';
import { CloseIcon, DownloadIcon, CopyIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';
import { HistoryItem, Model } from '../types';
import { getDisplayUrl } from '../utils/helpers';
import { HistoryImage } from './HistoryImage';

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
      // Try to fetch the current src (could be objectURL or remote URL)
      const imgElement = document.querySelector('.fullscreen-image') as HTMLImageElement;
      const currentSrc = imgElement?.src || imageUrl;
      
      const response = await fetch(currentSrc);
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
      className="fixed inset-0 bg-base/95 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      {/* Prev Button */}
      {canGoPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate('prev'); }}
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-surface0/50 text-text hover:bg-surface1 hover:scale-105 transition-all shadow-sm"
          aria-label="Previous image"
        >
          <ChevronLeftIcon />
        </button>
      )}

      <div 
        className="relative max-w-7xl w-full my-auto lg:max-h-[85vh] flex flex-col lg:flex-row items-center lg:items-stretch gap-6 lg:gap-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Column */}
        <div className="flex-1 flex items-center justify-center w-full min-h-[300px]">
          <HistoryImage
            item={historyItem} 
            alt="Full screen AI generated" 
            className="fullscreen-image max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl shadow-black/20 dark:shadow-black/50"
          />
        </div>

        {/* Info & Actions Column */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 flex flex-col gap-4 bg-mantle p-6 rounded-xl border border-surface0 shadow-lg">
          <div className="flex justify-between items-start mb-2">
             <h3 className="text-primary font-bold uppercase tracking-widest text-sm">Prompt</h3>
             <button 
                onClick={handleCopyPrompt}
                className="p-2 -mt-2 -mr-2 rounded-md text-subtext hover:bg-surface0 hover:text-text transition-colors relative group"
                aria-label="Copy prompt"
                title="Copy prompt"
             >
                <CopyIcon />
                {isCopied && (
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-primary text-base text-xs font-bold px-2 py-1 rounded whitespace-nowrap shadow-md">
                        Copied!
                    </span>
                )}
             </button>
          </div>
          <div className="flex-grow overflow-y-auto max-h-48 pr-1 custom-scrollbar">
             <p className="text-text text-sm font-mono leading-relaxed break-words">
                {prompt}
             </p>
          </div>

          <div className="space-y-3 border-t border-surface0 pt-4 mt-2">
             <div className="flex justify-between">
                <span className="text-subtext text-xs font-bold">Model</span>
                <span className="text-text text-xs text-right">{model?.name || 'Unknown'}</span>
             </div>
             <div className="flex justify-between">
                <span className="text-subtext text-xs font-bold">Date</span>
                <span className="text-text text-xs text-right">{creationDate}</span>
             </div>
          </div>
          
          <button
            onClick={handleDownload}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-base font-bold rounded-lg hover:bg-primary-hover transition-colors shadow-md"
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
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-surface0/50 text-text hover:bg-surface1 hover:scale-105 transition-all shadow-sm"
          aria-label="Next image"
        >
          <ChevronRightIcon />
        </button>
      )}

      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full bg-surface0/50 text-text hover:bg-error hover:text-white transition-all z-20 shadow-sm"
        aria-label="Close full screen view"
      >
        <CloseIcon size={24} />
      </button>
    </div>
  );
};
