'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import IndexSelector from '@/components/IndexSelector';
import PaymentButton from '@/components/PaymentButton';
import GameInfo from '@/components/GameInfo';
import { saveImage, normalizeBase64ToDataUrl } from '@/lib/storage';
import { calculatePrice } from '@/lib/api';
import type { ImageResponse } from '@/lib/types';

export default function Home() {
  const router = useRouter();
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<ImageResponse | null>(null);

  const price = calculatePrice(selectedIndices.length);

  const handleSuccess = async (response: ImageResponse) => {
    try {
      // Save to IndexedDB
      const timestamp = Date.now();
      const id = `image_${timestamp}_${response.indices.join('_')}`;
      
      await saveImage({
        id,
        base64: response.base64,
        indices: response.indices,
        timestamp,
        price,
      });

      setGeneratedImage(response);
      setSuccess('Clue generated! Study the image for patterns that might reveal the mnemonic.');
      setError(null);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error('Error saving image:', error);
      setError('Unable to save your artwork. Please try again.');
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setSuccess(null);
  };

  return (
    <main className="min-h-screen bg-[#faf8f5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Main Form */}
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl p-8 md:p-10 animate-fade-in shadow-sm">
              <div className="mb-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h1 className="text-4xl md:text-5xl font-light text-[#4a4036] mb-3 tracking-tight">
                      The Mnemonic Hunt
                    </h1>
                    <p className="text-[#6b5d4f] text-lg font-light leading-relaxed">
                      Crack the code. Generate clues. Claim the prize. A wallet with <span className="font-medium text-[#4a4036]">100 USDC</span> awaits the first person to discover its mnemonic phrase.
                    </p>
                  </div>
                  <GameInfo />
                </div>
                <div className="treasure-badge rounded-xl p-5 border border-[#e0d9cc]/50">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="text-sm text-[#6b5d4f] font-light mb-1">
                        <span className="font-medium text-[#4a4036]">Prize:</span>{' '}
                        <span className="font-semibold text-[#4a4036] text-base">100 USDC</span>
                      </p>
                      <p className="text-xs text-[#8b7a6a] font-light">
                        Target Wallet:{' '}
                        <a
                          href="https://basescan.org/address/0x924418e5640cd491DF12A5eaCAd78e459e0AD049"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#6b5d4f] hover:text-[#4a4036] font-mono underline decoration-[#c4b5a3] hover:decoration-[#b09d8a] transition-colors"
                        >
                          0x9244...D049
                        </a>
                        {' '}on Base
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#8b7a6a] font-light">Status:</p>
                      <p className="text-sm font-medium text-[#4a4036] pulse-glow">Active</p>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50/50 border border-red-200/50 rounded-xl animate-slide-in backdrop-blur-sm">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50/50 border border-green-200/50 rounded-xl animate-slide-in backdrop-blur-sm">
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              )}

              <IndexSelector
                selectedIndices={selectedIndices}
                onSelectionChange={setSelectedIndices}
              />

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <PaymentButton
                  indices={selectedIndices}
                  price={price}
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
                <button
                  onClick={() => router.push('/gallery')}
                  className="px-6 py-3 rounded-xl font-medium text-[#6b5d4f] bg-[#ede8df] hover:bg-[#e0d9cc] transition-all duration-300 hover-lift"
                >
                  View Clues
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Generated Image */}
          <div className="lg:col-span-1">
            {generatedImage ? (
              <div className="glass rounded-2xl p-6 md:p-8 animate-scale-in shadow-sm sticky top-24">
                <h2 className="text-xl font-light text-[#4a4036] mb-2">Your Clue</h2>
                <p className="text-xs text-[#8b7a6a] font-light mb-4">
                  Study this image carefully—it may contain hints about the mnemonic phrase
                </p>
                <div className="relative overflow-hidden rounded-xl mb-4">
                  <img
                    src={normalizeBase64ToDataUrl(generatedImage.base64)}
                    alt={`AI-generated clue image with word indices ${generatedImage.indices.join(', ')}`}
                    className="w-full rounded-xl shadow-lg hover-lift transition-transform duration-500"
                  />
                </div>
                <div className="p-3 bg-[#f5f1eb]/50 rounded-xl border border-[#e0d9cc]/50">
                  <p className="text-xs text-[#8b7a6a] font-light">
                    Indices: <span className="text-[#6b5d4f] font-medium">{generatedImage.indices.join(', ')}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="glass rounded-2xl p-6 md:p-8 animate-fade-in shadow-sm sticky top-24">
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 text-[#d4c9b8] mx-auto mb-4"
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
                  <p className="text-sm text-[#8b7a6a] font-light">
                    Your generated clues will appear here
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
