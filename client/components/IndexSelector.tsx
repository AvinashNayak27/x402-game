'use client';

import { useState, useMemo } from 'react';
import { calculatePrice } from '@/lib/api';

interface IndexSelectorProps {
  selectedIndices: number[];
  onSelectionChange: (indices: number[]) => void;
}

export default function IndexSelector({ selectedIndices, onSelectionChange }: IndexSelectorProps) {
  const indices = Array.from({ length: 24 }, (_, i) => i);
  const price = useMemo(() => calculatePrice(selectedIndices.length), [selectedIndices.length]);

  const toggleIndex = (index: number) => {
    if (selectedIndices.includes(index)) {
      onSelectionChange(selectedIndices.filter((i) => i !== index));
    } else {
      if (selectedIndices.length >= 24) {
        return; // Max 24 indices
      }
      onSelectionChange([...selectedIndices, index]);
    }
  };

  const resetSelection = () => {
    onSelectionChange([]);
  };

  const isValid = selectedIndices.length >= 2 && selectedIndices.length <= 24;

  return (
    <div className="w-full">
      <div className="mb-6">

        <div className="flex items-center gap-6 mb-3">
          <span className="text-sm font-medium text-[#6b5d4f]">
            Selected: <span className="text-[#4a4036]">{selectedIndices.length}</span>
          </span>
          {selectedIndices.length >= 2 && (
            <span className="text-sm font-medium text-[#4a4036]">
              Fee: <span className="text-[#6b5d4f]">${price.toFixed(2)}</span>
              <span className="text-xs text-[#8b7a6a] font-light ml-1">(to dev wallet)</span>
            </span>
          )}
          {selectedIndices.length > 0 && (
            <button
              onClick={resetSelection}
              className="text-sm text-red-500 hover:text-red-600 transition-colors duration-200 font-light border border-red-300 hover:border-red-400 px-2 py-1 rounded"
            >
              Reset
            </button>
          )}
        </div>
        {!isValid && selectedIndices.length > 0 && (
          <p className="text-sm text-red-400 mt-2 animate-slide-in">
            {selectedIndices.length < 2
              ? 'Select at least 2 word indices to generate a clue'
              : 'You can select up to 24 word indices maximum'}
          </p>
        )}
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-3">
        {indices.map((index) => {
          const isSelected = selectedIndices.includes(index);
          return (
            <button
              key={index}
              onClick={() => toggleIndex(index)}
              className={`
                px-4 py-3 rounded-xl border-2 transition-all duration-300 font-medium text-sm
                ${
                  isSelected
                    ? 'bg-[#c4b5a3] text-[#4a4036] border-[#b09d8a] shadow-sm scale-105'
                    : 'bg-white/50 text-[#6b5d4f] border-[#e0d9cc] hover:border-[#d4c9b8] hover:bg-white/70 hover:scale-105'
                }
              `}
            >
              {index}
            </button>
          );
        })}
      </div>

      {selectedIndices.length > 0 && (
        <div className="mt-6 p-4 bg-[#f5f1eb]/50 rounded-xl border border-[#e0d9cc]/50 animate-fade-in">
          <p className="text-sm text-[#8b7a6a] font-light">
            Selected words: <span className="text-[#6b5d4f] font-medium">{selectedIndices.sort((a, b) => a - b).join(', ')}</span>
          </p>
        </div>
      )}
    </div>
  );
}
