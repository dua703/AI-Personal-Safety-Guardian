const geminiClient = require('../utils/geminiClient');

const analyzeText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        threat_level: 'unknown',
        detected_risks: ['No text provided'],
        recommended_actions: ['Please provide text to analyze'],
        confidence: 0,
        extra_info: {}
      });
    }

    if (text.length > 10000) {
      return res.status(400).json({
        threat_level: 'unknown',
        detected_risks: ['Text too long'],
        recommended_actions: ['Please provide text under 10,000 characters'],
        confidence: 0,
        extra_info: {}
      });
    }

    const result = await geminiClient.analyzeText(text.trim());

    res.json(result);
  } catch (error) {
    console.error('Text analysis error:', error);
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
  analyzeText
};

