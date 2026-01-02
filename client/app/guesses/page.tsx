'use client';

import Guesses from '@/components/Guesses';

export default function GuessesPage() {
  return (
    <main className="min-h-screen bg-[#faf8f5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-light text-[#4a4036] tracking-tight mb-2">
            Your Guesses
          </h1>
          <p className="text-[#8b7a6a] font-light text-sm">
            Save and manage your mnemonic phrase guesses. Import them in a wallet to verify the public address.
          </p>
        </div>
        <Guesses />
      </div>
    </main>
  );
}

