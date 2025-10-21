// Upload API - Local Storage
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const extension = path.extname(file.originalname);
    const filename = `${timestamp}_${randomString}${extension}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Allow only images
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Middleware to handle single file upload
const uploadSingle = upload.single('file');

export default async function handler(req, res) {
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
      // Handle file upload
      uploadSingle(req, res, (err) => {
        if (err) {
          console.error('Upload error:', err);
          return res.status(400).json({
            success: false,
            error: err.message || 'Upload failed'
          });
        }

        if (!req.file) {
          return res.status(400).json({
            success: false,
            error: 'No file uploaded'
          });
        }

        // Return success response
        const fileUrl = `/uploads/${req.file.filename}`;
        
        res.status(200).json({
          success: true,
          url: fileUrl,
          path: req.file.filename,
          name: req.file.originalname,
          size: req.file.size,
          type: req.file.mimetype
        });
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

// Disable body parser for this API route
export const config = {
  api: {
    bodyParser: false,
  },
};
