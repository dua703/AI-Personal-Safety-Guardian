import { NextRequest, NextResponse } from 'next/server';

interface AnalyzeImageResponse {
  threat_level: 'low' | 'medium' | 'high' | 'critical';
  detected_objects: string[];
  explanation: string;
  recommended_actions: string[];
  confidence_score: number;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const textNote = formData.get('textNote') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPG, PNG, GIF, or WEBP' },
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

    // Convert image to base64 for Gemini API
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    const mimeType = file.type;

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // TODO: Integrate with Google Gemini AI Vision API
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
            { text: `Analyze this image for safety threats. ${textNote || ''} Look for: possible threats, suspicious people or actions, weapons, poor lighting, isolated areas.` },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image
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
    let explanation = '';

    // Mock threat assessment (in production, use Gemini AI)
    // For demo purposes, randomly assign threat levels
    const randomThreat = Math.random();
    if (randomThreat > 0.8) {
      threatLevel = 'critical';
      explanation = 'CRITICAL THREAT DETECTED: Immediate danger identified in the image. Take immediate protective action.';
      baseActions = [
        'Move to a well-lit public area immediately',
        'Stay alert and maintain awareness of all surroundings',
        'Keep phone accessible for emergency calls'
      ];
    } else if (randomThreat > 0.6) {
      threatLevel = 'high';
      explanation = 'HIGH THREAT DETECTED: Significant safety concerns identified. Exercise extreme caution.';
      baseActions = [
        'Immediately move to a well-lit public area',
        'Stay alert and maintain awareness of all surroundings',
        'Call a trusted contact and share your location',
        'If feeling threatened, call emergency services'
      ];
    } else if (randomThreat > 0.3) {
      threatLevel = 'medium';
      explanation = 'The image shows a person in a dimly lit area. While no immediate threats are visible, the combination of low lighting and isolated location increases safety risk.';
      baseActions = [
        'Move to a well-lit public area',
        'Stay alert and aware of surroundings',
        'Keep phone accessible for emergency calls',
        'Consider sharing your location with a trusted contact'
      ];
    } else {
      threatLevel = 'low';
      explanation = 'The image appears relatively safe. Continue to stay aware of your surroundings.';
      baseActions = [
        'Stay aware of your surroundings',
        'Keep phone accessible for emergency calls',
        'Trust your instincts if something feels wrong'
      ];
    }

    // Add critical/high threat actions at the beginning if needed
    const recommendedActions = (threatLevel === 'critical' || threatLevel === 'high')
      ? [...getCriticalThreatActions(), ...baseActions]
      : baseActions;

    // Mock AI analysis response
    // In production, replace this with actual Gemini API response parsing
    const mockAnalysis: AnalyzeImageResponse = {
      threat_level: threatLevel,
      detected_objects: [
        'Person in frame',
        'Low lighting detected',
        'Isolated area'
      ],
      explanation,
      recommended_actions: recommendedActions,
      confidence_score: 0.75
    };

    return NextResponse.json(mockAnalysis);
  } catch (error) {
    console.error('Image analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        threat_level: 'unknown',
        detected_objects: [],
        explanation: 'An error occurred during analysis',
        recommended_actions: ['Please try again'],
        confidence_score: 0
      },
      { status: 500 }
    );
  }
}

