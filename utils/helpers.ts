
import { HistoryItem } from '../types';

/**
 * Gets a displayable URL from a history item.
 * This is backward-compatible and can handle legacy items that stored the raw source.
 * @param item The history item.
 * @returns A string URL for display in an <img> tag.
 */
export const getDisplayUrl = (item: HistoryItem): string => {
  // Prioritize the permanent, hosted URL. All new items will have this.
  if (item.hostedUrl) {
    return item.hostedUrl;
  }
  
  // --- Fallbacks for legacy items stored in localStorage before the fix ---
  const legacyItem = item as any;
  if (legacyItem.source?.type === 'b64_json') {
    return `data:image/png;base64,${legacyItem.source.data}`;
  }
  if (legacyItem.source?.type === 'url') {
    return legacyItem.source.data;
  }
  // Fallback for even older data structures
  if (legacyItem.imageUrl) {
    return legacyItem.imageUrl;
  }
  
  // Return a blank page if no valid URL can be found.
  return 'about:blank';
};

/**
 * Checks if the app is running in Standalone mode (PWA).
 */
export const isPWA = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
};
