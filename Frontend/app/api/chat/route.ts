import { NextRequest, NextResponse } from 'next/server';

interface ChatResponse {
  response: string;
  threat_level?: 'low' | 'medium' | 'high' | 'critical';
  detected_risks?: string[];
  recommended_actions?: string[];
  explanation?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const lowerMessage = message.toLowerCase();

    // Safety-related keywords (same as analyze-text)
    const safetyKeywords = [
      'follow',
      'following',
      'stalking',
      'someone is behind me',
      'someone behind me',
      'being followed',
      'threat',
      'danger',
      'unsafe',
      'scared',
      'afraid',
      'dark',
      'worried',
      'anxious',
      'unsafe',
      'threatened'
    ];

    const emotionalKeywords = [
      'scared',
      'afraid',
      'fear',
      'panic',
      'worried',
      'anxious',
      'nervous',
      'terrified',
      'helpless',
      'trapped'
    ];

    const urgentKeywords = [
      'emergency',
      'help',
      'danger',
      'threat',
      'unsafe',
      'call police',
      'need help',
      'immediate',
      'urgent'
    ];

    const hasSafetyKeyword = safetyKeywords.some((keyword) =>
      lowerMessage.includes(keyword)
    );
    const hasEmotionalKeyword = emotionalKeywords.some((keyword) =>
      lowerMessage.includes(keyword)
    );
    const hasUrgentKeyword = urgentKeywords.some((keyword) =>
      lowerMessage.includes(keyword)
    );

    // Calculate danger probability (0-1)
    let dangerProbability = 0.2; // Base level
    if (hasSafetyKeyword) dangerProbability += 0.3;
    if (hasEmotionalKeyword) dangerProbability += 0.2;
    if (hasUrgentKeyword) dangerProbability += 0.3;
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

    // Build detected risks
    const detectedRisks: string[] = [];
    if (hasSafetyKeyword) {
      detectedRisks.push('Safety threat mentioned');
      if (lowerMessage.includes('follow') || lowerMessage.includes('stalking')) {
        detectedRisks.push('Potential stalking or following behavior');
      }
      if (lowerMessage.includes('dark')) {
        detectedRisks.push('Dark or poorly lit area mentioned');
      }
    }
    if (hasEmotionalKeyword) {
      detectedRisks.push('Elevated stress or fear indicators');
    }
    if (hasUrgentKeyword) {
      detectedRisks.push('Urgent help request detected');
    }

    // Get threat emoji
    const getThreatEmoji = () => {
      switch (threatLevel) {
        case 'critical': return '🔴';
        case 'high': return '🟠';
        case 'medium': return '🟡';
        case 'low': return '🟢';
        default: return '⚪';
      }
    };

    // Base actions based on threat level (for modal)
    let baseActions: string[] = [];
    let explanation = '';
    let responseText = '';

    // Conversational, brief, empathetic responses for chatbox
    if (threatLevel === 'critical') {
      explanation = 'CRITICAL THREAT DETECTED: Your message indicates immediate danger. Take immediate protective action.';
      baseActions = [
        'Stay alert and maintain awareness of all surroundings',
        'Keep phone accessible for emergency calls',
        'If feeling threatened, call emergency services immediately'
      ];
      responseText = `${getThreatEmoji()} I'm really concerned about your safety right now. This sounds like an immediate danger. Please hide behind something safe, move to a well-lit public area, and call emergency services if possible. Don't engage with any threat.`;
    } else if (threatLevel === 'high') {
      explanation = 'HIGH THREAT DETECTED: Your message indicates significant safety concerns. Exercise extreme caution.';
      baseActions = [
        'Immediately move to a well-lit public area',
        'Stay alert and maintain awareness of all surroundings',
        'Call a trusted contact and share your location',
        'If feeling threatened, call emergency services'
      ];
      responseText = `${getThreatEmoji()} That sounds dangerous! Please move to a well-lit area immediately, call someone you trust, and stay aware of your surroundings. If you feel threatened, don't hesitate to call emergency services.`;
    } else if (threatLevel === 'medium') {
      explanation = 'Your message suggests some safety concerns. Stay alert and take precautions.';
      baseActions = [
        'Move to a well-lit public area',
        'Stay alert and aware of your surroundings',
        'Keep phone accessible for emergency calls',
        'Consider sharing your location with a trusted contact'
      ];
      responseText = `${getThreatEmoji()} I understand your concern. Please stay alert and consider moving to a safer, well-lit location. Keep your phone handy and trust your instincts.`;
    } else {
      explanation = 'Your message appears relatively safe. Continue to stay aware of your surroundings.';
      baseActions = [
        'Stay aware of your surroundings',
        'Keep phone accessible for emergency calls',
        'Trust your instincts if something feels wrong'
      ];
      responseText = `${getThreatEmoji()} I'm here to help keep you safe. Stay aware of your surroundings, and if you have any concerns, you can upload a photo, video, or text for detailed analysis.`;
    }

    // Add critical/high threat actions at the beginning if needed
    const recommendedActions = (threatLevel === 'critical' || threatLevel === 'high')
      ? [...getCriticalThreatActions(), ...baseActions]
      : baseActions;

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const chatResponse: ChatResponse = {
      response: responseText,
      threat_level: threatLevel,
      detected_risks: detectedRisks.length > 0 ? detectedRisks : undefined,
      recommended_actions: recommendedActions,
      explanation
    };

    return NextResponse.json(chatResponse);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        response: 'Sorry, I encountered an error. Please try again.'
      },
      { status: 500 }
    );
  }
}
