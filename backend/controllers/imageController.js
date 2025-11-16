const multer = require('multer');
const path = require('path');
const fs = require('fs');
const geminiClient = require('../utils/geminiClient');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

const analyzeImage = async (req, res) => {
  try {
    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          threat_level: 'unknown',
          detected_risks: ['File upload error'],
          recommended_actions: ['Please upload a valid image file'],
          confidence: 0,
          extra_info: { error: err.message }
        });
      }

      if (!req.file) {
        return res.status(400).json({
          threat_level: 'unknown',
          detected_risks: ['No file uploaded'],
          recommended_actions: ['Please upload an image file'],
          confidence: 0,
          extra_info: {}
        });
      }

      try {
        const result = await geminiClient.analyzeImage(
          req.file.path,
          req.file.mimetype
        );

        // Clean up uploaded file
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting file:', unlinkErr);
        });

        res.json(result);
      } catch (analysisError) {
        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlink(req.file.path, (unlinkErr) => {
            if (unlinkErr) console.error('Error deleting file:', unlinkErr);
          });
        }

        throw analysisError;
      }
    });
  } catch (error) {
    console.error('Image analysis error:', error);
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
  analyzeImage
};

