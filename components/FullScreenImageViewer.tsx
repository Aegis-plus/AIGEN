import React from 'react';
import { CloseIcon, DownloadIcon } from './icons';

interface FullScreenImageViewerProps {
  imageUrl: string;
  onClose: () => void;
}

export const FullScreenImageViewer: React.FC<FullScreenImageViewerProps> = ({ imageUrl, onClose }) => {
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

  // Effect to handle closing on 'Escape' key and prevent background scroll
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative max-w-full max-h-full flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={imageUrl} 
          alt="Full screen AI generated" 
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl shadow-cyan-500/20"
        />
        <div className="flex justify-center gap-4">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black font-bold rounded-md hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-200"
            aria-label="Download image"
          >
            <DownloadIcon />
            <span>Download</span>
          </button>
        </div>
      </div>
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 hover:scale-110 transition-all"
        aria-label="Close full screen view"
      >
        <CloseIcon size={28} />
      </button>
    </div>
  );
};