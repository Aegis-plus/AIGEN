
import { HistoryItem } from '../types';

/**
 * Gets a displayable URL from a history item, prioritizing hosted URLs.
 * @param item The history item.
 * @returns A string URL for display in an <img> tag.
 */
export const getDisplayUrl = (item: HistoryItem): string => {
  if (item.hostedUrl) {
    return item.hostedUrl;
  }
  if (item.source?.type === 'b64_json') {
    return `data:image/png;base64,${item.source.data}`;
  }
  if (item.source?.type === 'url') {
    return item.source.data;
  }
  // Fallback for corrupted data or old items from previous versions
  // @ts-ignore
  if (item.imageUrl) return item.imageUrl;
  return 'about:blank';
};
