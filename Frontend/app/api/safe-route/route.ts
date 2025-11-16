import { NextRequest, NextResponse } from 'next/server';

interface SafeRouteResponse {
  route_link: string;
  route_description: string;
  unsafe_areas: string[];
  safe_areas: string[];
  caution_areas?: string[];
  recommended_actions: string[];
  threat_level: 'low' | 'medium' | 'high' | 'critical';
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid request format. Please try again.' },
        { status: 400 }
      );
    }

    const { currentLocation, destination } = body;

    // Validate current location
    if (!currentLocation || typeof currentLocation !== 'object') {
      return NextResponse.json(
        { error: 'Current location is required' },
        { status: 400 }
      );
    }

    if (typeof currentLocation.lat !== 'number' || typeof currentLocation.lng !== 'number') {
      return NextResponse.json(
        { error: 'Invalid location coordinates. Please provide valid latitude and longitude.' },
        { status: 400 }
      );
    }

    // Validate coordinate ranges
    if (currentLocation.lat < -90 || currentLocation.lat > 90 || 
        currentLocation.lng < -180 || currentLocation.lng > 180) {
      return NextResponse.json(
        { error: 'Location coordinates are out of valid range.' },
        { status: 400 }
      );
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // TODO: Integrate with Google Gemini AI for route analysis
    // Example code structure:
    /*
    const prompt = `Analyze the safest route from current location (${currentLocation.lat}, ${currentLocation.lng})${destination ? ` to ${destination}` : ' to nearest safe location'}.
    Consider: well-lit areas, populated streets, public places, police stations.
    Avoid: dark alleys, isolated areas, poorly lit paths.
    Provide route description, unsafe areas to avoid, safe areas to use, and recommended actions.`;
    
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });
    */

    // Mock AI route analysis response
    // In production, replace this with actual Gemini API response parsing
    const lat = currentLocation.lat;
    const lng = currentLocation.lng;

    // Simulate location analysis based on coordinates
    // In production, this would use actual map data, street view, lighting data, crime statistics, etc.
    // For mock purposes, we'll use coordinate patterns to simulate different location types
    
    // Create a deterministic but varied pattern based on coordinates
    const locationHash = Math.abs(Math.sin(lat * 100) + Math.cos(lng * 100)) * 1000;
    const locationType = Math.floor(locationHash % 5); // 0-4 for different scenarios
    
    let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let unsafeAreas: string[] = [];
    let safeAreas: string[] = [];
    let cautionAreas: string[] = [];
    let routeDescription = '';

    // Scenario 0: Inside house / safe indoor area → threat_level: low
    if (locationType === 0) {
      threatLevel = 'low';
      routeDescription = `You appear to be in a safe indoor location. If you need to go outside, head to the nearest well-lit public area. Recommended route: Exit to Main Street (well-lit, active businesses). Continue straight for 2 blocks to reach Central Plaza (public area with good lighting and people). Estimated walking time: 5-7 minutes.`;
      unsafeAreas = [];
      cautionAreas = [];
      safeAreas = [
        'Current indoor location (safe, secure)',
        'Main Street (well-lit commercial area with active businesses)',
        'Central Plaza (public space, well-lit, populated)',
        'Nearby shopping center (well-lit, security presence)'
      ];
    }
    // Scenario 1: Well-lit public areas → threat_level: low
    else if (locationType === 1) {
      threatLevel = 'low';
      routeDescription = `You're in a well-lit public area. Continue on your current path or head to the nearest police station or public building for maximum safety. Recommended route: Continue north on Main Street (well-lit, active businesses). Turn right onto Park Avenue (residential with streetlights). This route passes through Central Plaza (public area with good lighting) and avoids isolated areas. Estimated walking time: 8-10 minutes.`;
      unsafeAreas = [];
      cautionAreas = [];
      safeAreas = [
        'Main Street (well-lit commercial area with active businesses)',
        'Central Plaza (public space, well-lit, populated)',
        'Park Avenue (residential with streetlights)',
        'Police Station area (safe zone, 0.3 miles away)'
      ];
    }
    // Scenario 2: Dimly lit streets / isolated alleys → threat_level: medium
    else if (locationType === 2) {
      threatLevel = 'medium';
      routeDescription = `CAUTION: Your current location has dim lighting and some isolated areas nearby. Recommended route: Head immediately east on Oak Street (moderate lighting, some foot traffic), then turn left onto Market Boulevard (well-lit commercial area). Continue to the well-lit shopping district. Avoid shortcuts through alleys. Estimated walking time: 12-15 minutes.`;
      unsafeAreas = [
        'Alley between 2nd and 3rd Street (poor lighting, isolated)',
        'Dark side street behind residential area (minimal visibility)'
      ];
      cautionAreas = [
        'Parking lot behind shopping center (low visibility, use caution)',
        'Residential side street (moderate lighting, limited foot traffic)',
        'Path through park after dark (proceed with awareness)'
      ];
      safeAreas = [
        'Oak Street (moderate lighting, some foot traffic)',
        'Market Boulevard (commercial area with businesses, well-lit)',
        'Shopping district (well-lit, populated, security cameras)',
        'Main Street intersection (well-lit, high visibility)'
      ];
    }
    // Scenario 3: Dark isolated areas / near suspicious behavior → threat_level: high
    else if (locationType === 3) {
      threatLevel = 'high';
      routeDescription = `URGENT CAUTION: Your current location is in a dark, isolated area with potential safety concerns. Immediate action recommended: Head immediately west on Elm Street (well-lit commercial area), then turn right onto Broadway (main thoroughfare with high foot traffic). Continue to the police station area or Central Park (public, well-lit). Do NOT take shortcuts. Estimated walking time: 15-18 minutes to nearest safe location.`;
      unsafeAreas = [
        'Alley behind Cafe 23 (dark, isolated, minimal surveillance)',
        'Residential shortcut path (minimal foot traffic, poor lighting)',
        'Abandoned parking lot (no lighting, isolated)',
        'Underpass area (poor visibility, isolated)'
      ];
      cautionAreas = [
        'Parking lot behind shopping center (low visibility after dark, use extra caution)',
        'Side street between Elm and Broadway (moderate lighting, proceed with awareness)',
        'Industrial area side roads (limited foot traffic, proceed carefully)'
      ];
      safeAreas = [
        'Elm Street (well-lit commercial area with active businesses)',
        'Broadway (main thoroughfare with high foot traffic, well-lit)',
        'Police Station area (safe zone, 0.6 miles away)',
        'Central Park (public space, well-lit, security presence)',
        '24-hour convenience store (well-lit, public, security cameras)'
      ];
    }
    // Scenario 4: Worst-case / emergency areas → threat_level: critical
    else {
      threatLevel = 'critical';
      routeDescription = `CRITICAL: Your current location presents significant safety risks. This is an emergency situation. Immediate action required: Head immediately north on Main Street (well-lit, active businesses). Continue directly to the police station or nearest public building. Do NOT take shortcuts through alleys or isolated paths. Call emergency services if you feel threatened. Estimated walking time: 10-12 minutes to nearest safe location.`;
      unsafeAreas = [
        'Multiple dark alleys in surrounding area (no lighting, isolated)',
        'Isolated parking lots (no surveillance, poor lighting)',
        'Residential paths with no lighting (completely dark)',
        'Abandoned building area (no security, isolated)',
        'Industrial wasteland (isolated, no foot traffic)'
      ];
      cautionAreas = [
        'Side streets with limited lighting (proceed with extreme caution)',
        'Areas with minimal surveillance (stay alert, move quickly)',
        'Underpasses and bridges (poor visibility, isolated)'
      ];
      safeAreas = [
        'Main Street (well-lit commercial district with active businesses)',
        'Police Station (safe zone, 0.5 miles away - highest priority)',
        'Public Library (well-lit, open 24/7, security presence)',
        'Central Plaza (public space, high foot traffic, well-lit)',
        'Hospital emergency entrance (safe zone, 24/7 security)'
      ];
    }

    // Recommended actions consistent with threat level
    const recommendedActions = threatLevel === 'critical'
      ? [
          'Call emergency services immediately if you feel threatened',
          'Hide immediately behind a safe object if in danger',
          'Do NOT engage with any threats or suspicious individuals',
          'Move into a public, well-lit location immediately',
          'Head directly to the nearest police station or public building',
          'Share your location with a trusted contact right away',
          'Keep phone accessible and ready for emergency calls',
          'Stay alert and maintain constant awareness of surroundings',
          'Avoid all shortcuts through alleys or isolated areas',
          'If possible, wait in a well-lit area until help arrives'
        ]
      : threatLevel === 'high'
      ? [
          'Move into a public, well-lit location immediately',
          'Stay alert and maintain awareness of all surroundings',
          'Call a trusted contact and share your location',
          'Keep phone accessible for emergency calls',
          'Avoid shortcuts through dark or isolated areas',
          'Head to nearest police station or well-lit public building',
          'Do NOT engage with any suspicious individuals',
          'Walk confidently and maintain steady pace',
          'If feeling threatened, call emergency services'
        ]
      : threatLevel === 'medium'
      ? [
          'Stay alert and aware of your surroundings',
          'Keep phone accessible for emergency calls',
          'Avoid shortcuts through dark or isolated areas',
          'Stick to well-lit main streets when possible',
          'Consider sharing your location with a trusted contact',
          'Walk confidently and maintain steady pace',
          'Trust your instincts if something feels wrong',
          'If you notice anything suspicious, change direction immediately'
        ]
      : [
          'Stay aware of your surroundings',
          'Keep phone accessible for emergency calls',
          'Trust your instincts if something feels wrong',
          'Consider sharing your location with a trusted contact',
          'Continue on well-lit paths when possible'
        ];

    // Generate Google Maps route link
    // In production, this would use actual destination coordinates from Gemini AI analysis
    // For now, we'll create a route to a nearby safe location (police station or public area)
    // The destination is calculated as a point ~0.5-1km away in a safe direction
    // Different directions based on threat level to simulate realistic routing
    const destinationLat = lat + (locationType === 0 ? 0.005 : locationType === 1 ? 0.008 : locationType === 2 ? -0.006 : locationType === 3 ? 0.007 : 0.009);
    const destinationLng = lng + (locationType === 0 ? 0.003 : locationType === 1 ? -0.004 : locationType === 2 ? 0.005 : locationType === 3 ? -0.003 : 0.006);
    const routeLink = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${destinationLat},${destinationLng}&travelmode=walking`;

    const mockAnalysis: SafeRouteResponse = {
      route_link: routeLink,
      route_description: routeDescription,
      unsafe_areas: unsafeAreas,
      safe_areas: safeAreas,
      caution_areas: cautionAreas.length > 0 ? cautionAreas : undefined,
      recommended_actions: recommendedActions,
      threat_level: threatLevel
    };

    return NextResponse.json(mockAnalysis);
  } catch (error) {
    console.error('Route analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        route_link: '',
        route_description: 'Unable to analyze route at this time',
        unsafe_areas: [],
        safe_areas: [],
        caution_areas: [],
        recommended_actions: ['Please try again'],
        threat_level: 'unknown'
      },
      { status: 500 }
    );
  }
}
