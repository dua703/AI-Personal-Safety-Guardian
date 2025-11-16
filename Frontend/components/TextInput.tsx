'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AnalysisResponse {
  emotional_cues?: string[];
  danger_probability?: number;
  suggestions?: string[];
  urgent_help_needed?: boolean;
  threat_level?: 'low' | 'medium' | 'high' | 'critical' | 'unknown';
  [key: string]: any;
}

interface TextInputProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onResponse?: (response: string) => void;
  onAnalysisComplete?: (data: AnalysisResponse) => void;
}

export default function TextInput({ isLoading, setIsLoading, onResponse, onAnalysisComplete }: TextInputProps) {
  const router = useRouter();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    // Use Array.from for accurate Unicode character counting
    if (Array.from(text).length > 10000) {
      setError('Text must be under 10,000 characters');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Safely encode text (handles Unicode, special characters, emojis, etc.)
      const response = await fetch('/api/text-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text.trim() }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          throw new Error('Failed to analyze text. Please try again.');
        }
        throw new Error(errorData.error || 'Failed to analyze text');
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Invalid response from server. Please try again.');
      }
      
      // Map response to expected format
      const threatLevel = data.threat_level || 'low';
      const analysisData = {
        threat_level: threatLevel,
        explanation: data.explanation || 'Analysis complete.',
        recommended_actions: data.recommended_actions || [],
        detected_risks: data.explanation ? [data.explanation] : [],
        confidence_score: threatLevel === 'high' || threatLevel === 'critical' ? 0.8 : 0.6,
      };
      
      // Trigger toast pop-up with full analysis data (formal report)
      if (onAnalysisComplete) {
        onAnalysisComplete(analysisData);
      }
      
      // Format response for chat display (brief summary)
      if (onResponse) {
        const threatEmoji = threatLevel === 'critical' ? '🔴' : 
                           threatLevel === 'high' ? '🟠' : 
                           threatLevel === 'medium' ? '🟡' : '🟢';
        const responseText = `${threatEmoji} Safety Analysis Complete\n\n` +
          `Threat Level: ${threatLevel.toUpperCase()}\n\n` +
          `${data.explanation || 'Analysis complete.'}\n\n` +
          `See detailed report in the analysis modal.`;
        onResponse(responseText);
      }
      
      // Clear text after successful submission
      setText('');
    } catch (err: any) {
      setError(err.message || 'Failed to analyze text. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="text-input" className="block text-sm font-semibold text-gray-700 mb-2">
          Enter text to analyze
        </label>
        <textarea
          id="text-input"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError(null);
          }}
          placeholder="Type or paste text here to analyze for safety concerns..."
          className="w-full h-64 p-4 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-baby-pink focus:border-baby-pink resize-none bg-white text-gray-700 placeholder-gray-400"
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-500">
            {Array.from(text).length} / 10,000 characters
          </p>
          {Array.from(text).length > 10000 && (
            <p className="text-sm text-red-600 font-medium">Text is too long</p>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!text.trim() || isLoading || Array.from(text).length > 10000}
        className="w-full bg-button-primary hover:bg-button-primary-hover text-white rounded-xl px-6 py-3 font-semibold shadow-md transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center hover:scale-[1.02] hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-md"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Analyzing...
          </>
        ) : (
          'Analyze Text'
        )}
      </button>
    </div>
  );
}
