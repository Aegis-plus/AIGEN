import { HistoryItem } from '../types';

export const ITEMS_PER_PAGE = 10;
export const MAX_HISTORY_ITEMS = 200;

const HISTORY_STORAGE_KEY = 'generationHistory';

/**
 * Loads the generation history from localStorage.
 * @returns An array of HistoryItem objects.
 */
export const loadHistoryFromStorage = (): HistoryItem[] => {
  try {
    const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    return savedHistory ? JSON.parse(savedHistory) : [];
  } catch (error) {
    console.error('Failed to load history from localStorage:', error);
    return [];
  }
};

/**
 * Saves the generation history to localStorage, handling potential quota errors
 * by removing the oldest items until it fits.
 * @param history The array of HistoryItem objects to save.
 * @returns The final saved history array, which may be smaller than the input if pruning occurred.
 * @throws An error if saving fails for reasons other than quota, or if the history cannot be saved.
 */
export const saveHistoryToStorage = (history: HistoryItem[]): HistoryItem[] => {
  let historyToSave = [...history];

  // Prune by item count first as a baseline
  if (historyToSave.length > MAX_HISTORY_ITEMS) {
    historyToSave = historyToSave.slice(0, MAX_HISTORY_ITEMS);
  }

  // Attempt to save, removing oldest items if quota is exceeded
  while (historyToSave.length > 0) {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyToSave));
      // Success
      return historyToSave;
    } catch (error: any) {
      const isQuotaError =
        error.name === 'QuotaExceededError' ||
        (error.code && (error.code === 22 || error.code === 1014));

      if (isQuotaError) {
        // Quota exceeded, remove the oldest item. Since new items are prepended, the last item is the oldest.
        historyToSave.pop();
      } else {
        // Unexpected error
        console.error('Failed to save history to localStorage:', error);
        throw new Error('An unexpected error occurred while saving history.');
      }
    }
  }

  // This part is reached if all items were removed due to quota issues.
  // We'll save an empty array to clear it.
  if (historyToSave.length === 0) {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, '[]');
    } catch(e) {
      console.error('Failed to even clear history in localStorage', e);
      throw new Error('Could not save to storage. It may be full or disabled.');
    }
  }

  return historyToSave;
};

/**
 * Clears the generation history from localStorage.
 */
export const clearHistoryInStorage = (): void => {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, '[]');
  } catch (error) {
    console.error('Failed to clear history in localStorage:', error);
    throw new Error('Could not clear history. Storage may be full or disabled.');
  }
};