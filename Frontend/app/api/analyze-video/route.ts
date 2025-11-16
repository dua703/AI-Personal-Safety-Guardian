import { NextRequest, NextResponse } from 'next/server';

interface AnalyzeVideoResponse {
  threat_level: 'low' | 'medium' | 'high' | 'critical';
  hazards_seen: string[];
  people_detected: string[];
  movement_patterns: string[];
  summary: string;
  actions: string[];
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('video') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload MP4, MOV, AVI, or WEBM' },
        { status: 400 }
      );
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      );
    }

    // Validate video duration (5-10 seconds recommended)
    // Note: Actual duration check would require video processing library

    // Convert video to base64 for Gemini API
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Video = buffer.toString('base64');
    const mimeType = file.type;

    // Simulate API delay (video analysis takes longer)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // TODO: Integrate with Google Gemini AI Video API
    // Example code structure:
    /*
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: 'Analyze this video frame-by-frame for safety threats. Look for: following behavior, suspicious motion, running, approaching unknown individuals, dark/isolated areas.' },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Video
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
    let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'high';
    let baseActions: string[] = [];
    let summary = '';

    // Mock threat assessment (in production, use Gemini AI)
    const randomThreat = Math.random();
    if (randomThreat > 0.8) {
      threatLevel = 'critical';
      summary = 'CRITICAL THREAT DETECTED: Immediate danger identified in the video. Aggressive behavior or weapons may be present. Take immediate protective action.';
      baseActions = [
        'Stay alert and maintain awareness of all surroundings',
        'Keep phone accessible for emergency calls',
        'Avoid isolated paths and shortcuts'
      ];
    } else if (randomThreat > 0.5) {
      threatLevel = 'high';
      summary = 'HIGH THREAT DETECTED: The video shows concerning behavior patterns. The combination of low lighting and isolated location presents elevated safety concerns. Exercise extreme caution.';
      baseActions = [
        'Immediately move to a well-lit public area',
        'Stay alert and maintain awareness of all surroundings',
        'Call a trusted contact and share your location',
        'If feeling threatened, call emergency services',
        'Avoid isolated paths and shortcuts'
      ];
    } else if (randomThreat > 0.2) {
      threatLevel = 'medium';
      summary = 'The video shows a person walking in a dimly lit area. While no aggressive behavior is immediately apparent, the combination of low lighting and isolated location presents elevated safety concerns.';
      baseActions = [
        'Move to a well-lit public area',
        'Stay alert and aware of surroundings',
        'Keep phone accessible for emergency calls',
        'Consider sharing your location with a trusted contact',
        'Avoid isolated paths and shortcuts'
      ];
    } else {
      threatLevel = 'low';
      summary = 'The video appears relatively safe. Continue to stay aware of your surroundings.';
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
    const mockAnalysis: AnalyzeVideoResponse = {
      threat_level: threatLevel,
      hazards_seen: [
        'Dim lighting throughout video',
        'Isolated location with limited visibility'
      ],
      people_detected: [
        'One person visible in frame',
        'Possible second person in background'
      ],
      movement_patterns: [
        'Steady walking pace',
        'Person appears to be maintaining distance'
      ],
      summary,
      actions
    };

    return NextResponse.json(mockAnalysis);
  } catch (error) {
    console.error('Video analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        threat_level: 'unknown',
        hazards_seen: [],
        people_detected: [],
        movement_patterns: [],
        summary: 'An error occurred during analysis',
        actions: ['Please try again']
      },
      { status: 500 }
    );
  }
}

