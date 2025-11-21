
import React from 'react';
import { HistoryItem, Model } from '../types';
import { TrashIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';
import { ITEMS_PER_PAGE } from '../services/historyService';
import { HistoryImage } from './HistoryImage';

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
    <div className="w-full max-w-4xl animate-fade-in mt-4 border-t border-surface0 pt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-text tracking-tight flex items-center gap-2">
            <span className="w-1.5 h-5 bg-primary rounded-full"></span>
            Recent Log
        </h3>
        <button
          onClick={onClearHistory}
          className="flex items-center gap-2 px-3 py-1.5 bg-error/5 text-error border border-error/20 rounded-md hover:bg-error/10 transition-colors text-sm font-medium"
          aria-label="Clear generation history"
        >
          <TrashIcon />
          <span>Clear</span>
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {history.map((item, index) => {
          const isVisible = index >= startIndex && index < endIndex;

          return (
            <div
              key={item.createdAt}
              style={{ display: isVisible ? undefined : 'none' }}
              aria-hidden={!isVisible}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-surface0 bg-mantle hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={() => onImageClick(item.createdAt)}
              tabIndex={isVisible ? 0 : -1}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onImageClick(item.createdAt)}
              role="button"
              aria-label={`View image generated with prompt: ${item.prompt}`}
            >
              <HistoryImage
                item={item}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                alt={item.prompt}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1" title={getModelName(item.modelId)}>{getModelName(item.modelId)}</p>
                <p className="text-xs text-white line-clamp-2 font-medium leading-tight" title={item.prompt}>{item.prompt}</p>
              </div>
            </div>
          );
        })}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-full text-subtext hover:bg-surface1 hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Previous page"
          >
            <ChevronLeftIcon />
          </button>
          <span className="text-text font-mono text-sm">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-full text-subtext hover:bg-surface1 hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Next page"
          >
            <ChevronRightIcon />
          </button>
        </div>
      )}
    </div>
  );
};
