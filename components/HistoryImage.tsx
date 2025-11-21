
import React, { useState, useEffect } from 'react';
import { HistoryItem } from '../types';
import { getDisplayUrl, isPWA } from '../utils/helpers';
import { getImageFromDB } from '../services/indexedDbService';

interface HistoryImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  item: HistoryItem;
}

export const HistoryImage: React.FC<HistoryImageProps> = ({ item, ...props }) => {
  const [src, setSrc] = useState<string>(getDisplayUrl(item));
  const [isLoadedFromDB, setIsLoadedFromDB] = useState(false);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    const load = async () => {
        // Only attempt to load from DB if PWA
        if (isPWA()) {
            try {
                const blob = await getImageFromDB(item.createdAt);
                if (blob && active) {
                    objectUrl = URL.createObjectURL(blob);
                    setSrc(objectUrl);
                    setIsLoadedFromDB(true);
                }
            } catch (e) {
                // Fallback to default URL (already set)
                if (active) setSrc(getDisplayUrl(item));
            }
        } else {
            if (active) setSrc(getDisplayUrl(item));
        }
    };
    load();

    return () => {
        active = false;
        if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [item.createdAt, item.hostedUrl]);

  return <img src={src} {...props} />;
};
