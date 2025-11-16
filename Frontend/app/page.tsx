'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useResultStore } from '@/lib/store';
import { analyzeText } from '@/lib/api';
import SafeRouteModal from '@/components/SafeRouteModal';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Home() {
  const router = useRouter();
  const clearResult = useResultStore((state) => state.clearResult);
  const setResult = useResultStore((state) => state.setResult);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [safeRouteData, setSafeRouteData] = useState<any>(null);
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleModeSelect = (mode: string) => {
    clearResult();
    router.push(`/mode/${mode}`);
  };

  const handleShareLocation = async () => {
    // Prompt user to confirm
    const confirmed = window.confirm('Do you want to share your current location?');
    if (!confirmed) return;

    setIsSharingLocation(true);
    setSafeRouteData(null);
    setShowRouteModal(true); // Show modal immediately with loading state

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: '📍 Shared my location',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Request geolocation
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser.');
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          try {
            const response = await fetch('/api/safe-route', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ currentLocation }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to find safe route');
            }

            const data = await response.json();
            setCurrentLocation(currentLocation);
            setSafeRouteData(data); // Update modal with route data

            // Add assistant response to chat
            const assistantMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: '📍 I\'ve analyzed your location and found the safest route. Check the pop-up for detailed recommendations!',
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
          } catch (err: any) {
            setShowRouteModal(false); // Close modal on error
            const errorMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: 'Sorry, I couldn\'t analyze your location. Please try again.',
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
          } finally {
            setIsSharingLocation(false);
          }
        },
        (error) => {
          let errorMessage = 'Unable to get your location. ';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Please allow location access.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out.';
              break;
            default:
              errorMessage += 'An unknown error occurred.';
              break;
          }
          setShowRouteModal(false); // Close modal on error
          const errorChatMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: errorMessage,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorChatMessage]);
          setIsSharingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } catch (err: any) {
      setShowRouteModal(false); // Close modal on error
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: err.message || 'Failed to share location. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsSharingLocation(false);
    }
  };


  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAnalyzing) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date(),
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = chatInput.trim();
    setChatInput('');
    setIsAnalyzing(true);

    try {
      // Call the chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: currentInput }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      // Add response to chat messages (inline only, no pop-up)
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error getting chat response:', err);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-soft-pink via-pastel-pink to-soft-pink p-4 pt-20">
      <div className="max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-8">
        {/* Emergency Quick Guide Panel - Left Side */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-pink-50 border border-pink-200 rounded-xl p-6 shadow-md sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-5">
              Emergency Quick Guide
            </h2>
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-800 mb-1.5">
                  What to do if being followed
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Stay calm, change direction, head to a public area, call someone, and don't go home directly.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1.5">
                  What to do in dark areas
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Stay alert, use well-lit paths, keep phone accessible, walk confidently, and avoid distractions.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1.5">
                  When to call the police
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  If you feel threatened, witness a crime, are being followed persistently, or in immediate danger.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1.5">
                  Self-defense basics
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Stay aware, trust your instincts, use your voice loudly, aim for vulnerable areas, and escape when possible.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area - Right Side */}
        <div className="flex-1 flex flex-col items-center pt-4 pb-8">
          {/* Tagline - Centered horizontally above chatbox */}
          <div className="w-full max-w-3xl text-center mb-10">
            <p className="text-lg md:text-xl text-gray-700 italic font-semibold leading-relaxed">
              Get instant safety insight powered by{' '}
              <span className="not-italic font-bold">
                <span className="text-gemini-blue">Google</span>{' '}
                <span className="text-gemini-purple">Gemini</span> AI
              </span>
              .
            </p>
          </div>

          {/* Chat Messages Display - Separate from input box */}
          {(messages.length > 0 || isAnalyzing) && (
            <div id="chat-messages" className="w-full max-w-3xl space-y-3 mb-6 max-h-[400px] overflow-y-auto px-2">
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
              {(isAnalyzing || isSharingLocation) && (
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
                      <span className="text-sm text-gray-800">
                        {isSharingLocation ? 'Analyzing safest route...' : 'Analyzing...'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}

          {/* Chat Input Box - Separate from messages */}
          <form id="chat-input" onSubmit={handleChatSubmit} className="w-full max-w-3xl mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-pink-200 p-4 relative">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about safety concerns or describe a situation..."
                className="w-full px-4 py-3 pr-32 text-gray-700 placeholder-gray-400 resize-none focus:outline-none min-h-[100px] max-h-[200px] leading-relaxed"
                rows={3}
                disabled={isAnalyzing || isSharingLocation}
              />
              
              {/* Location Icon Button */}
              <button
                type="button"
                onClick={handleShareLocation}
                disabled={isAnalyzing || isSharingLocation}
                className="absolute bottom-4 right-32 text-gray-500 hover:text-button-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg hover:bg-pink-50 flex items-center justify-center"
                aria-label="Share location"
                title="Share your location to find the safest route"
              >
                {isSharingLocation ? (
                  <svg
                    className="animate-spin h-5 w-5"
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
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!chatInput.trim() || isAnalyzing || isSharingLocation}
                className="bg-button-primary hover:bg-button-primary-hover text-white rounded-xl px-6 py-2.5 font-semibold shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed absolute bottom-4 right-4 flex items-center gap-2 hover:scale-[1.02] hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-md"
              >
                {isAnalyzing ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
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
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Send
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Action Buttons */}
          <div className="w-full max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleModeSelect('image')}
                className="bg-button-primary hover:bg-button-primary-hover text-white rounded-xl px-8 py-5 font-semibold shadow-md transition-all duration-200 flex items-center justify-center gap-3 text-lg hover:shadow-lg hover:scale-[1.02]"
              >
                <svg
                  className="w-6 h-6"
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
                Upload Image
              </button>

              <button
                onClick={() => handleModeSelect('video')}
                className="bg-button-primary hover:bg-button-primary-hover text-white rounded-xl px-8 py-5 font-semibold shadow-md transition-all duration-200 flex items-center justify-center gap-3 text-lg hover:shadow-lg hover:scale-[1.02]"
              >
                <svg
                  className="w-6 h-6"
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
                Upload Video
              </button>

              <button
                onClick={() => handleModeSelect('text')}
                className="bg-button-primary hover:bg-button-primary-hover text-white rounded-xl px-8 py-5 font-semibold shadow-md transition-all duration-200 flex items-center justify-center gap-3 text-lg hover:shadow-lg hover:scale-[1.02]"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Write Text
              </button>

              <button
                onClick={() => handleModeSelect('audio')}
                className="bg-button-primary hover:bg-button-primary-hover text-white rounded-xl px-8 py-5 font-semibold shadow-md transition-all duration-200 flex items-center justify-center gap-3 text-lg hover:shadow-lg hover:scale-[1.02]"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
                Record Audio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Safe Route Modal */}
      {showRouteModal && (
        <SafeRouteModal
          isLoading={isSharingLocation}
          routeLink={safeRouteData?.route_link}
          routeDescription={safeRouteData?.route_description || ''}
          unsafeAreas={safeRouteData?.unsafe_areas || []}
          safeAreas={safeRouteData?.safe_areas || []}
          cautionAreas={safeRouteData?.caution_areas}
          recommendedActions={safeRouteData?.recommended_actions || []}
          threatLevel={safeRouteData?.threat_level || 'unknown'}
          currentLocation={currentLocation}
          onClose={() => {
            setShowRouteModal(false);
            setSafeRouteData(null);
            setCurrentLocation(null);
          }}
        />
      )}
    </div>
  );
}
