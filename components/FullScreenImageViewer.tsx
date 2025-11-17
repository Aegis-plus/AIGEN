
import React, { useState } from 'react';
import { CloseIcon, DownloadIcon, CopyIcon } from './icons';

interface FullScreenImageViewerProps {
  imageUrl: string;
  prompt: string;
  onClose: () => void;
}

export const FullScreenImageViewer: React.FC<FullScreenImageViewerProps> = ({ imageUrl, prompt, onClose }) => {
  const [isCopied, setIsCopied] = useState(false);

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
        className="relative max-w-7xl w-full h-full lg:h-auto lg:max-h-[85vh] flex flex-col lg:flex-row items-center lg:items-start gap-4 lg:gap-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Column */}
        <div className="flex-1 flex items-center justify-center w-full h-full lg:h-auto">
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
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500 text-black font-bold rounded-md hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-200"
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
