'use client';

import Gallery from '@/components/Gallery';

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-[#faf8f5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-light text-[#4a4036] tracking-tight mb-2">
            Your Clue Collection
          </h1>
          <p className="text-[#8b7a6a] font-light text-sm">
            Review all your generated clues to piece together the mnemonic phrase
          </p>
        </div>
        <Gallery />
      </div>
    </main>
  );
}

