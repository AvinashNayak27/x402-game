'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllImages, deleteImage as deleteImageStorage } from '@/lib/storage';
import type { ImageMetadata } from '@/lib/types';

export function useStoredImages() {
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const storedImages = await getAllImages();
      setImages(storedImages);
    } catch (error) {
      console.error('Error refreshing images:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteImage = useCallback(async (id: string) => {
    try {
      await deleteImageStorage(id);
      await refresh();
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }, [refresh]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return {
    images,
    loading,
    refresh,
    deleteImage,
  };
}

