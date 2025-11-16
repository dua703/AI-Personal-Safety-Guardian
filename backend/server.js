const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    process.env.FRONTEND_URL || 'https://ai-personal-safety-guardian.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const analyzeImageRoute = require('./routes/analyzeImage');
const analyzeVideoRoute = require('./routes/analyzeVideo');
const analyzeAudioRoute = require('./routes/analyzeAudio');
const textAnalysisRoute = require('./routes/textAnalysis');
const safeRouteRoute = require('./routes/safeRoute');

app.use('/api/analyze-image', analyzeImageRoute);
app.use('/api/analyze-video', analyzeVideoRoute);
app.use('/api/analyze-audio', analyzeAudioRoute);
app.use('/api/text-analysis', textAnalysisRoute);
app.use('/api/safe-route', safeRouteRoute);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Personal Safety Guardian API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    threat_level: 'unknown',
    detected_risks: ['Server error occurred'],
    recommended_actions: ['Please try again later'],
    confidence: 0,
    extra_info: { error: err.message }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    threat_level: 'unknown',
    detected_risks: ['Endpoint not found'],
    recommended_actions: ['Check the API endpoint'],
    confidence: 0,
    extra_info: {}
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});

