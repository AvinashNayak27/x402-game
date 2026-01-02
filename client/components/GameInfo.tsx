'use client';

import { useState } from 'react';

export default function GameInfo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-8 h-8 rounded-full bg-[#d4c9b8] text-[#4a4036] flex items-center justify-center hover:bg-[#c4b5a3] transition-all duration-300 hover-lift text-sm font-medium"
        aria-label="Game information"
      >
        i
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="glass rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in shadow-xl border border-[#e0d9cc]/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-3xl font-light text-[#4a4036]">How to Play</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#8b7a6a] hover:text-[#4a4036] text-2xl font-light w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#e0d9cc] transition-colors"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 text-[#6b5d4f]">
              <div>
                <h3 className="text-xl font-light text-[#4a4036] mb-3">The Challenge</h3>
                <p className="font-light leading-relaxed">
                  There's a wallet on Base network containing <span className="font-medium text-[#4a4036]">100 USDC</span>. 
                  The mnemonic phrase for this wallet is unknown to anyone—it's a mystery waiting to be solved.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-light text-[#4a4036] mb-3">How It Works</h3>
                <ol className="list-decimal list-inside space-y-2 font-light leading-relaxed">
                  <li>Select word indices (0-23) from a 24-word mnemonic phrase</li>
                  <li>Generate AI images based on your selected word combinations</li>
                  <li>Each image generation costs a small fee (sent to dev wallet via x402.org)</li>
                  <li>Use the generated images as clues to help you guess the correct mnemonic</li>
                  <li>If you discover the correct mnemonic, you can use it to access the wallet and claim the 100 USDC</li>
                </ol>
              </div>

              <div>
                <h3 className="text-xl font-light text-[#4a4036] mb-3">The Wallet</h3>
                <p className="font-light leading-relaxed mb-2">
                  Target wallet address:
                </p>
                <a
                  href={`https://basescan.org/address/0x924418e5640cd491DF12A5eaCAd78e459e0AD049`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6b5d4f] hover:text-[#4a4036] font-mono text-sm break-all underline decoration-[#c4b5a3] hover:decoration-[#b09d8a] transition-colors"
                >
                  0x924418e5640cd491DF12A5eaCAd78e459e0AD049
                </a>
                <p className="font-light text-sm mt-2 text-[#8b7a6a]">
                  View on BaseScan →
                </p>
              </div>

              <div className="bg-[#f5f1eb]/50 rounded-xl p-4 border border-[#e0d9cc]/50">
                <p className="font-light text-sm leading-relaxed">
                  <span className="font-medium text-[#4a4036]">Tip:</span> Each image you generate reveals visual patterns 
                  that might help you piece together the correct mnemonic phrase. The more images you create, 
                  the more clues you'll have!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

