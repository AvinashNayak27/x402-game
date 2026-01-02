'use client';

import { useState, useEffect } from 'react';
import type { Guess } from '@/lib/types';
import { validateBIP39Words } from '@/lib/bip39';

interface GuessCardProps {
  guess: Guess;
  onUpdate: (id: string, guesses: (string | null)[]) => Promise<void>;
  onDelete: (id: string) => void;
}

const WALLET_ADDRESS = '0x924418e5640cd491DF12A5eaCAd78e459e0AD049';
const BASESCAN_URL = `https://basescan.org/address/${WALLET_ADDRESS}`;

export default function GuessCard({ guess, onUpdate, onDelete }: GuessCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [wordGuesses, setWordGuesses] = useState<(string | null)[]>(guess.guesses);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ position: number; word: string }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setWordGuesses(guess.guesses);
  }, [guess.guesses]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleWordChange = (position: number, value: string) => {
    // Only allow alphabetic characters (a-z, A-Z), no digits, no spaces
    const cleanedValue = value.replace(/[^a-zA-Z]/g, '');
    
    const newGuesses = [...wordGuesses];
    newGuesses[position] = cleanedValue === '' ? null : cleanedValue.toLowerCase();
    setWordGuesses(newGuesses);
    setValidationErrors([]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validate BIP39 words
      const validation = await validateBIP39Words(wordGuesses);
      if (!validation.isValid) {
        setValidationErrors(validation.invalidWords);
        setSaving(false);
        return;
      }

      await onUpdate(guess.id, wordGuesses);
      setIsEditing(false);
      setValidationErrors([]);
    } catch (error) {
      console.error('Error updating guess:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setWordGuesses(guess.guesses);
    setIsEditing(false);
    setValidationErrors([]);
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(guess.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const filledCount = wordGuesses.filter(g => g !== null && g !== '').length;
  const hasInvalidWords = validationErrors.length > 0;

  return (
    <div className="glass rounded-2xl overflow-hidden border border-[#e0d9cc]/50 hover-lift transition-all duration-300">
      <div className="p-5">
        <div className="mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#8b7a6a] font-light">{formatDate(guess.timestamp)}</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-[#6b5d4f] font-light">
                {filledCount}/24 filled
              </p>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-[#6b5d4f] hover:text-[#4a4036] font-light underline"
                >
                  Edit
                </button>
              )}
            </div>
          </div>

          {hasInvalidWords && (
            <div className="p-2 bg-red-50/50 border border-red-200/50 rounded-lg">
              <p className="text-xs text-red-700 font-light mb-1">Invalid BIP39 words:</p>
              <p className="text-xs text-red-600 font-light">
                {validationErrors.map(e => `Position ${e.position}: "${e.word}"`).join(', ')}
              </p>
            </div>
          )}
          
          {isEditing ? (
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 24 }, (_, position) => {
                const isInvalid = validationErrors.some(e => e.position === position);
                return (
                  <div key={position} className="space-y-1">
                    <label className="block text-xs text-[#8b7a6a] font-light text-center">
                      {position}
                    </label>
                    <input
                      type="text"
                      value={wordGuesses[position] ?? ''}
                      onChange={(e) => handleWordChange(position, e.target.value)}
                      placeholder="—"
                      className={`w-full px-2 py-2 text-center bg-[#faf8f5] border rounded-lg text-[#4a4036] placeholder-[#b09d8a] focus:outline-none focus:ring-2 focus:border-transparent text-sm ${
                        isInvalid
                          ? 'border-red-300 focus:ring-red-300'
                          : 'border-[#e0d9cc] focus:ring-[#c4b5a3]'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-2">
              {wordGuesses.map((word, position) => (
                <div
                  key={position}
                  className={`p-2 rounded-lg text-center border ${
                    word !== null && word !== ''
                      ? 'bg-[#d4c9b8] border-[#c4b5a3] text-[#4a4036]'
                      : 'bg-[#f5f1eb]/50 border-[#e0d9cc] text-[#8b7a6a]'
                  }`}
                >
                  <div className="text-xs font-light mb-1">{position}</div>
                  <div className="text-sm font-medium break-words">
                    {word !== null && word !== '' ? word : '—'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-4 p-3 bg-blue-50/50 border border-blue-200/50 rounded-xl">
          <p className="text-xs text-[#6b5d4f] font-light mb-2">
            <span className="font-medium text-[#4a4036]">Import in wallet:</span> You can import these guesses in a wallet to verify the public address and access the wallet.
          </p>
          <a
            href={BASESCAN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#6b5d4f] hover:text-[#4a4036] font-mono underline decoration-[#c4b5a3] hover:decoration-[#b09d8a] transition-colors break-all"
          >
            {WALLET_ADDRESS.slice(0, 6)}...{WALLET_ADDRESS.slice(-4)} on BaseScan
          </a>
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-[#d4c9b8] text-[#4a4036] text-sm rounded-xl font-medium hover:bg-[#c4b5a3] disabled:bg-[#e0d9cc] disabled:text-[#b09d8a] disabled:cursor-not-allowed transition-all duration-300"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-[#ede8df] text-[#6b5d4f] text-sm rounded-xl font-medium hover:bg-[#e0d9cc] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                Cancel
              </button>
            </>
          ) : showDeleteConfirm ? (
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
  );
}
