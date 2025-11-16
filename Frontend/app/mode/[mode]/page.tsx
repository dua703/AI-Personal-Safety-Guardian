'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import FileUploader from '@/components/FileUploader';
import VideoUploader from '@/components/VideoUploader';
import AudioRecorder from '@/components/AudioRecorder';
import TextInput from '@/components/TextInput';
import AnalysisToast from '@/components/AnalysisToast';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ModePage() {
  const params = useParams();
  const router = useRouter();
  const mode = params?.mode as string;

  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [toastData, setToastData] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const validModes = ['image', 'video', 'audio', 'text'];

  useEffect(() => {
    if (mode && !validModes.includes(mode)) {
      router.push('/error');
    }
  }, [mode, router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!mode || !validModes.includes(mode)) {
    return null;
  }

  const getTitle = () => {
    switch (mode) {
      case 'image':
        return 'Upload Image';
      case 'video':
        return 'Upload Video';
      case 'audio':
        return 'Record Audio';
      case 'text':
        return 'Write Text';
      default:
        return 'Analyze Content';
    }
  };

  const handleResponse = (response: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: mode === 'image' ? 'Uploaded an image for analysis' :
               mode === 'video' ? 'Uploaded a video for analysis' :
               mode === 'audio' ? 'Uploaded audio for analysis' :
               'Submitted text for analysis',
      timestamp: new Date(),
    };

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
  };

  const handleAnalysisComplete = (data: any) => {
    setToastData(data);
  };

  const renderComponent = () => {
    switch (mode) {
      case 'image':
        return <FileUploader type="image" isLoading={isLoading} setIsLoading={setIsLoading} onResponse={handleResponse} onAnalysisComplete={handleAnalysisComplete} />;
      case 'video':
        return <VideoUploader isLoading={isLoading} setIsLoading={setIsLoading} onResponse={handleResponse} onAnalysisComplete={handleAnalysisComplete} />;
      case 'audio':
        return <AudioRecorder isLoading={isLoading} setIsLoading={setIsLoading} onResponse={handleResponse} onAnalysisComplete={handleAnalysisComplete} />;
      case 'text':
        return <TextInput isLoading={isLoading} setIsLoading={setIsLoading} onResponse={handleResponse} onAnalysisComplete={handleAnalysisComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-soft-pink via-pastel-pink to-soft-pink p-4 pt-20">
      <div className="max-w-2xl w-full">
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
            <h1 className="text-3xl font-bold text-gray-800">{getTitle()}</h1>
            <p className="text-gray-600 mt-2">
              {mode === 'image' && 'Upload an image file to analyze for safety threats'}
              {mode === 'video' && 'Upload a video file to analyze for safety threats'}
              {mode === 'audio' && 'Record or upload an audio file to analyze for safety threats'}
              {mode === 'text' && 'Enter text to analyze for safety concerns'}
            </p>
          </div>

          {/* Chat Messages Display */}
          {messages.length > 0 && (
            <div className="mb-6 space-y-3 max-h-[300px] overflow-y-auto bg-pink-50 rounded-xl p-4 border border-pink-200">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-pink-200 text-gray-800'
                        : 'bg-white border border-pink-200 rounded-xl shadow-sm text-gray-800'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-pink-200 rounded-xl shadow-sm px-4 py-3">
                    <div className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 text-pink-500"
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
                      <span className="text-sm text-gray-800">Analyzing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}

          {renderComponent()}
        </div>
      </div>

      {/* Analysis Toast Pop-up */}
      {toastData && (
        <AnalysisToast
          threatLevel={toastData.threat_level || 'unknown'}
          detectedRisks={toastData.detected_objects || toastData.detected_risks}
          recommendedActions={toastData.recommended_actions || toastData.actions || toastData.suggestions}
          confidenceScore={toastData.confidence_score}
          hazardsSeen={toastData.hazards_seen}
          peopleDetected={toastData.people_detected}
          movementPatterns={toastData.movement_patterns}
          summary={toastData.summary || toastData.explanation}
          soundEvents={toastData.sound_events}
          riskReasoning={toastData.risk_reasoning}
          emotionalCues={toastData.emotional_cues}
          dangerProbability={toastData.danger_probability}
          suggestions={toastData.suggestions}
          urgentHelpNeeded={toastData.urgent_help_needed}
          onClose={() => setToastData(null)}
        />
      )}
    </div>
  );
}
