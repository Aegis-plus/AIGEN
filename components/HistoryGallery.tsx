
import React from 'react';
import { HistoryItem, Model } from '../types';
import { TrashIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';
import { getDisplayUrl } from '../utils/helpers';
import { ITEMS_PER_PAGE } from '../services/historyService';

interface HistoryGalleryProps {
  history: HistoryItem[];
  models: Model[];
  onImageClick: (createdAt: number) => void;
  onClearHistory: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const HistoryGallery: React.FC<HistoryGalleryProps> = ({ history, models, onImageClick, onClearHistory, currentPage, totalPages, onPageChange }) => {

  const getModelName = (modelId: string): string => {
    return models.find(m => m.id === modelId)?.name || 'Unknown Model';
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  return (
    <div className="w-full max-w-4xl animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-cyan-400/80 tracking-widest">HISTORY LOG</h3>
        <button
          onClick={onClearHistory}
          className="flex items-center gap-2 px-3 py-1.5 bg-red-900/50 text-red-300 border border-red-500/50 rounded-md hover:bg-red-800/60 hover:text-red-200 transition-colors text-sm"
          aria-label="Clear generation history"
        >
          <TrashIcon />
          <span>Clear Log</span>
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {history.map((item, index) => {
          const displayUrl = getDisplayUrl(item);
          const isVisible = index >= startIndex && index < endIndex;

          return (
            <div
              key={item.createdAt}
              style={{ display: isVisible ? undefined : 'none' }}
              aria-hidden={!isVisible}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-md border-2 border-transparent focus-within:border-cyan-500 hover:border-cyan-500 transition-all duration-300"
              onClick={() => onImageClick(item.createdAt)}
              tabIndex={isVisible ? 0 : -1}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onImageClick(item.createdAt)}
              role="button"
              aria-label={`View image generated with prompt: ${item.prompt}`}
            >
              <img
                src={displayUrl}
                alt={item.prompt}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 flex flex-col justify-end text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="font-bold truncate text-cyan-300" title={getModelName(item.modelId)}>{getModelName(item.modelId)}</p>
                <p className="line-clamp-3 text-gray-300" title={item.prompt}>{item.prompt}</p>
              </div>
            </div>
          );
        })}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 bg-black/50 border-2 border-gray-700 rounded-full hover:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-700 transition-colors text-gray-300"
            aria-label="Previous page"
          >
            <ChevronLeftIcon />
          </button>
          <span className="text-gray-400 font-mono text-sm tracking-widest">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 bg-black/50 border-2 border-gray-700 rounded-full hover:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-700 transition-colors text-gray-300"
            aria-label="Next page"
          >
            <ChevronRightIcon />
          </button>
        </div>
      )}
    </div>
  );
};
