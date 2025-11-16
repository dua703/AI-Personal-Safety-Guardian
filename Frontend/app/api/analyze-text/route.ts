import { NextRequest, NextResponse } from 'next/server';

interface AnalyzeTextResponse {
  emotional_cues: string[];
  danger_probability: number;
  suggestions: string[];
  recommended_actions?: string[];
  urgent_help_needed: boolean;
  threat_level?: 'low' | 'medium' | 'high' | 'critical';
  detected_risks?: string[];
  explanation?: string;
  confidence_score?: number;
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { reply: 'Invalid request format. Please try again.' },
        { status: 400 }
      );
    }

    const inputText = body.inputText || body.text; // Support both for backward compatibility

    // Validate input
    if (!inputText || typeof inputText !== 'string' || inputText.trim().length === 0) {
      return NextResponse.json(
        { reply: 'Please enter text for analysis.' },
        { status: 400 }
      );
    }

    // Handle text length limit (safely handle Unicode characters)
    const textLength = Array.from(inputText).length; // Properly count Unicode characters
    if (textLength > 10000) {
      return NextResponse.json(
        { reply: 'Text must be under 10,000 characters.' },
        { status: 400 }
      );
    }

    // Safely process text (handle special characters, emojis, quotes, etc.)
    const text = inputText.trim();

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // TODO: Integrate with Google Gemini AI Text API
    // Example code structure:
    /*
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analyze this text for safety concerns and emotional cues. Provide: emotional indicators, danger probability (0-1), safety suggestions, and whether urgent help is needed. Text: ${text}`
          }]
        }]
      })
    });
    */

    // Analyze text for safety keywords and emotional cues
    // Safely convert to lowercase (handles Unicode, special characters properly)
    const lowerText = text.toLowerCase();
    const safetyKeywords = [
      'follow', 'following', 'stalking', 'threat', 'danger', 'unsafe',
      'scared', 'afraid', 'help', 'emergency', 'dangerous', 'fear',
      'worried', 'anxious', 'unsafe', 'threatened'
    ];

    const emotionalKeywords = [
      'scared', 'afraid', 'fear', 'panic', 'worried', 'anxious',
      'nervous', 'terrified', 'helpless', 'trapped'
    ];

    const urgentKeywords = [
      'emergency', 'help', 'danger', 'threat', 'unsafe', 'call police',
      'need help', 'immediate', 'urgent'
    ];

    const hasSafetyKeyword = safetyKeywords.some((keyword) =>
      lowerText.includes(keyword)
    );
    const hasEmotionalKeyword = emotionalKeywords.some((keyword) =>
      lowerText.includes(keyword)
    );
    const hasUrgentKeyword = urgentKeywords.some((keyword) =>
      lowerText.includes(keyword)
    );

    // Calculate danger probability (0-1)
    let dangerProbability = 0.3; // Base level
    if (hasSafetyKeyword) dangerProbability += 0.3;
    if (hasEmotionalKeyword) dangerProbability += 0.2;
    if (hasUrgentKeyword) dangerProbability += 0.2;
    dangerProbability = Math.min(dangerProbability, 1.0);

    // Determine threat level from danger probability
    let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (dangerProbability >= 0.8) threatLevel = 'critical';
    else if (dangerProbability >= 0.6) threatLevel = 'high';
    else if (dangerProbability >= 0.4) threatLevel = 'medium';

    // Helper function to get critical/high threat actions
    const getCriticalThreatActions = () => [
      'Hide immediately behind a safe object.',
      'Do NOT engage with the threat.',
      'Move into a public, well-lit location.',
      'Call emergency services if possible.',
      'Share your location with a trusted contact.'
    ];

    // Build detected risks (formal, structured)
    const detectedRisks: string[] = [];
    if (hasSafetyKeyword) {
      detectedRisks.push('Safety threat indicators detected in text');
      if (lowerMessage.includes('follow') || lowerMessage.includes('stalking')) {
        detectedRisks.push('Potential stalking or following behavior mentioned');
      }
      if (lowerMessage.includes('dark')) {
        detectedRisks.push('Dark or poorly lit environment referenced');
      }
      if (lowerMessage.includes('someone behind me') || lowerMessage.includes('someone is behind me')) {
        detectedRisks.push('Direct threat perception indicated');
      }
    }
    if (hasEmotionalKeyword) {
      detectedRisks.push('Elevated stress or fear indicators present');
    }
    if (hasUrgentKeyword) {
      detectedRisks.push('Urgent help request identified');
    }

    // Formal explanation based on threat level
    let explanation = '';
    if (threatLevel === 'critical') {
      explanation = 'CRITICAL THREAT ASSESSMENT: Analysis of the provided text indicates immediate danger. Multiple threat indicators are present, including safety concerns, emotional distress, and potential urgent need for assistance. Immediate protective action is strongly recommended.';
    } else if (threatLevel === 'high') {
      explanation = 'HIGH THREAT ASSESSMENT: Text analysis reveals significant safety concerns. The combination of threat indicators, emotional cues, and situational factors suggests elevated risk. Exercise extreme caution and take proactive safety measures.';
    } else if (threatLevel === 'medium') {
      explanation = 'MEDIUM THREAT ASSESSMENT: The text analysis indicates moderate safety concerns. Some threat indicators are present, warranting increased awareness and precautionary measures.';
    } else {
      explanation = 'LOW THREAT ASSESSMENT: Text analysis shows minimal immediate safety concerns. However, continued situational awareness is recommended.';
    }

    // Base suggestions based on threat level (formal, structured)
    let baseSuggestions: string[] = [];
    if (hasSafetyKeyword || threatLevel === 'high' || threatLevel === 'critical') {
      baseSuggestions = [
        'Relocate to a safe, public location immediately',
        'Contact a trusted individual and share current location',
        'Maintain heightened awareness of surroundings',
        'If threat is immediate, contact emergency services',
        'Avoid isolated areas and seek well-lit public spaces'
      ];
    } else {
      baseSuggestions = [
        'Maintain situational awareness',
        'Keep communication device accessible',
        'Trust personal instincts if situation feels unsafe',
        'Consider sharing location with trusted contact'
      ];
    }

    // Add critical/high threat actions at the beginning if needed
    const suggestions = (threatLevel === 'critical' || threatLevel === 'high')
      ? [...getCriticalThreatActions(), ...baseSuggestions]
      : baseSuggestions;

    // Calculate confidence score based on keyword matches
    let confidenceScore = 0.6; // Base confidence
    if (hasSafetyKeyword) confidenceScore += 0.15;
    if (hasEmotionalKeyword) confidenceScore += 0.1;
    if (hasUrgentKeyword) confidenceScore += 0.15;
    confidenceScore = Math.min(confidenceScore, 0.95);

    // Mock AI analysis response (formal, structured, report-like)
    const mockAnalysis: AnalyzeTextResponse = {
      emotional_cues: hasEmotionalKeyword 
        ? ['Elevated stress indicators detected', 'Expressed fear or concern identified', 'Anxiety markers present']
        : ['Neutral emotional tone observed', 'No immediate distress signals detected'],
      danger_probability: dangerProbability,
      suggestions,
      recommended_actions: suggestions, // Alias for compatibility
      urgent_help_needed: hasUrgentKeyword || dangerProbability > 0.7,
      threat_level: threatLevel,
      detected_risks: detectedRisks.length > 0 ? detectedRisks : undefined,
      explanation,
      confidence_score: confidenceScore
    };

    return NextResponse.json(mockAnalysis);
  } catch (error) {
    console.error('Text analysis error:', error);
    return NextResponse.json(
      { 
        reply: 'An error occurred. Please try again.',
        threat_level: 'unknown',
        detected_risks: [],
        explanation: 'An error occurred during analysis',
        recommended_actions: ['Please try again'],
        confidence_score: 0
      },
      { status: 500 }
    );
  }
}

