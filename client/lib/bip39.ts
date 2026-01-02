// BIP39 English wordlist
// Source: https://github.com/bitcoinjs/bip39/blob/master/src/wordlists/english.json
const BIP39_WORDLIST_URL = 'https://raw.githubusercontent.com/bitcoinjs/bip39/master/src/wordlists/english.json';

let wordlistCache: Set<string> | null = null;

/**
 * Load BIP39 English wordlist
 */
export async function loadBIP39Wordlist(): Promise<Set<string>> {
  if (wordlistCache) {
    return wordlistCache;
  }

  try {
    const response = await fetch(BIP39_WORDLIST_URL);
    const words: string[] = await response.json();
    wordlistCache = new Set(words.map(w => w.toLowerCase()));
    return wordlistCache;
  } catch (error) {
    console.error('Error loading BIP39 wordlist:', error);
    // Return empty set if fetch fails
    return new Set<string>();
  }
}

/**
 * Check if a word exists in BIP39 wordlist
 */
export async function isValidBIP39Word(word: string): Promise<boolean> {
  if (!word) return false;
  const wordlist = await loadBIP39Wordlist();
  return wordlist.has(word.toLowerCase().trim());
}

/**
 * Validate all words in a guess array
 */
export async function validateBIP39Words(words: (string | null)[]): Promise<{
  isValid: boolean;
  invalidWords: { position: number; word: string }[];
}> {
  const wordlist = await loadBIP39Wordlist();
  const invalidWords: { position: number; word: string }[] = [];

  words.forEach((word, position) => {
    if (word && word.trim() !== '') {
      const normalized = word.toLowerCase().trim();
      if (!wordlist.has(normalized)) {
        invalidWords.push({ position, word });
      }
    }
  });

  return {
    isValid: invalidWords.length === 0,
    invalidWords,
  };
}

