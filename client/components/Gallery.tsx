'use client';

import { useStoredImages } from '@/hooks/useStoredImages';
import ImageCard from './ImageCard';

export default function Gallery() {
  const { images, loading, deleteImage } = useStoredImages();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="animate-spin h-12 w-12 text-[#c4b5a3]"
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
          <p className="text-[#8b7a6a] font-light">Loading your collection...</p>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center animate-fade-in">
        <div className="mb-6">
          <svg
            className="w-24 h-24 text-[#d4c9b8] mb-4 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-light text-[#4a4036] mb-2">No clues yet</h3>
        <p className="text-[#8b7a6a] mb-6 font-light">
          Generate your first clue to start hunting for the mnemonic phrase
        </p>
        <a
          href="/"
          className="px-6 py-3 bg-[#d4c9b8] text-[#4a4036] rounded-xl font-medium hover:bg-[#c4b5a3] transition-all duration-300 hover-lift"
        >
          Generate Clue
        </a>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((metadata, index) => (
          <div
            key={metadata.id}
            style={{ animationDelay: `${index * 50}ms` }}
            className="animate-fade-in"
          >
            <ImageCard
              metadata={metadata}
              onDelete={deleteImage}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

