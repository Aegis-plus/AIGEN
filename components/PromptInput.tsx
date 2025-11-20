
import React, { useRef, useEffect } from 'react';
import { PasteIcon } from './icons';

interface PromptInputProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  onGenerate: () => void;
  isLoading: boolean;
  isSubmitDisabled: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onGenerate, isLoading, isSubmitDisabled }) => {
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
      if (!isSubmitDisabled) {
        onGenerate();
      }
    }
  };

  const handlePaste = async () => {
    if (isLoading) return;
    try {
      const text = await navigator.clipboard.readText();
      // Appends the pasted text to the current prompt
      setPrompt(currentPrompt => currentPrompt + text);
      textareaRef.current?.focus();
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      // Inform the user if pasting fails (e.g., permissions not granted)
      alert('Could not paste from clipboard. Please grant clipboard access permission to this site.');
    }
  };
  
  return (
    <div className="relative w-full group">
      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Imagine something wonderful..."
        className="w-full bg-input border border-surface0 rounded-lg p-4 pr-12 text-text placeholder-overlay focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none font-mono text-base max-h-48 overflow-y-auto shadow-sm"
        rows={2}
        disabled={isLoading}
      />
      <button
        onClick={handlePaste}
        disabled={isLoading}
        className="absolute top-3 right-3 p-2 rounded-md text-subtext hover:bg-surface1 hover:text-text transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Paste from clipboard"
        title="Paste from clipboard"
      >
        <PasteIcon />
      </button>
    </div>
  );
};
