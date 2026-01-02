'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { generateImage, useFetchWithPayment } from '@/lib/api';
import type { ImageResponse } from '@/lib/types';

interface PaymentButtonProps {
  indices: number[];
  price: number;
  onSuccess: (response: ImageResponse) => void;
  onError: (error: string) => void;
}

export default function PaymentButton({ indices, price, onSuccess, onError }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const { isConnected } = useAccount();
  const fetchWithPayment = useFetchWithPayment();

  const handleGenerate = async () => {
    if (!isConnected) {
      onError('Please connect your wallet to generate clues');
      return;
    }

    if (indices.length < 2 || indices.length > 24) {
      onError('Please select 2-24 word indices');
      return;
    }

    setLoading(true);
    try {
      const response = await generateImage(indices, fetchWithPayment);
      onSuccess(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to generate clue. Please try again.';
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

    const isDisabled = !isConnected || indices.length < 2 || indices.length > 24 || loading;

  return (
    <button
      onClick={handleGenerate}
      disabled={isDisabled}
      className={`
        px-8 py-4 rounded-xl font-medium text-[#4a4036] transition-all duration-300 btn-minimal relative overflow-hidden
        ${
          isDisabled
            ? 'bg-[#e0d9cc] text-[#b09d8a] cursor-not-allowed'
            : 'bg-[#d4c9b8] hover:bg-[#c4b5a3] active:scale-95 hover-lift shadow-sm'
        }
      `}
    >
      {loading ? (
        <span className="flex items-center gap-3">
          <svg
            className="animate-spin h-5 w-5"
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
          <span>Generating clue...</span>
        </span>
      ) : (
        `Generate Clue ($${price.toFixed(2)})`
      )}
    </button>
  );
}

