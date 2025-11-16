import React, { useRef, useEffect } from 'react';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  isDisabled: boolean;
  countdown: number;
}

export const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onGenerate, isLoading, isDisabled, countdown }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to 'auto' to ensure the scrollHeight is calculated correctly
      // when text is deleted.
      textarea.style.height = 'auto';
      // Set the height to the scrollHeight to fit the content.
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [prompt]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isDisabled) {
        onGenerate();
      }
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'SYNTHESIZING...';
    if (isDisabled && countdown > 0) return `RECHARGING (${countdown}s)`;
    return 'GENERATE';
  };
  
  return (
    <div className="relative flex-grow">
      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="e.g., A cybernetic owl with neon feathers..."
        className="w-full bg-black/50 border-2 border-gray-700 rounded-md p-3 pr-44 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 resize-none font-mono max-h-40 overflow-y-auto"
        rows={1}
        disabled={isLoading}
      />
      <button
        onClick={onGenerate}
        disabled={isDisabled || !prompt.trim()}
        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center px-4 py-1.5 bg-cyan-500 text-black font-bold rounded-md shadow-lg hover:bg-cyan-400 hover:shadow-cyan-500/50 disabled:hover:shadow-none disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200"
      >
        <span>{getButtonText()}</span>
      </button>
    </div>
  );
};