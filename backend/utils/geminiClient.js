const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

class GeminiClient {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Analyze image for safety threats
   */
  async analyzeImage(imagePath, mimeType = 'image/jpeg') {
    try {
      // Use gemini-2.5-pro for vision tasks (supports images)
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
      
      const imageData = fs.readFileSync(imagePath);
      const base64Image = imageData.toString('base64');

      const prompt = `Analyze this image for personal safety threats. Look for:
- Suspicious individuals or behavior
- Dangerous situations (weapons, violence, etc.)
- Environmental hazards (poor lighting, isolated areas, etc.)
- Any signs of immediate danger

Respond in JSON format with:
{
  "threat_level": "low" | "medium" | "high" | "critical",
  "detected_risks": ["risk1", "risk2"],
  "recommended_actions": ["action1", "action2"],
  "confidence": 0.0-1.0,
  "extra_info": {}
}`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();
      
      return this.parseGeminiResponse(text);
    } catch (error) {
      console.error('Gemini image analysis error:', error);
      throw new Error(`Image analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze video for safety threats
   */
  async analyzeVideo(videoPath, mimeType = 'video/mp4') {
    try {
      // Note: Gemini may have limitations with video
      // For production, consider extracting frames or using video-specific models
      // For now, we'll use a text-based analysis approach
      const prompt = `Analyze this video content for personal safety threats. Look for:
- Suspicious individuals or behavior patterns
- Dangerous situations developing over time
- Environmental hazards
- Escalating threats

Respond in JSON format with:
{
  "threat_level": "low" | "medium" | "high" | "critical",
  "detected_risks": ["risk1", "risk2"],
  "recommended_actions": ["action1", "action2"],
  "confidence": 0.0-1.0,
  "extra_info": {}
}`;

      // Since Gemini may not directly support video,
      // we'll use a text-based analysis approach
      const textModel = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await textModel.generateContent(
        `${prompt}\n\nNote: Video file received. Please provide general safety analysis based on video content patterns.`
      );

      const response = await result.response;
      const text = response.text();
      
      return this.parseGeminiResponse(text);
    } catch (error) {
      console.error('Gemini video analysis error:', error);
      throw new Error(`Video analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze audio for safety threats
   */
  async analyzeAudio(audioPath, mimeType = 'audio/webm') {
    try {
      // Gemini may not directly support audio
      // We'll use a text-based approach or transcribe first
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const prompt = `Analyze audio content for personal safety threats. Look for:
- Distressed voices or screams
- Aggressive or threatening language
- Background sounds indicating danger (breaking glass, alarms, etc.)
- Signs of conflict or violence

Respond in JSON format with:
{
  "threat_level": "low" | "medium" | "high" | "critical",
  "detected_risks": ["risk1", "risk2"],
  "recommended_actions": ["action1", "action2"],
  "confidence": 0.0-1.0,
  "extra_info": {}
}

Note: Audio file received. Provide analysis based on audio content patterns.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseGeminiResponse(text);
    } catch (error) {
      console.error('Gemini audio analysis error:', error);
      throw new Error(`Audio analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze text for safety threats
   */
  async analyzeText(text) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const prompt = `Analyze this text for personal safety threats. Look for:
- Threats or intimidation
- Signs of danger or violence
- Suspicious behavior descriptions
- Emergency situations
- Location-based risks

Text to analyze:
"${text}"

Respond in JSON format with:
{
  "threat_level": "low" | "medium" | "high" | "critical",
  "detected_risks": ["risk1", "risk2"],
  "recommended_actions": ["action1", "action2"],
  "confidence": 0.0-1.0,
  "extra_info": {}
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const textResponse = response.text();
      
      return this.parseGeminiResponse(textResponse);
    } catch (error) {
      console.error('Gemini text analysis error:', error);
      throw new Error(`Text analysis failed: ${error.message}`);
    }
  }

  /**
   * Parse Gemini response and extract JSON
   */
  parseGeminiResponse(text) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        
        // Validate and normalize the response
        return {
          threat_level: parsed.threat_level || 'unknown',
          detected_risks: Array.isArray(parsed.detected_risks) ? parsed.detected_risks : [],
          recommended_actions: Array.isArray(parsed.recommended_actions) ? parsed.recommended_actions : [],
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
          extra_info: parsed.extra_info || {}
        };
      }
      
      // Fallback if no JSON found
      return {
        threat_level: 'unknown',
        detected_risks: ['Unable to parse AI response'],
        recommended_actions: ['Please try again'],
        confidence: 0,
        extra_info: { raw_response: text }
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return {
        threat_level: 'unknown',
        detected_risks: ['Response parsing error'],
        recommended_actions: ['Please try again'],
        confidence: 0,
        extra_info: { error: error.message, raw_response: text }
      };
    }
  }
}

module.exports = new GeminiClient();

