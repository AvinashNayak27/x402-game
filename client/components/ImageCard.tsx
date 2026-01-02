'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ImageMetadata } from '@/lib/types';
import { getImage, normalizeBase64ToDataUrl } from '@/lib/storage';

interface ImageCardProps {
  metadata: ImageMetadata;
  onDelete: (id: string) => void;
}

export default function ImageCard({ metadata, onDelete }: ImageCardProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const hasLoadedRef = useRef(false);

  const loadImage = useCallback(async () => {
    if (hasLoadedRef.current) return;
    
    hasLoadedRef.current = true;
    setLoading(true);
    try {
      const imageData = await getImage(metadata.id);
      if (imageData) {
        setImageSrc(normalizeBase64ToDataUrl(imageData.base64));
      }
    } catch (error) {
      console.error('Error loading image:', error);
      hasLoadedRef.current = false; // Reset on error so it can retry
    } finally {
      setLoading(false);
    }
  }, [metadata.id]);

  // Automatically load image when component mounts
  useEffect(() => {
    loadImage();
  }, [loadImage]);

  const handleDownload = async () => {
    if (!imageSrc) {
      await loadImage();
      // Wait a bit for image to load
      setTimeout(() => {
        if (imageSrc) {
          handleDownload();
        }
      }, 500);
      return;
    }

    try {
      // Convert base64 data URL to blob
      const base64Data = imageSrc.split(',')[1] || imageSrc;
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `x402-image-${metadata.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(metadata.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleImageClick = () => {
    if (imageSrc && !loading) {
      setShowFullscreen(true);
    }
  };

  const handleCloseFullscreen = () => {
    setShowFullscreen(false);
  };

  // Handle ESC key to close fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showFullscreen) {
        handleCloseFullscreen();
      }
    };

    if (showFullscreen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showFullscreen]);

  return (
    <>
      <div className="glass rounded-2xl overflow-hidden border border-[#e0d9cc]/50 hover-lift transition-all duration-300 group">
        <div className="relative aspect-square bg-[#f5f1eb] overflow-hidden">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="animate-spin h-8 w-8 text-[#c4b5a3]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          ) : imageSrc ? (
            <img
              src={imageSrc}
              alt={`AI-generated clue image with word indices ${metadata.indices.join(', ')}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
              onLoad={() => setLoading(false)}
              onClick={handleImageClick}
            />
          ) : null}
        </div>

      <div className="p-5">
        <div className="mb-4 space-y-1">
          <p className="text-sm text-[#6b5d4f] font-light">Indices: {metadata.indices.join(', ')}</p>
          <p className="text-xs text-[#8b7a6a] font-light">{formatDate(metadata.timestamp)}</p>
          <p className="text-xs text-[#8b7a6a] font-light">Fee: ${metadata.price.toFixed(2)}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-[#d4c9b8] text-[#4a4036] text-sm rounded-xl font-medium hover:bg-[#c4b5a3] disabled:bg-[#e0d9cc] disabled:text-[#b09d8a] disabled:cursor-not-allowed transition-all duration-300 hover-lift"
          >
            Download
          </button>
          {showDeleteConfirm ? (
            <div className="flex-1 flex gap-2">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-red-400 text-white text-sm rounded-xl font-medium hover:bg-red-500 transition-all duration-300"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-[#e0d9cc] text-[#6b5d4f] text-sm rounded-xl font-medium hover:bg-[#d4c9b8] transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleDelete}
              className="flex-1 px-4 py-2.5 bg-red-300 text-white text-sm rounded-xl font-medium hover:bg-red-400 transition-all duration-300"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>

      {/* Fullscreen Modal */}
      {showFullscreen && imageSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={handleCloseFullscreen}
        >
          <button
            onClick={handleCloseFullscreen}
            className="absolute top-4 right-4 z-60 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110"
            aria-label="Close fullscreen"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div
            className="relative max-w-[76vw] max-h-[76vh] w-auto h-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageSrc}
              alt={`AI-generated clue image with word indices ${metadata.indices.join(', ')}`}
              className="max-w-full max-h-[76vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}

