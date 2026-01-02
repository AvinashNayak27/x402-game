'use client';

import { wrapFetchWithPayment } from '@x402/fetch';
import { x402Client } from '@x402/core/client';
import { registerExactEvmScheme } from '@x402/evm/exact/client';
import { useWalletClient } from 'wagmi';
import { useMemo } from 'react';
import type { ImageResponse } from './types';

const API_URL = "https://x402.buildweekends.com"

/**
 * Calculate price based on number of indices
 */
export function calculatePrice(count: number): number {
  const pricing_dict: Record<number, number> = {
    2: 7,
    3: 6.5,
    4: 6,
    5: 5.5,
    6: 5,
    7: 4.5,
    8: 4,
    9: 3.5,
    10: 3,
    11: 2.5,
    12: 2,
    13: 1.5,
    14: 1,
    15: 0.9,
    16: 0.8,
    17: 0.7,
    18: 0.6,
    19: 0.5,
    20: 0.4,
    21: 0.3,
    22: 0.2,
    23: 0.1,
    24: 0.05,
  };
  
  return pricing_dict[count] || 0;
}

/**
 * Hook to get fetch function with X402 payment handling
 * This must be used within a component that has wagmi providers
 */
export function useFetchWithPayment(): typeof fetch {
  const { data: walletClient } = useWalletClient();

  const fetchWithPayment = useMemo((): typeof fetch => {
    if (!walletClient) {
      // Return regular fetch if wallet not connected
      return fetch;
    }

    try {
      // Create x402 client
      const client = new x402Client();

      // Create signer from wallet client
      // wagmi's walletClient provides signMessage and signTypedData methods
      const signer = {
        address: walletClient.account.address as `0x${string}`,
        signMessage: async ({ message }: { message: string }) => {
          return await walletClient.signMessage({ message }) as `0x${string}`;
        },
        signTypedData: async (args: {
          domain: Record<string, unknown>;
          types: Record<string, unknown>;
          primaryType: string;
          message: Record<string, unknown>;
        }) => {
          return await walletClient.signTypedData(args) as `0x${string}`;
        },
      };

      // Register EVM scheme with signer
      registerExactEvmScheme(client, { signer });

      // Wrap fetch with payment handling
      return wrapFetchWithPayment(fetch, client) as typeof fetch;
    } catch (error) {
      console.error('Error setting up x402 client:', error);
      return fetch;
    }
  }, [walletClient]);

  return fetchWithPayment;
}

/**
 * Generate image by calling the /image endpoint
 * The X402 payment interceptor will automatically handle 402 responses
 */
export async function generateImage(
  indices: number[],
  fetchWithPayment: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
): Promise<ImageResponse> {
    if (indices.length < 2 || indices.length > 24) {
    throw new Error('Invalid number of indices. Must be between 2 and 24.');
  }

  if (indices.some((idx) => idx < 0 || idx > 23)) {
    throw new Error('Invalid index. All indices must be between 0 and 23.');
  }

  // Check for duplicates
  const uniqueIndices = [...new Set(indices)];
  if (uniqueIndices.length !== indices.length) {
    throw new Error('Duplicate indices are not allowed.');
  }

  const idxParam = indices.join(',');
  const url = `${API_URL}/image?idx=${idxParam}`;

  try {
    const response = await fetchWithPayment(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data: ImageResponse = await response.json();
    
    // Validate response structure
    if (!data.indices || !data.base64) {
      throw new Error('Invalid response format from server');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate image');
  }
}

