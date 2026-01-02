'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 w-full bg-[#faf8f5]/80 backdrop-blur-md border-b border-[#e0d9cc]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="hidden sm:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-light transition-colors duration-200 ${
                pathname === '/'
                  ? 'text-[#4a4036] border-b-2 border-[#c4b5a3] pb-1'
                  : 'text-[#8b7a6a] hover:text-[#6b5d4f]'
              }`}
            >
              Hunt
            </Link>
            <Link
              href="/gallery"
              className={`text-sm font-light transition-colors duration-200 ${
                pathname === '/gallery'
                  ? 'text-[#4a4036] border-b-2 border-[#c4b5a3] pb-1'
                  : 'text-[#8b7a6a] hover:text-[#6b5d4f]'
              }`}
            >
              Clues
            </Link>
            <Link
              href="/guesses"
              className={`text-sm font-light transition-colors duration-200 ${
                pathname === '/guesses'
                  ? 'text-[#4a4036] border-b-2 border-[#c4b5a3] pb-1'
                  : 'text-[#8b7a6a] hover:text-[#6b5d4f]'
              }`}
            >
              Guess
            </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}

