'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useResultStore } from '@/lib/store';
import ThreatResult from '@/components/ThreatResult';

export default function ResultsPage() {
  const router = useRouter();
  const result = useResultStore((state) => state.result);

  useEffect(() => {
    if (!result) {
      router.push('/');
    }
  }, [result, router]);

  if (!result) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-soft-pink via-pastel-pink to-soft-pink p-4 pt-20">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-pink-100">
          <div className="mb-6">
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-900 mb-4 flex items-center transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Home
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Analysis Results</h1>
          </div>

          <ThreatResult result={result} />
        </div>
      </div>
    </div>
  );
}
