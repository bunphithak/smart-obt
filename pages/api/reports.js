// Dynamic imports for file upload (only used in POST requests)
// This prevents Multer from running on Vercel serverless functions for GET requests

// We'll use conditional imports and handle file uploads differently on Vercel
const isVercel = process.env.VERCEL === '1';

// Only configure multer and filesystem for non-Vercel environments
let upload = null;
let path = null;
let fs = null;

if (!isVercel) {
  try {
    // Lazy load dependencies
    const multer = require('multer');
    path = require('path');
    fs = require('fs');

    // Configure multer for file uploads
    upload = multer({
      dest: 'public/uploads/',
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      }
    });

    // Create uploads directory if it doesn't exist
    const uploadDir = 'public/uploads';
    if (!fs.existsSync(uploadDir)) {
      try {
        fs.mkdirSync(uploadDir, { recursive: true });
      } catch (error) {
        console.warn('Could not create uploads directory:', error.message);
      }
    }
  } catch (error) {
    console.warn('Multer not available (Vercel environment):', error.message);
  }
}

export const config = {
  api: {
    bodyParser: true, // Enable body parser for GET/PUT requests
  },
};

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { id, assetId, status, ticketId } = req.query;
        
        // TODO: Implement database query
        const mockReports = [
          {
            id: 1,
            ticketId: 'TK001701',
            assetCode: 'AST-001',
            reportType: 'asset',
            problemType: 'ไฟฟ้า',
            title: 'เสาไฟถนนชำรุด',
            description: 'เสาไฟถนนสายหลักหน้าหมู่บ้านไม่สว่าง ตั้งแต่เมื่อคืนที่ผ่านมา ส่งผลให้พื้นที่มืดและไม่ปลอดภัย',
            status: 'รอดำเนินการ',
            priority: 'สูง',
            reportedBy: 'นายสมชาย ใจดี',
            reporterPhone: '081-234-5678',
            reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 ชั่วโมงที่แล้ว
            images: [],
            location: 'หน้าหมู่บ้าน ถนนสายหลัก'
          },
          {
            id: 2,
            ticketId: 'TK001702',
            assetCode: null,
            reportType: 'general',
            problemType: 'ถนน',
            title: 'ถนนเป็นหลุมใหญ่',
            description: 'ถนนคอนกรีตหน้าร้านค้าชุมชนเป็นหลุมใหญ่ ขนาดประมาณ 1x1 เมตร ลึกประมาณ 30 ซม. อันตรายต่อรถมอเตอร์ไซค์และเด็กเล็ก',
            status: 'กำลังดำเนินการ',
            priority: 'สูง',
            reportedBy: 'นางสาวมาลี สวยงาม',
            reporterPhone: '082-345-6789',
            reportedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 วันที่แล้ว
            images: [],
            location: 'ถนนคอนกรีต หน้าร้านค้าชุมชน',
            villageId: 1
          },
          {
            id: 3,
            ticketId: 'TK001703',
            assetCode: 'AST-015',
            reportType: 'asset',
            problemType: 'ประปา',
            title: 'ท่อประปาแตก',
            description: 'ท่อประปาหลักแตกรั่วน้อยๆ บริเวณหน้าศาลาประชาคม มีน้อยประปารั่วไหลตลอดเวลา ทำให้เสียน้ำและอาจสร้างความเสียหายต่อโครงสร้างถนน',
            status: 'กำลังดำเนินการ',
            priority: 'ปานกลาง',
            reportedBy: 'นายวิชัย รักษ์ดี',
            reporterPhone: '083-456-7890',
            reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 วันที่แล้ว
            images: [],
            location: 'หน้าศาลาประชาคม'
          },
          {
            id: 4,
            ticketId: 'TK001704',
            assetCode: null,
            reportType: 'general',
            problemType: 'ท่อระบายน้ำ',
            title: 'ท่อระบายน้ำอุดตัน',
            description: 'ท่อระบายน้ำข้างถนนอุดตัน ทำให้น้ำขังหน้าบ้าน เวลาฝนตกจะท่วมขัง ต้องการให้ดูดสิ่งปฏิกูลและทำความสะอาดท่อ',
            status: 'รอดำเนินการ',
            priority: 'ปานกลาง',
            reportedBy: 'นางประนอม มีสุข',
            reporterPhone: '084-567-8901',
            reportedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 วันที่แล้ว
            images: [],
            location: 'ซอย 3 หมู่ 2',
            villageId: 2
          },
          {
            id: 5,
            ticketId: 'TK001705',
            assetCode: 'AST-008',
            reportType: 'asset',
            problemType: 'สาธารณูปโภค',
            title: 'ป้ายประกาศหมู่บ้านเก่าและชำรุด',
            description: 'ป้ายประกาศหน้าหมู่บ้านชำรุด สีตกและตัวอักษรเลือนราง ไม่สามารถอ่านข้อความได้ชัดเจน ต้องการซ่อมแซมหรือเปลี่ยนใหม่',
            status: 'เสร็จสิ้น',
            priority: 'ต่ำ',
            reportedBy: 'นายสมศักดิ์ จริงใจ',
            reporterPhone: '085-678-9012',
            reportedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 วันที่แล้ว
            images: [],
            location: 'หน้าทางเข้าหมู่บ้าน'
          }
        ];

        // Filter by query parameters
        let filteredReports = mockReports;
        
        if (id) {
          filteredReports = mockReports.filter(report => report.id === parseInt(id));
        } else if (ticketId) {
          filteredReports = mockReports.filter(report => report.ticketId === ticketId);
        } else if (assetId) {
          filteredReports = mockReports.filter(report => report.assetCode === assetId);
        } else if (status) {
          filteredReports = mockReports.filter(report => report.status === status);
        }

        res.status(200).json({ success: true, data: filteredReports });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        let bodyData = req.body;

        // Handle file upload only in non-Vercel environment
        if (!isVercel && upload) {
          await new Promise((resolve, reject) => {
            upload.array('images', 5)(req, res, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
        }

        const { 
          assetCode,
          problemType,
          description, 
          reporterName, 
          reporterPhone,
          location,
          gpsLocation,
          timestamp,
          reportType,
          villageId
        } = bodyData;

        // Validation based on report type
        if (reportType === 'general') {
          // General report validation
          if (!description || !reporterName || !reporterPhone) {
            return res.status(400).json({ 
              success: false, 
              error: 'กรุณากรอกข้อมูลให้ครบถ้วน (รายละเอียด, ชื่อผู้แจ้ง, เบอร์โทร)' 
            });
          }
        } else {
          // Asset-specific report validation
          if (!assetCode || !description) {
            return res.status(400).json({ 
              success: false, 
              error: 'กรุณากรอกข้อมูลให้ครบถ้วน' 
            });
          }
        }

        // Process uploaded files (only for non-Vercel)
        const uploadedImages = [];
        if (!isVercel && req.files && req.files.length > 0 && path && fs) {
          req.files.forEach((file, index) => {
            const fileExtension = path.extname(file.originalname);
            const newFileName = `report_${Date.now()}_${index}${fileExtension}`;
            const newFilePath = path.join('public/uploads', newFileName);
            
            fs.renameSync(file.path, newFilePath);
            uploadedImages.push(`/uploads/${newFileName}`);
          });
        }
        // On Vercel, images should be uploaded to cloud storage (S3, Cloudinary, etc.)
        // For now, we'll accept base64 images or URLs in the request body

        // Generate ticket ID
        const reportId = Date.now();
        const ticketId = `TK${reportId.toString().padStart(6, '0')}`;

        // TODO: Insert into database
        const newReport = {
          id: reportId,
          ticketId,
          reportType: reportType || 'asset',
          assetCode: reportType === 'general' ? null : assetCode,
          villageId: reportType === 'general' ? villageId : null,
          problemType,
          description,
          priority: 'ปานกลาง',
          status: 'รอดำเนินการ',
          reportedBy: reporterName,
          reporterPhone,
          images: uploadedImages,
          location: reportType === 'general' ? location : (location ? JSON.parse(location) : null),
          gpsLocation: gpsLocation ? JSON.parse(gpsLocation) : null,
          reportedAt: new Date().toISOString()
        };

        res.status(201).json({ 
          success: true, 
          ticketId,
          data: newReport,
          message: 'ส่งรายงานสำเร็จ'
        });
      } catch (error) {
        console.error('POST /api/reports error:', error);
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    case 'PUT':
      try {
        const { id } = req.body;
        // const { status, priority, adminNote } = req.body;

        if (!id) {
          return res.status(400).json({ 
            success: false, 
            error: 'ไม่พบ ID ของรายงาน' 
          });
        }

        // TODO: Update database with status, priority, adminNote
        res.status(200).json({ 
          success: true, 
          message: 'อัปเดตสถานะสำเร็จ' 
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;

        if (!id) {
          return res.status(400).json({ 
            success: false, 
            error: 'ไม่พบ ID ของรายงาน' 
          });
        }

        // TODO: Delete from database
        res.status(200).json({ 
          success: true, 
          message: 'ลบรายงานสำเร็จ' 
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

