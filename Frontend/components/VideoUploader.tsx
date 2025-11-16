'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface AnalysisResponse {
  threat_level: 'low' | 'medium' | 'high' | 'critical' | 'unknown';
  hazards_seen?: string[];
  people_detected?: string[];
  movement_patterns?: string[];
  summary?: string;
  actions?: string[];
  [key: string]: any;
}

interface VideoUploaderProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onResponse?: (response: string) => void;
  onAnalysisComplete?: (data: AnalysisResponse) => void;
}

export default function VideoUploader({ isLoading, setIsLoading, onResponse, onAnalysisComplete }: VideoUploaderProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);

      const response = await fetch('/api/analyze-video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze video');
      }

      const data = await response.json();
      
      // Trigger toast pop-up with full analysis data
      if (onAnalysisComplete) {
        onAnalysisComplete(data);
      }
      
      // Format response for chat display
      if (onResponse) {
        const threatEmoji = data.threat_level === 'critical' ? '🔴' : 
                           data.threat_level === 'high' ? '🟠' : 
                           data.threat_level === 'medium' ? '🟡' : '🟢';
        const responseText = `${threatEmoji} Threat Level: ${data.threat_level.toUpperCase()}\n\n` +
          `Hazards: ${data.hazards_seen?.join(', ') || 'N/A'}\n` +
          `People Detected: ${data.people_detected?.join(', ') || 'N/A'}\n` +
          `Movement: ${data.movement_patterns?.join(', ') || 'N/A'}\n\n` +
          `${data.summary || 'Analysis complete'}\n\n` +
          `Actions:\n${data.actions?.map((a: string) => `• ${a}`).join('\n') || 'Stay alert'}`;
        onResponse(responseText);
      }
      
      // Clear selected file after successful submission
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze video. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-pink-300 rounded-2xl p-12 text-center cursor-pointer hover:border-baby-pink hover:bg-pink-50 transition-all duration-200"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
          onChange={handleFileChange}
          className="hidden"
        />
        <svg
          className="w-16 h-16 text-pink-300 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <p className="text-gray-700 mb-2 font-medium">
          {selectedFile ? selectedFile.name : 'Click to select a video'}
        </p>
        <p className="text-sm text-gray-500">
          Supports: MP4, WebM, MOV, AVI (Max 50MB)
        </p>
      </div>

      {selectedFile && (
        <div className="bg-pink-50 rounded-xl p-4 border border-pink-200">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Selected:</span> {selectedFile.name}
          </p>
          <p className="text-sm text-gray-600">
            Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!selectedFile || isLoading}
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
          'Analyze Video'
        )}
      </button>
    </div>
  );
}
