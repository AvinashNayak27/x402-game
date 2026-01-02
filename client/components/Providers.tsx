'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { base } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactNode } from 'react';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'b0c99c09c190fffec9a27bc2678a0c12';

if (typeof window !== 'undefined' && !projectId) {
  console.warn(
    'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. WalletConnect features may not work. ' +
    'Get a free project ID at https://cloud.walletconnect.com'
  );
}

const config = getDefaultConfig({
  appName: 'Mnemonic Hunt via X402',
  projectId: projectId || 'YOUR_PROJECT_ID', // Fallback for development
  chains: [base], // Using Base chain as per server configuration (eip155:8453)
  ssr: true, // Enable SSR for Next.js
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

