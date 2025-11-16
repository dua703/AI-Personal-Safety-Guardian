'use client';

import { useEffect } from 'react';

interface SafeRouteModalProps {
  isLoading?: boolean;
  routeLink?: string;
  routeDescription: string;
  unsafeAreas: string[];
  safeAreas: string[];
  cautionAreas?: string[];
  recommendedActions: string[];
  threatLevel: 'low' | 'medium' | 'high' | 'critical' | 'unknown';
  currentLocation?: { lat: number; lng: number } | null;
  onClose: () => void;
}

export default function SafeRouteModal({
  isLoading = false,
  routeLink,
  routeDescription,
  unsafeAreas,
  safeAreas,
  cautionAreas,
  recommendedActions,
  threatLevel,
  currentLocation,
  onClose,
}: SafeRouteModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const getThreatEmoji = () => {
    switch (threatLevel.toLowerCase()) {
      case 'low':
        return '🟢';
      case 'medium':
        return '🟡';
      case 'high':
        return '🟠';
      case 'critical':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getThreatColor = () => {
    switch (threatLevel.toLowerCase()) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-orange-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Semi-transparent dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm" />

      {/* Modal Content - Fixed Size Card */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-pink-200 w-[90vw] max-w-[600px] h-[85vh] max-h-[700px] flex flex-col animate-slide-up-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section - Fixed */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-pink-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Safe Route Analysis</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-pink-50"
              aria-label="Close"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          
          {!isLoading && (
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getThreatEmoji()}</span>
              <div>
                <p className={`text-lg font-semibold ${getThreatColor()}`}>
                  Threat Level: {threatLevel.toUpperCase()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Loading State - Centered Animation */}
        {isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 animate-fade-in">
            {/* Walking Person Animation - Looped */}
            <div className="mb-6">
              <div className="text-6xl md:text-7xl animate-bounce" style={{ animationDuration: '1.5s', animationIterationCount: 'infinite' }}>
                🚶
              </div>
            </div>
            
            {/* Loading Text - Centered, Semi-bold, Pastel Accent */}
            <p className="text-xl md:text-2xl font-semibold text-rose-pink text-center mb-2">
              Finding the best route...
            </p>
            <p className="text-sm md:text-base text-gray-500 text-center">
              Analyzing your location for safety
            </p>
          </div>
        )}

        {/* Scrollable Content Area - Only show when not loading */}
        {!isLoading && (
          <div className="flex-1 overflow-y-auto px-6 py-4 animate-fade-in">

            {/* Route Description */}
            <div className="mb-5">
              <h3 className="text-base font-semibold text-gray-800 mb-2">Route Description</h3>
              {routeDescription ? (
                <>
                  <p className="text-sm text-gray-700 leading-relaxed bg-pink-50 rounded-lg p-3 border border-pink-200 mb-3">
                    {routeDescription}
                  </p>
                  {/* Google Maps Link */}
                  {routeLink && (
                    <a
                      href={routeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-button-primary hover:bg-button-primary-hover text-white rounded-lg px-4 py-2 text-sm font-semibold shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                        />
                      </svg>
                      Open route in Google Maps
                    </a>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500 italic">Route information will appear here...</p>
              )}
            </div>

            {/* Safe Areas */}
            {safeAreas.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span className="text-xl">🟢</span>
                Safe Areas
              </h3>
              <ul className="space-y-1.5">
                {safeAreas.map((area, index) => (
                  <li key={index} className="text-xs text-gray-700 flex items-start">
                    <span className="text-green-600 mr-2 mt-0.5 text-sm">✓</span>
                    <span className="flex-1 leading-relaxed">{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

            {/* Caution Areas */}
            {cautionAreas && cautionAreas.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span className="text-xl">🟡</span>
                Caution Zones
              </h3>
              <ul className="space-y-1.5">
                {cautionAreas.map((area, index) => (
                  <li key={index} className="text-xs text-gray-700 flex items-start">
                    <span className="text-yellow-600 mr-2 mt-0.5 text-sm">⚠</span>
                    <span className="flex-1 leading-relaxed">{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

            {/* Unsafe Areas */}
            {unsafeAreas.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span className="text-xl">🔴</span>
                Danger Zones
              </h3>
              <ul className="space-y-1.5">
                {unsafeAreas.map((area, index) => (
                  <li key={index} className="text-xs text-gray-700 flex items-start">
                    <span className="text-red-500 mr-2 mt-0.5 text-sm">⚠</span>
                    <span className="flex-1 leading-relaxed">{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

            {/* Recommended Actions */}
            {recommendedActions.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span className="text-lg">💡</span>
                Recommended Actions
              </h3>
              <ul className="space-y-1.5">
                {recommendedActions.map((action, index) => (
                  <li key={index} className="text-xs text-gray-700 flex items-start">
                    <span className="text-button-primary mr-2 mt-0.5">•</span>
                    <span className="flex-1 leading-relaxed">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          </div>
        )}
      </div>
    </div>
  );
}

