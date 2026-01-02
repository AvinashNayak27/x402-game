'use client';

import { useState, useEffect } from 'react';
import { useStoredGuesses } from '@/hooks/useStoredGuesses';
import { validateBIP39Words } from '@/lib/bip39';

const WALLET_ADDRESS = '0x924418e5640cd491DF12A5eaCAd78e459e0AD049';
const BASESCAN_URL = `https://basescan.org/address/${WALLET_ADDRESS}`;

export default function Guesses() {
  const { guess, loading, saveGuess } = useStoredGuesses();
  const [wordGuesses, setWordGuesses] = useState<(string | null)[]>(Array(24).fill(null));
  const [savedGuesses, setSavedGuesses] = useState<(string | null)[]>(Array(24).fill(null));
  const [editingPositions, setEditingPositions] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ position: number; word: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Load saved guess when component mounts or guess changes
  useEffect(() => {
    if (guess) {
      setWordGuesses(guess.guesses);
      setSavedGuesses(guess.guesses);
    }
  }, [guess]);

  const handleWordChange = (position: number, value: string) => {
    // Only allow alphabetic characters (a-z, A-Z), no digits, no spaces
    const cleanedValue = value.replace(/[^a-zA-Z]/g, '');
    
    const newGuesses = [...wordGuesses];
    newGuesses[position] = cleanedValue === '' ? null : cleanedValue.toLowerCase();
    setWordGuesses(newGuesses);
    setError(null);
    setValidationErrors([]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validate BIP39 words
      const validation = await validateBIP39Words(wordGuesses);
      if (!validation.isValid) {
        setValidationErrors(validation.invalidWords);
        setError(`Invalid BIP39 words at positions: ${validation.invalidWords.map(e => e.position).join(', ')}`);
        setSaving(false);
        return;
      }

      await saveGuess(wordGuesses);
      setSavedGuesses([...wordGuesses]);
      setEditingPositions(new Set()); // Clear editing state after save
      setError(null);
      setValidationErrors([]);
      setSuccess('Guess saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving guess:', error);
      setError('Failed to save guess. Please try again.');
      setSuccess(null);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setWordGuesses(Array(24).fill(null));
    setError(null);
    setValidationErrors([]);
  };

  const handleCopyMnemonic = async () => {
    const filledWords = wordGuesses.filter(word => word !== null && word !== '');
    if (filledWords.length === 0) {
      setError('No words to copy');
      return;
    }

    const mnemonic = wordGuesses.map(word => word || '').join(' ').trim();
    
    try {
      await navigator.clipboard.writeText(mnemonic);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy mnemonic:', error);
      setError('Failed to copy mnemonic to clipboard');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  const enableEditing = (position: number) => {
    setEditingPositions(prev => new Set(prev).add(position));
    // Focus the input after enabling edit
    setTimeout(() => {
      const input = document.querySelector(`input[data-position="${position}"]`) as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 0);
  };

  const handlePencilClick = (position: number, e: React.MouseEvent) => {
    e.stopPropagation();
    enableEditing(position);
  };

  const filledCount = wordGuesses.filter(g => g !== null && g !== '').length;
  const hasSavedValues = savedGuesses.some(g => g !== null && g !== '');

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
          <p className="text-[#8b7a6a] font-light">Loading your guesses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in">
      {/* Guess Form */}
      <div className="glass rounded-2xl p-6 mb-8 border border-[#e0d9cc]/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-light text-[#4a4036]">Your Guesses</h2>
          <p className="text-sm text-[#8b7a6a] font-light">
            {filledCount}/24 filled
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50/50 border border-red-200/50 rounded-xl animate-slide-in backdrop-blur-sm">
            <p className="text-red-700 text-sm">{error}</p>
            {validationErrors.length > 0 && (
              <div className="mt-2 text-xs text-red-600">
                Invalid words: {validationErrors.map(e => `Position ${e.position}: "${e.word}"`).join(', ')}
              </div>
            )}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50/50 border border-green-200/50 rounded-xl animate-slide-in backdrop-blur-sm">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        {copySuccess && (
          <div className="mb-4 p-4 bg-blue-50/50 border border-blue-200/50 rounded-xl animate-slide-in backdrop-blur-sm">
            <p className="text-blue-700 text-sm">Mnemonic copied to clipboard!</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#6b5d4f] font-light mb-3">
              Guess words for each position ({' '}
              <a
                href="https://github.com/bitcoinjs/bip39/blob/master/src/wordlists/english.json"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6b5d4f] hover:text-[#4a4036] underline decoration-[#c4b5a3] hover:decoration-[#b09d8a] transition-colors"
              >
                BIP39 English wordlist
              </a>
              {' '}only)
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
              {Array.from({ length: 24 }, (_, position) => {
                const isInvalid = validationErrors.some(e => e.position === position);
                const hasSavedValue = savedGuesses[position] !== null && savedGuesses[position] !== '';
                const isModified = wordGuesses[position] !== savedGuesses[position];
                const isEditing = editingPositions.has(position);
                const isReadOnly = hasSavedValue && !isEditing;
                return (
                  <div key={position} className="space-y-1">
                    <label className="block text-xs text-[#8b7a6a] font-light text-center">
                      {position}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        data-position={position}
                        value={wordGuesses[position] ?? ''}
                        onChange={(e) => handleWordChange(position, e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="—"
                        readOnly={isReadOnly}
                        disabled={isReadOnly}
                        className={`w-full px-2 py-2 ${hasSavedValue && !isEditing ? 'pr-6' : ''} text-center border rounded-lg placeholder-[#b09d8a] focus:outline-none focus:ring-2 focus:border-transparent text-sm ${
                          isReadOnly
                            ? 'bg-[#d4c9b8]/30 border-[#c4b5a3] text-[#4a4036] cursor-default'
                            : isInvalid
                            ? 'bg-red-50 border-red-300 focus:ring-red-300 text-[#4a4036]'
                            : hasSavedValue
                            ? isModified
                              ? 'bg-yellow-50 border-yellow-300 focus:ring-yellow-300 text-[#4a4036]'
                              : 'bg-[#d4c9b8]/30 border-[#c4b5a3] focus:ring-[#c4b5a3] text-[#4a4036]'
                            : 'bg-[#faf8f5] border-[#e0d9cc] focus:ring-[#c4b5a3] text-[#4a4036]'
                        }`}
                      />
                      {hasSavedValue && !isEditing && (
                        <button
                          type="button"
                          onClick={(e) => handlePencilClick(position, e)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6b5d4f] hover:text-[#4a4036] transition-colors cursor-pointer"
                          aria-label={`Edit position ${position}`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-full w-full"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-[#8b7a6a] font-light">
              Enter words from the{' '}
              <a
                href="https://github.com/bitcoinjs/bip39/blob/master/src/wordlists/english.json"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6b5d4f] hover:text-[#4a4036] underline decoration-[#c4b5a3] hover:decoration-[#b09d8a] transition-colors"
              >
                BIP39 English wordlist
              </a>
              {' '}(alphabets only, no digits). Press Enter to save. Words are validated when you save.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-[#d4c9b8] text-[#4a4036] rounded-xl font-medium hover:bg-[#c4b5a3] disabled:bg-[#e0d9cc] disabled:text-[#b09d8a] disabled:cursor-not-allowed transition-all duration-300 hover-lift"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCopyMnemonic}
              disabled={filledCount === 0}
              className="px-6 py-3 bg-[#b8c9d4] text-[#364a4a] rounded-xl font-medium hover:bg-[#a3b5c4] disabled:bg-[#e0d9cc] disabled:text-[#b09d8a] disabled:cursor-not-allowed transition-all duration-300 hover-lift flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy
            </button>
            <button
              onClick={handleClear}
              disabled={saving}
              className="px-6 py-3 bg-[#ede8df] text-[#6b5d4f] rounded-xl font-medium hover:bg-[#e0d9cc] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="glass rounded-2xl p-6 border border-[#e0d9cc]/50">
        <h2 className="text-xl font-light text-[#4a4036] mb-4">About Your Guesses</h2>
        <p className="text-sm text-[#8b7a6a] font-light mb-4">
          Your guesses are saved automatically when you click "Save". You can edit them anytime and save again. The values persist until you change them.
        </p>
        <div className="p-3 bg-blue-50/50 border border-blue-200/50 rounded-xl">
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
      </div>
    </div>
  );
}
