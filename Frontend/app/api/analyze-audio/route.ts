import { NextRequest, NextResponse } from 'next/server';

interface AnalyzeAudioResponse {
  threat_level: 'low' | 'medium' | 'high' | 'critical';
  sound_events: string[];
  risk_reasoning: string;
  actions: string[];
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('audio') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/m4a'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload MP3, WAV, WEBM, OGG, or M4A' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Convert audio to base64 for Gemini API
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = buffer.toString('base64');
    const mimeType = file.type;

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // TODO: Integrate with Google Gemini AI Audio API
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
          parts: [
            { text: 'Analyze this audio for safety threats. Transcribe and analyze for: shouting, aggressive tones, footsteps, breaking objects, panic/fear in user voice.' },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Audio
              }
            }
          ]
        }]
      })
    });
    */

    // Helper function to get critical/high threat actions
    const getCriticalThreatActions = () => [
      'Hide immediately behind a safe object.',
      'Do NOT engage with the threat.',
      'Move into a public, well-lit location.',
      'Call emergency services if possible.',
      'Share your location with a trusted contact.'
    ];

    // Determine threat level (mock - in production, use Gemini AI analysis)
    let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    let baseActions: string[] = [];
    let riskReasoning = '';

    // Mock threat assessment (in production, use Gemini AI)
    const randomThreat = Math.random();
    if (randomThreat > 0.8) {
      threatLevel = 'critical';
      riskReasoning = 'CRITICAL THREAT DETECTED: Audio analysis indicates immediate danger. Aggressive sounds, shouting, or signs of violence detected. Take immediate protective action.';
      baseActions = [
        'Stay alert to your surroundings',
        'Keep phone accessible for emergency calls',
        'Avoid isolated areas and seek public spaces'
      ];
    } else if (randomThreat > 0.6) {
      threatLevel = 'high';
      riskReasoning = 'HIGH THREAT DETECTED: The audio analysis detected elevated stress indicators, aggressive tones, or concerning background sounds that suggest significant danger. Exercise extreme caution.';
      baseActions = [
        'Move to a quieter, more controlled environment if possible',
        'Stay alert to your surroundings',
        'Keep phone accessible for emergency calls',
        'If feeling unsafe, call a trusted contact or emergency services',
        'Avoid isolated areas and seek public spaces'
      ];
    } else if (randomThreat > 0.3) {
      threatLevel = 'medium';
      riskReasoning = 'The audio analysis detected elevated stress indicators and background sounds that suggest an uncertain environment. While no immediate threats are clearly audible, the combination of factors warrants caution.';
      baseActions = [
        'Move to a quieter, more controlled environment if possible',
        'Stay alert to your surroundings',
        'Keep phone accessible for emergency calls',
        'If feeling unsafe, call a trusted contact or emergency services',
        'Avoid isolated areas and seek public spaces'
      ];
    } else {
      threatLevel = 'low';
      riskReasoning = 'The audio appears relatively safe. Continue to stay aware of your surroundings.';
      baseActions = [
        'Stay aware of your surroundings',
        'Keep phone accessible for emergency calls',
        'Trust your instincts if something feels wrong'
      ];
    }

    // Add critical/high threat actions at the beginning if needed
    const actions = (threatLevel === 'critical' || threatLevel === 'high')
      ? [...getCriticalThreatActions(), ...baseActions]
      : baseActions;

    // Mock AI analysis response
    // In production, replace this with actual Gemini API response parsing
    const mockAnalysis: AnalyzeAudioResponse = {
      threat_level: threatLevel,
      sound_events: [
        'Background noise detected',
        'Possible footsteps in distance',
        'Elevated speaking tone'
      ],
      risk_reasoning: riskReasoning,
      actions
    };

    return NextResponse.json(mockAnalysis);
  } catch (error) {
    console.error('Audio analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        threat_level: 'unknown',
        sound_events: [],
        risk_reasoning: 'An error occurred during analysis',
        actions: ['Please try again']
      },
      { status: 500 }
    );
  }
}

