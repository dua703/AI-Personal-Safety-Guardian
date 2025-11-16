'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface AnalysisResponse {
  threat_level: 'low' | 'medium' | 'high' | 'critical' | 'unknown';
  detected_objects?: string[];
  explanation?: string;
  recommended_actions?: string[];
  confidence_score?: number;
  [key: string]: any;
}

interface FileUploaderProps {
  type: 'image';
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onResponse?: (response: string) => void;
  onAnalysisComplete?: (data: AnalysisResponse) => void;
}

export default function FileUploader({ type, isLoading, setIsLoading, onResponse, onAnalysisComplete }: FileUploaderProps) {
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
      formData.append('image', selectedFile);

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze image');
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
          `Detected: ${data.detected_objects?.join(', ') || 'N/A'}\n\n` +
          `${data.explanation || 'Analysis complete'}\n\n` +
          `Recommended Actions:\n${data.recommended_actions?.map((a: string) => `• ${a}`).join('\n') || 'Stay alert'}`;
        onResponse(responseText);
      }
      
      // Clear selected file after successful submission
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze image. Please try again.');
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
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
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
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-gray-700 mb-2 font-medium">
          {selectedFile ? selectedFile.name : 'Click to select an image'}
        </p>
        <p className="text-sm text-gray-500">
          Supports: JPEG, PNG, GIF, WEBP (Max 10MB)
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
          'Analyze Image'
        )}
      </button>
    </div>
  );
}
