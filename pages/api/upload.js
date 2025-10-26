// Upload API - Local Storage
const { formidable } = require('formidable');
const path = require('path');
const fs = require('fs');

async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      
      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Parse form with formidable
      const form = formidable({
        uploadDir,
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        filename: (name, ext, part, form) => {
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 10);
          return `${timestamp}_${randomString}${ext}`;
        }
      });

      const [fields, files] = await form.parse(req);
      
      const fileArray = Array.isArray(files.file) ? files.file : files.file ? [files.file] : [];
      
      if (fileArray.length === 0) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      const urls = fileArray.map(file => `/uploads/${path.basename(file.filepath)}`);
      
      res.status(200).json({
        success: true,
        url: urls[0],
        urls: urls
      });

    } else if (req.method === 'DELETE') {
      // Handle file deletion
      const { path: filePath } = req.body;
      
      if (!filePath) {
        return res.status(400).json({
          success: false,
          error: 'File path is required'
        });
      }

      const fullPath = path.join(process.cwd(), 'public', 'uploads', filePath);
      
      // Check if file exists
      if (!fs.existsSync(fullPath)) {
        return res.status(404).json({
          success: false,
          error: 'File not found'
        });
      }

      // Delete file
      try {
        fs.unlinkSync(fullPath);
        res.status(200).json({
          success: true,
          message: 'File deleted successfully'
        });
      } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to delete file'
        });
      }

    } else {
      res.setHeader('Allow', ['POST', 'DELETE']);
      res.status(405).json({
        success: false,
        error: `Method ${req.method} Not Allowed`
      });
    }

  } catch (error) {
    console.error('Upload API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = handler;
module.exports.config = {
  api: {
    bodyParser: false,
  },
};
