import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { ImageData, ImageMetadata, Guess } from './types';

interface X402GameDB extends DBSchema {
  images: {
    key: string;
    value: ImageData;
    indexes: { 'by-timestamp': number };
  };
}

const DB_NAME = 'x402_game_db';
const DB_VERSION = 1;
const STORE_NAME = 'images';
const METADATA_KEY = 'x402_game_images';
const GUESSES_KEY = 'x402_game_guesses';
const SINGLE_GUESS_KEY = 'x402_game_single_guess';

let dbPromise: Promise<IDBPDatabase<X402GameDB>> | null = null;

function getDB(): Promise<IDBPDatabase<X402GameDB>> {
  if (!dbPromise) {
    dbPromise = openDB<X402GameDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('by-timestamp', 'timestamp');
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Save image data to IndexedDB and update metadata in localStorage
 */
export async function saveImage(data: ImageData): Promise<string> {
  try {
    const db = await getDB();
    await db.put(STORE_NAME, data);
    
    // Update metadata in localStorage
    const metadata: ImageMetadata = {
      id: data.id,
      indices: data.indices,
      timestamp: data.timestamp,
      price: data.price,
    };
    
    const existingMetadata = getMetadata();
    const updatedMetadata = [
      ...existingMetadata.filter((m) => m.id !== data.id),
      metadata,
    ].sort((a, b) => b.timestamp - a.timestamp);
    
    localStorage.setItem(METADATA_KEY, JSON.stringify(updatedMetadata));
    
    return data.id;
  } catch (error) {
    console.error('Error saving image to IndexedDB:', error);
    throw error;
  }
}

/**
 * Retrieve image data from IndexedDB by ID
 */
export async function getImage(id: string): Promise<ImageData | null> {
  try {
    const db = await getDB();
    return (await db.get(STORE_NAME, id)) || null;
  } catch (error) {
    console.error('Error retrieving image from IndexedDB:', error);
    return null;
  }
}

/**
 * Sync metadata from IndexedDB to localStorage
 * This recovers metadata if localStorage was cleared but IndexedDB data still exists
 */
export async function syncMetadataFromIndexedDB(): Promise<void> {
  try {
    const db = await getDB();
    const allImages = await db.getAll(STORE_NAME);
    
    if (allImages.length === 0) {
      // No images in IndexedDB, clear metadata
      localStorage.removeItem(METADATA_KEY);
      return;
    }
    
    // Rebuild metadata from IndexedDB data
    const metadata: ImageMetadata[] = allImages.map((image) => ({
      id: image.id,
      indices: image.indices,
      timestamp: image.timestamp,
      price: image.price,
    })).sort((a, b) => b.timestamp - a.timestamp);
    
    localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
  } catch (error) {
    console.error('Error syncing metadata from IndexedDB:', error);
  }
}

/**
 * Get all image metadata (lightweight, from localStorage)
 * Automatically syncs from IndexedDB if metadata is missing or incomplete
 */
export async function getAllImages(): Promise<ImageMetadata[]> {
  try {
    const metadata = getMetadata();
    
    // If metadata is empty, try to sync from IndexedDB
    if (metadata.length === 0) {
      await syncMetadataFromIndexedDB();
      return getMetadata();
    }
    
    // Verify metadata matches IndexedDB (check if any IDs are missing)
    // This is a lightweight check - we'll sync if there's a mismatch
    try {
      const db = await getDB();
      const indexedDBIds = new Set((await db.getAllKeys(STORE_NAME)));
      const metadataIds = new Set(metadata.map(m => m.id));
      
      // If there are images in IndexedDB not in metadata, sync
      if (indexedDBIds.size > metadataIds.size) {
        await syncMetadataFromIndexedDB();
        return getMetadata();
      }
    } catch (error) {
      // If IndexedDB check fails, just return what we have
      console.warn('Could not verify metadata against IndexedDB:', error);
    }
    
    return metadata;
  } catch (error) {
    console.error('Error retrieving metadata from localStorage:', error);
    // Try to recover from IndexedDB
    try {
      await syncMetadataFromIndexedDB();
      return getMetadata();
    } catch (syncError) {
      console.error('Error syncing metadata:', syncError);
      return [];
    }
  }
}

/**
 * Delete image from both IndexedDB and localStorage metadata
 */
export async function deleteImage(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
    
    // Update metadata in localStorage
    const existingMetadata = getMetadata();
    const updatedMetadata = existingMetadata.filter((m) => m.id !== id);
    localStorage.setItem(METADATA_KEY, JSON.stringify(updatedMetadata));
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

/**
 * Clear all images from IndexedDB and localStorage
 */
export async function clearAll(): Promise<void> {
  try {
    const db = await getDB();
    await db.clear(STORE_NAME);
    localStorage.removeItem(METADATA_KEY);
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw error;
  }
}

/**
 * Helper function to get metadata from localStorage
 */
function getMetadata(): ImageMetadata[] {
  try {
    const stored = localStorage.getItem(METADATA_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as ImageMetadata[];
  } catch {
    return [];
  }
}

/**
 * Check if IndexedDB is available
 */
export function isIndexedDBAvailable(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

/**
 * Normalize base64 string to data URL format
 * Handles both raw base64 and existing data URLs
 */
export function normalizeBase64ToDataUrl(base64: string): string {
  if (base64.startsWith('data:')) {
    return base64;
  }
  return `data:image/jpeg;base64,${base64}`;
}

/**
 * Save a single guess to localStorage (only one guess persists)
 * guesses: array of 24 positions, each containing a guessed word (alphabets only) or null
 */
export function saveGuess(guesses: (string | null)[]): void {
  try {
    // Ensure we have exactly 24 positions and normalize words (trim, lowercase, alphabets only)
    const normalizedGuesses = Array.from({ length: 24 }, (_, i) => {
      const word = guesses[i];
      if (!word) return null;
      // Remove non-alphabetic characters and convert to lowercase
      const cleaned = word.trim().replace(/[^a-zA-Z]/g, '').toLowerCase();
      return cleaned === '' ? null : cleaned;
    });
    
    const guess: Guess = {
      id: 'single_guess',
      guesses: normalizedGuesses,
      timestamp: Date.now(),
    };
    
    localStorage.setItem(SINGLE_GUESS_KEY, JSON.stringify(guess));
  } catch (error) {
    console.error('Error saving guess:', error);
    throw error;
  }
}

/**
 * Get the single saved guess from localStorage
 */
export function getSingleGuess(): Guess | null {
  try {
    const stored = localStorage.getItem(SINGLE_GUESS_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as Guess;
  } catch (error) {
    console.error('Error retrieving guess from localStorage:', error);
    return null;
  }
}

/**
 * Get all guesses from localStorage
 */
export function getAllGuesses(): Guess[] {
  try {
    const stored = localStorage.getItem(GUESSES_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as Guess[];
  } catch (error) {
    console.error('Error retrieving guesses from localStorage:', error);
    return [];
  }
}

/**
 * Delete a guess from localStorage
 */
export function deleteGuess(id: string): void {
  try {
    const existingGuesses = getAllGuesses();
    const updatedGuesses = existingGuesses.filter((g) => g.id !== id);
    localStorage.setItem(GUESSES_KEY, JSON.stringify(updatedGuesses));
  } catch (error) {
    console.error('Error deleting guess:', error);
    throw error;
  }
}

/**
 * Clear all guesses from localStorage
 */
export function clearAllGuesses(): void {
  try {
    localStorage.removeItem(GUESSES_KEY);
  } catch (error) {
    console.error('Error clearing guesses:', error);
    throw error;
  }
}

