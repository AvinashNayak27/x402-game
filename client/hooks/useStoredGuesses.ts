'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSingleGuess, saveGuess as saveGuessStorage } from '@/lib/storage';
import type { Guess } from '@/lib/types';

export function useStoredGuesses() {
  const [guess, setGuess] = useState<Guess | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const storedGuess = getSingleGuess();
      setGuess(storedGuess);
    } catch (error) {
      console.error('Error refreshing guess:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveGuess = useCallback(async (guesses: (string | null)[]) => {
    try {
      saveGuessStorage(guesses);
      await refresh();
    } catch (error) {
      console.error('Error saving guess:', error);
      throw error;
    }
  }, [refresh]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return {
    guess,
    loading,
    refresh,
    saveGuess,
  };
}

