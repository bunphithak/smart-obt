// Conditional imports for file upload (only for non-Vercel environments)
const isVercel = process.env.VERCEL === '1';

let upload = null;
let fs = null;
let path = null;

if (!isVercel) {
  try {
    const multer = require('multer');
    fs = require('fs');
    path = require('path');

    // Configure multer for image uploads
    upload = multer({
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = 'public/uploads/repairs';
          if (!fs.existsSync(uploadDir)) {
            try {
              fs.mkdirSync(uploadDir, { recursive: true });
            } catch (error) {
              console.warn('Could not create uploads directory:', error.message);
            }
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, `repair-after-${uniqueSuffix}${path.extname(file.originalname)}`);
        }
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only images are allowed'));
        }
      }
    });
  } catch (error) {
    console.warn('Multer not available (Vercel environment):', error.message);
  }
}

// Enable body parsing for Vercel
export const config = {
  api: {
    bodyParser: !isVercel ? false : true, // Use bodyParser on Vercel, disable for local multer
  },
};

const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    let afterImages = [];

    // Handle file upload only in non-Vercel environment
    if (!isVercel && upload) {
      await runMiddleware(req, res, upload.array('afterImages', 10));
      // Get uploaded file paths
      afterImages = req.files ? req.files.map(file => `/uploads/repairs/${file.filename}`) : [];
    }

    const { id, status, actualCost, completedDate, notes } = req.body;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        error: 'ไม่พบ ID ของงานซ่อม' 
      });
    }

    // On Vercel, images should be sent as base64 or URLs from cloud storage
    // For now, we'll accept the repair completion without file validation
    if (isVercel) {
      console.log('Running on Vercel - file uploads should use cloud storage');
    }

    console.log('Completing repair:', {
      id,
      status,
      actualCost,
      completedDate,
      notes,
      afterImages: afterImages.length,
      isVercel
    });

    // TODO: Update database with after images
    // const result = await db.query(
    //   'UPDATE repairs SET status = ?, actual_cost = ?, completed_date = ?, notes = ?, after_images = ? WHERE id = ?',
    //   [status, actualCost, completedDate, notes, JSON.stringify(afterImages), id]
    // );

    res.status(200).json({ 
      success: true, 
      message: 'ปิดงานสำเร็จ',
      data: {
        id: parseInt(id),
        status,
        actualCost: parseFloat(actualCost),
        completedDate,
        notes,
        afterImages
      }
    });
  } catch (error) {
    console.error('Error completing repair:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

