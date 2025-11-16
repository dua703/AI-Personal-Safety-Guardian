import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { error: 'Message is empty' },
        { status: 400 }
      );
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock AI text analysis logic
    const lowerMessage = message.toLowerCase();
    let threat_level: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let explanation = 'No immediate threat detected.';

    // Check for safety-related keywords
    const safetyKeywords = [
      'follow',
      'following',
      'stalking',
      'scared',
      'afraid',
      'threat',
      'danger',
      'unsafe',
      'help',
      'emergency',
      'dangerous',
      'fear',
      'worried',
      'anxious',
      'threatened',
      'someone behind me',
      'someone is behind me'
    ];

    const hasSafetyKeyword = safetyKeywords.some((keyword) =>
      lowerMessage.includes(keyword)
    );

    // Determine threat level based on keywords
    if (hasSafetyKeyword) {
      // Check for high-threat keywords
      if (
        lowerMessage.includes('follow') ||
        lowerMessage.includes('following') ||
        lowerMessage.includes('stalking') ||
        lowerMessage.includes('scared') ||
        lowerMessage.includes('someone behind me') ||
        lowerMessage.includes('someone is behind me')
      ) {
        threat_level = 'high';
        explanation =
          'Your text indicates potential danger. Stay alert and consider going to a safe public area.';
      } else if (
        lowerMessage.includes('emergency') ||
        lowerMessage.includes('help') ||
        lowerMessage.includes('danger')
      ) {
        threat_level = 'medium';
        explanation =
          'Some safety concerns detected. Stay aware of your surroundings and keep your phone accessible.';
      } else {
        threat_level = 'medium';
        explanation =
          'Moderate safety concerns detected. Continue to stay alert and trust your instincts.';
      }
    }

    // Base recommended actions
    let recommended_actions = [
      'Stay alert',
      'Avoid isolated areas',
      'Contact a trusted person if necessary',
    ];

    // Add more specific actions for higher threat levels
    if (threat_level === 'high' || threat_level === 'critical') {
      recommended_actions = [
        'Move to a well-lit public area immediately',
        'Call emergency services if you feel threatened',
        'Share your location with a trusted contact',
        'Stay alert and maintain awareness of surroundings',
        'Do NOT engage with any potential threats',
        'Keep phone accessible for emergency calls',
      ];
    } else if (threat_level === 'medium') {
      recommended_actions = [
        'Stay alert and aware of your surroundings',
        'Keep phone accessible for emergency calls',
        'Avoid shortcuts through dark or isolated areas',
        'Consider sharing your location with a trusted contact',
        'Trust your instincts if something feels wrong',
      ];
    }

    return NextResponse.json({
      threat_level,
      explanation,
      recommended_actions,
    });
  } catch (err) {
    console.error('Text analysis API error:', err);
    return NextResponse.json(
      { error: 'Server error during text analysis' },
      { status: 500 }
    );
  }
}

