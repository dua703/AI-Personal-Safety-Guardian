'use client';

import { ThreatAnalysisResponse } from '@/lib/api';

interface ThreatResultProps {
  result: ThreatAnalysisResponse;
}

export default function ThreatResult({ result }: ThreatResultProps) {
  const getThreatColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'bg-threat-low text-white';
      case 'medium':
        return 'bg-threat-medium text-white';
      case 'high':
        return 'bg-threat-high text-white';
      case 'critical':
        return 'bg-threat-critical text-white';
      default:
        return 'bg-threat-unknown text-white';
    }
  };

  const getThreatLabel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  const confidencePercentage = Math.round(result.confidence * 100);

  return (
    <div className="space-y-6">
      {/* Threat Level Badge */}
      <div className="flex items-center justify-center">
        <div
          className={`${getThreatColor(result.threat_level)} px-8 py-4 rounded-2xl text-xl font-bold shadow-md`}
        >
          Threat Level: {getThreatLabel(result.threat_level)}
        </div>
      </div>

      {/* Confidence Score */}
      <div className="bg-pink-50 border border-pink-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700">Confidence Score</span>
          <span className="text-sm font-bold text-gray-800">{confidencePercentage}%</span>
        </div>
        <div className="w-full bg-pink-200 rounded-full h-3">
          <div
            className="bg-baby-pink h-3 rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${confidencePercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Detected Risks */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <svg
            className="w-6 h-6 text-red-500 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          Detected Risks
        </h2>
        {result.detected_risks && result.detected_risks.length > 0 ? (
          <ul className="space-y-2.5">
            {result.detected_risks.map((risk, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-500 mr-3 font-bold">•</span>
                <span className="text-gray-700">{risk}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No specific risks detected.</p>
        )}
      </div>

      {/* Recommended Actions */}
      <div className="bg-pink-50 border border-pink-200 rounded-2xl p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <svg
            className="w-6 h-6 text-baby-pink mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Recommended Actions
        </h2>
        {result.recommended_actions && result.recommended_actions.length > 0 ? (
          <ul className="space-y-2.5">
            {result.recommended_actions.map((action, index) => (
              <li key={index} className="flex items-start">
                <span className="text-baby-pink mr-3 font-bold">✓</span>
                <span className="text-gray-700">{action}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No specific actions recommended.</p>
        )}
      </div>

      {/* Extra Info */}
      {result.extra_info && Object.keys(result.extra_info).length > 0 && (
        <div className="bg-pink-50 border border-pink-200 rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Additional Information</h2>
          <div className="space-y-2">
            {Object.entries(result.extra_info).map(([key, value]) => (
              <div key={key} className="flex">
                <span className="font-semibold text-gray-700 mr-2">{key}:</span>
                <span className="text-gray-600">
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
