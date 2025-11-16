'use client';

import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  return (
    <header className="w-full px-4 py-4 absolute top-0 left-0 z-10">
      <button
        onClick={() => router.push('/')}
        className="text-gray-800 font-bold text-xl hover:text-gray-900 transition-colors"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        AI Personal Safety Guardian
      </button>
    </header>
  );
}
