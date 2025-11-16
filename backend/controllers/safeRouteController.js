const geminiClient = require('../utils/geminiClient');

const analyzeRoute = async (req, res) => {
  try {
    const { origin, destination, routeDescription } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({
        threat_level: 'unknown',
        detected_risks: ['Missing route information'],
        recommended_actions: ['Please provide origin and destination'],
        confidence: 0,
        extra_info: {}
      });
    }

    const routeText = `Route Analysis Request:
Origin: ${origin}
Destination: ${destination}
${routeDescription ? `Additional Details: ${routeDescription}` : ''}

Please analyze this route for safety considerations.`;

    const result = await geminiClient.analyzeText(routeText);

    // Enhance the result with route-specific information
    result.extra_info = {
      ...result.extra_info,
      origin,
      destination,
      analysis_type: 'route_safety'
    };

    res.json(result);
  } catch (error) {
    console.error('Route analysis error:', error);
    res.status(500).json({
      threat_level: 'unknown',
      detected_risks: ['Analysis failed'],
      recommended_actions: ['Please try again'],
      confidence: 0,
      extra_info: { error: error.message }
    });
  }
};

module.exports = {
  analyzeRoute
};

