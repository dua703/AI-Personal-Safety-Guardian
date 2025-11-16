'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface AnalysisResponse {
  threat_level: 'low' | 'medium' | 'high' | 'critical' | 'unknown';
  sound_events?: string[];
  risk_reasoning?: string;
  actions?: string[];
  [key: string]: any;
}

interface AudioRecorderProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onResponse?: (response: string) => void;
  onAnalysisComplete?: (data: AnalysisResponse) => void;
}

export default function AudioRecorder({ isLoading, setIsLoading, onResponse, onAnalysisComplete }: AudioRecorderProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        const file = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
        setSelectedFile(file);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please record or upload an audio file');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', selectedFile);

      const response = await fetch('/api/analyze-audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze audio');
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
          `Sound Events: ${data.sound_events?.join(', ') || 'N/A'}\n\n` +
          `${data.risk_reasoning || 'Analysis complete'}\n\n` +
          `Actions:\n${data.actions?.map((a: string) => `• ${a}`).join('\n') || 'Stay alert'}`;
        onResponse(responseText);
      }
      
      // Clear selected file after successful submission
      setSelectedFile(null);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze audio. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-pink-300 rounded-2xl p-8 text-center cursor-pointer hover:border-baby-pink hover:bg-pink-50 transition-all duration-200"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mpeg,audio/mp3,audio/wav,audio/webm,audio/ogg,audio/m4a"
            onChange={handleFileChange}
            className="hidden"
          />
          <svg
            className="w-12 h-12 text-pink-300 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-gray-700 text-sm font-medium">Upload Audio</p>
        </div>

        <div className="border-2 border-dashed border-pink-300 rounded-2xl p-8 text-center">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="w-full flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-baby-pink hover:bg-rose-pink rounded-full flex items-center justify-center mb-3 transition-all duration-200 shadow-md">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              </div>
              <p className="text-gray-700 text-sm font-medium">Record Audio</p>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="w-full flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-rose-pink rounded-full flex items-center justify-center mb-3 animate-pulse shadow-md">
                <div className="w-6 h-6 bg-white rounded"></div>
              </div>
              <p className="text-rose-pink text-sm font-semibold">Recording...</p>
            </button>
          )}
        </div>
      </div>

      {selectedFile && (
        <div className="bg-pink-50 rounded-xl p-4 border border-pink-200">
          <p className="text-sm text-gray-700 mb-2">
            <span className="font-semibold">Selected:</span> {selectedFile.name}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            Size: {(selectedFile.size / 1024).toFixed(2)} KB
          </p>
          {audioUrl && (
            <audio controls src={audioUrl} className="w-full mt-2 rounded-lg" />
          )}
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
          'Analyze Audio'
        )}
      </button>
    </div>
  );
}
