export interface ImageData {
  id: string;
  base64: string;
  indices: number[];
  timestamp: number;
  price: number;
}

export interface ImageMetadata {
  id: string;
  indices: number[];
  timestamp: number;
  price: number;
}

export interface ImageResponse {
  indices: number[];
  base64: string;
}

export interface Guess {
  id: string;
  guesses: (string | null)[]; // Array of 24 positions, each containing a guessed word (alphabets only) or null
  timestamp: number;
}

