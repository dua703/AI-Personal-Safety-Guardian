'use client';

import { useEffect } from 'react';

interface AnalysisToastProps {
  threatLevel: 'low' | 'medium' | 'high' | 'critical' | 'unknown';
  detectedRisks?: string[];
  recommendedActions?: string[];
  confidenceScore?: number;
  hazardsSeen?: string[];
  peopleDetected?: string[];
  movementPatterns?: string[];
  summary?: string;
  soundEvents?: string[];
  riskReasoning?: string;
  emotionalCues?: string[];
  dangerProbability?: number;
  suggestions?: string[];
  urgentHelpNeeded?: boolean;
  onClose: () => void;
}

export default function AnalysisToast({
  threatLevel,
  detectedRisks,
  recommendedActions,
  confidenceScore,
  hazardsSeen,
  peopleDetected,
  movementPatterns,
  summary,
  soundEvents,
  riskReasoning,
  suggestions,
  emotionalCues,
  dangerProbability,
  urgentHelpNeeded,
  onClose,
}: AnalysisToastProps) {
  // Modal stays open until user manually closes it

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

      {/* Modal Content */}
      <div
        className="relative bg-white rounded-xl shadow-lg border border-pink-200 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
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

        {/* Threat Level Header */}
        <div className="flex items-center gap-3 mb-6 pr-8">
          <span className="text-4xl">{getThreatEmoji()}</span>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Analysis Results</h2>
            <p className={`text-lg font-semibold ${getThreatColor()} mt-1`}>
              Threat Level: {threatLevel.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Urgent Help Flag */}
        {urgentHelpNeeded && (
          <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-lg p-4">
            <p className="text-red-700 font-bold text-base flex items-center gap-2">
              <span className="text-xl">🚨</span>
              URGENT HELP NEEDED
            </p>
          </div>
        )}

        {/* Confidence Score */}
        {confidenceScore !== undefined && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Confidence Score</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Analysis Confidence</span>
              <span className="text-sm font-bold text-gray-800">
                {Math.round(confidenceScore * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-button-primary h-3 rounded-full transition-all duration-300"
                style={{ width: `${confidenceScore * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Danger Probability (for text analysis) */}
        {dangerProbability !== undefined && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Danger Assessment</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Danger Probability</span>
              <span className="text-sm font-bold text-gray-800">
                {Math.round(dangerProbability * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-red-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${dangerProbability * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Detected Objects / Risks (for image) */}
        {(detectedRisks && detectedRisks.length > 0) && (
          <div className="mb-6">
            <h3 className="text-base font-bold text-gray-800 mb-3">Detected Risks</h3>
            <ul className="space-y-2">
              {detectedRisks.map((risk, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="text-red-500 mr-3 mt-1">•</span>
                  <span className="flex-1">{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Hazards Seen (for video) */}
        {(hazardsSeen && hazardsSeen.length > 0) && (
          <div className="mb-6">
            <h3 className="text-base font-bold text-gray-800 mb-3">Hazards Detected</h3>
            <ul className="space-y-2">
              {hazardsSeen.map((hazard, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="text-orange-500 mr-3 mt-1">•</span>
                  <span className="flex-1">{hazard}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* People Detected (for video) */}
        {(peopleDetected && peopleDetected.length > 0) && (
          <div className="mb-6">
            <h3 className="text-base font-bold text-gray-800 mb-3">People Detected</h3>
            <ul className="space-y-2">
              {peopleDetected.map((person, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="text-blue-500 mr-3 mt-1">•</span>
                  <span className="flex-1">{person}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Movement Patterns (for video) */}
        {(movementPatterns && movementPatterns.length > 0) && (
          <div className="mb-6">
            <h3 className="text-base font-bold text-gray-800 mb-3">Movement Patterns</h3>
            <ul className="space-y-2">
              {movementPatterns.map((pattern, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="text-purple-500 mr-3 mt-1">•</span>
                  <span className="flex-1">{pattern}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sound Events (for audio) */}
        {(soundEvents && soundEvents.length > 0) && (
          <div className="mb-6">
            <h3 className="text-base font-bold text-gray-800 mb-3">Sound Events</h3>
            <ul className="space-y-2">
              {soundEvents.map((event, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="text-pink-500 mr-3 mt-1">•</span>
                  <span className="flex-1">{event}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Emotional Cues (for text) */}
        {(emotionalCues && emotionalCues.length > 0) && (
          <div className="mb-6">
            <h3 className="text-base font-bold text-gray-800 mb-3">Emotional Cues</h3>
            <ul className="space-y-2">
              {emotionalCues.map((cue, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="text-purple-500 mr-3 mt-1">•</span>
                  <span className="flex-1">{cue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Explanation / Summary / Risk Reasoning */}
        {(summary || riskReasoning) && (
          <div className="mb-6">
            <h3 className="text-base font-bold text-gray-800 mb-3">Explanation</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {summary || riskReasoning}
            </p>
          </div>
        )}

        {/* Recommended Actions */}
        {((recommendedActions && recommendedActions.length > 0) || 
          (suggestions && suggestions.length > 0)) && (
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-800 mb-3">Recommended Actions</h3>
            <ul className="space-y-2">
              {(recommendedActions || suggestions || []).map((action, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="text-green-600 mr-3 mt-1">✓</span>
                  <span className="flex-1">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
