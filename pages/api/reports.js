// Reports API - Connected to PostgreSQL Database
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { formidable } = require('formidable');
const fs = require('fs').promises;
const path = require('path');
const smsService = require('../../lib/smsService');
const admin = require('firebase-admin');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'bunphithak',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_obt',
});

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    console.error('Firebase Admin init error:', error);
  }
}

// Helper function to parse form data
const parseForm = async (req) => {
  return new Promise((resolve, reject) => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Check if uploads directory exists, create if not
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      multiples: true,
      allowEmptyFiles: false,
      minFileSize: 0,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('❌ Formidable parse error:', err);
        reject(err);
        return;
      }
      console.log('✅ Form parsed successfully');
      resolve({ fields, files });
    });
  });
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method } = req;

  try {
    // Handle different content types based on method
    if (method === 'POST') {
      // For POST requests, use formidable to parse multipart/form-data
      switch (method) {
        case 'POST':
          console.log('POST /api/reports - Processing form data...');
          
          // Parse multipart form data using formidable
          const { fields, files } = await parseForm(req);
          console.log('✅ Form parsed successfully');
          
          // Extract fields (formidable wraps values in arrays)
          const assetCode = fields.assetCode?.[0];
          const problemType = fields.problemType?.[0];
          const reportTitle = fields.title?.[0];
          const description = fields.description?.[0];
          const location = fields.location?.[0];
          const reportedBy = fields.reporterName?.[0];
          const reporterPhone = fields.reporterPhone?.[0];
          const reportType = fields.reportType?.[0];
          const priority = fields.priority?.[0];
          const referrerUrl = fields.referrerUrl?.[0];
          
          // Continue with POST logic...
          break;
        }
    } else {
      // For other methods (GET, PUT, DELETE), use regular bodyParser
      switch (method) {
        case 'GET':
        console.log('GET /api/reports - Query:', req.query);
        const { id, assetCode, status, ticketId } = req.query;
        
        if (id) {
          // Get single report with asset and village info
          const result = await pool.query(`
            SELECT 
              r.*,
              a.name as asset_name,
              a.code as asset_code,
              v.name as village_name
            FROM reports r
            LEFT JOIN assets a ON r.asset_code = a.code
            LEFT JOIN villages v ON a.village_id = v.id
            WHERE r.id = $1
          `, [id]);

          if (result.rows.length === 0) {
            return res.status(404).json({ 
              success: false, 
              error: 'ไม่พบรายงานที่ระบุ' 
            });
          }

          const report = result.rows[0];
          res.status(200).json({ 
            success: true, 
            data: {
              id: report.id,
              ticketId: report.ticket_id,
              assetCode: report.asset_code,
              assetName: report.asset_name,
              villageName: report.village_name,
              reportType: report.report_type,
              problemType: report.problem_type,
              title: report.title,
              description: report.description,
              status: report.status,
              priority: report.priority,
              reportedBy: report.reported_by,
              reporterPhone: report.reporter_phone,
              reportedAt: report.reported_at,
              images: report.images || [],
              location: report.location,
              createdAt: report.created_at,
              updatedAt: report.updated_at
            }
          });
        } else {
          // Build query with filters
          let query = `
            SELECT 
              r.*,
              a.name as asset_name,
              a.code as asset_code,
              v.name as village_name
            FROM reports r
            LEFT JOIN assets a ON r.asset_code = a.code
            LEFT JOIN villages v ON a.village_id = v.id
            WHERE 1=1
          `;
          const queryParams = [];
          let paramIndex = 1;

          if (assetCode) {
            query += ` AND r.asset_code = $${paramIndex}`;
            queryParams.push(assetCode);
            paramIndex++;
          }

          if (status) {
            query += ` AND r.status = $${paramIndex}`;
            queryParams.push(status);
            paramIndex++;
          }

          if (ticketId) {
            query += ` AND r.ticket_id = $${paramIndex}`;
            queryParams.push(ticketId);
            paramIndex++;
          }

          query += ` ORDER BY r.reported_at DESC`;

          const result = await pool.query(query, queryParams);
          
          const reports = result.rows.map(row => ({
            id: row.id,
            ticketId: row.ticket_id,
            assetCode: row.asset_code,
            assetName: row.asset_name,
            villageName: row.village_name,
            reportType: row.report_type,
            problemType: row.problem_type,
            title: row.title,
            description: row.description,
            status: row.status,
            priority: row.priority,
            reportedBy: row.reported_by,
            reporterPhone: row.reporter_phone,
            reportedAt: row.reported_at,
            images: row.images || [],
            location: row.location,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));

          res.status(200).json({ 
            success: true, 
            data: reports,
            total: reports.length
          });
        }
        break;

      case 'POST':
        console.log('📨 POST /api/reports - Content-Type:', req.headers['content-type']);
        
        try {
          // Parse multipart form data
          const { fields, files } = await parseForm(req);
          
          console.log('📝 Received fields:', fields);
          console.log('📁 Received files:', Object.keys(files));
          
          // Extract fields (formidable wraps values in arrays)
          const reportAssetCode = (fields.assetCode?.[0] || fields.assetCode || '').toString().trim();
          const reportType = (fields.reportType?.[0] || fields.reportType || '').toString().trim();
          const problemType = (fields.problemType?.[0] || fields.problemType || '').toString().trim();
          const title = (fields.title?.[0] || fields.title || '').toString().trim();
          const description = (fields.description?.[0] || fields.description || '').toString().trim();
          const priority = (fields.priority?.[0] || fields.priority || '').toString().trim();
          const reportedBy = (fields.reporterName?.[0] || fields.reporterName || '').toString().trim();
          const reporterPhone = (fields.reporterPhone?.[0] || fields.reporterPhone || '').toString().trim();
          const location = (fields.location?.[0] || fields.location || '').toString().trim();
          const gpsLocation = (fields.gpsLocation?.[0] || fields.gpsLocation || '').toString().trim();
          const coordinates = (fields.coordinates?.[0] || fields.coordinates || '').toString().trim();
          const referrerUrl = (fields.referrerUrl?.[0] || fields.referrerUrl || '').toString().trim();
          
          console.log('📋 Extracted data:', {
            reportType,
            problemType,
            reportedBy,
            reporterPhone,
            hasDescription: !!description
          });

          // Validate required fields based on report type
          if (reportType === 'repair') {
            // For repair reports, description is required
            if (!description) {
              return res.status(400).json({ 
                success: false, 
                error: 'กรุณากรอกข้อมูลที่จำเป็น (description)' 
              });
            }

            // Verify asset exists if assetCode is provided
            if (reportAssetCode) {
              const assetExists = await pool.query(
                'SELECT id, code FROM assets WHERE code = $1',
                [reportAssetCode]
              );

              if (assetExists.rows.length === 0) {
                return res.status(400).json({
                  success: false,
                  error: 'ไม่พบทรัพย์สินที่ระบุ'
                });
              }
            }
          } else if (reportType === 'request') {
            // For request, title and description are required
            if (!title || !description) {
              return res.status(400).json({ 
                success: false, 
                error: 'กรุณากรอกข้อมูลที่จำเป็น (title, description)' 
              });
            }
          } else {
            return res.status(400).json({ 
              success: false, 
              error: 'ประเภทรายงานไม่ถูกต้อง' 
            });
          }

          // Process uploaded images to Firebase
          const imageUrls = [];
          if (files.images) {
            const imageFiles = Array.isArray(files.images) ? files.images : [files.images];
            
            try {
              const bucket = admin.storage().bucket();
              
              for (const file of imageFiles) {
                // Read file
                const fileBuffer = await fs.readFile(file.filepath);
                const originalName = file.originalFilename || 'image.jpg';
                const extension = path.extname(originalName);
                const timestamp = Date.now();
                const randomString = Math.random().toString(36).substring(2, 10);
                const filename = `reports/${timestamp}_${randomString}${extension}`;
                
                // Upload to Firebase
                const fileUpload = bucket.file(filename);
                await fileUpload.save(fileBuffer, {
                  metadata: {
                    contentType: file.mimetype || 'image/jpeg',
                  },
                });
                
                // Make file public
                await fileUpload.makePublic();
                
                // Get public URL
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
                imageUrls.push(publicUrl);
                
                console.log(`✅ Uploaded image to Firebase: ${filename}`);
                
                // Delete temp file
                await fs.unlink(file.filepath).catch(err => console.error('Error deleting temp file:', err));
              }
            } catch (uploadError) {
              console.error('❌ Firebase upload error:', uploadError);
              // Continue without images if upload fails
            }
          }

          // Generate ticket ID with prefix based on type
          const prefix = reportType === 'repair' ? 'RP' : 'RQ';
          const timestamp = Date.now().toString();
          const newTicketId = `${prefix}${timestamp.slice(-8)}`;

          // Generate title for repair if not provided
          const reportTitle = title?.trim() || (reportType === 'repair' ? `แจ้งซ่อม ${reportAssetCode || 'ทรัพย์สิน'}` : 'คำร้อง');

          // Parse coordinates if provided
          let coordinatesJson = null;
          if (coordinates && coordinates.trim() && coordinates !== 'undefined') {
            try {
              coordinatesJson = JSON.parse(coordinates);
              console.log('📍 Parsed coordinates:', coordinatesJson);
            } catch (e) {
              console.error('⚠️ Error parsing coordinates:', e);
              coordinatesJson = null;
            }
          }

          const result = await pool.query(`
            INSERT INTO reports (
              ticket_id, asset_code, report_type, problem_type, title, description,
              status, priority, reported_by, reporter_phone, images, location, coordinates, referrer_url
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
          `, [
            newTicketId,
            reportAssetCode || null,
            reportType,
            problemType || 'ทั่วไป',
            reportTitle,
            description.trim(),
            'รอดำเนินการ',
            priority || 'ปานกลาง',
            reportedBy?.trim() || 'ไม่ระบุ',
            reporterPhone?.trim() || '',
            JSON.stringify(imageUrls),
            location?.trim() || '',
            coordinatesJson ? JSON.stringify(coordinatesJson) : null,
            referrerUrl || null
          ]);

          const newReport = result.rows[0];
          
          console.log('✅ Report created successfully:', {
            ticketId: newReport.ticket_id,
            reportType: newReport.report_type,
            reportedBy: newReport.reported_by
          });
          
          // Parse images safely
          let parsedImages = [];
          try {
            parsedImages = typeof newReport.images === 'string' 
              ? JSON.parse(newReport.images) 
              : (newReport.images || []);
          } catch (e) {
            console.error('⚠️ Error parsing images:', e);
            parsedImages = [];
          }
          
          // Parse coordinates safely
          let parsedCoordinates = null;
          try {
            parsedCoordinates = newReport.coordinates && typeof newReport.coordinates === 'string'
              ? JSON.parse(newReport.coordinates)
              : newReport.coordinates;
          } catch (e) {
            console.error('⚠️ Error parsing coordinates:', e);
            parsedCoordinates = null;
          }
          
          // Send SMS notification
          if (reporterPhone && reporterPhone.trim()) {
            console.log('📱 Sending SMS to:', reporterPhone);
            try {
              const smsResult = await smsService.sendReportConfirmation(
                reporterPhone,
                newTicketId,
                reportType
              );
              console.log('📱 SMS Result:', smsResult);
            } catch (smsError) {
              console.error('⚠️ SMS error (non-critical):', smsError);
              // SMS failure should not block the response
            }
          }

          res.status(201).json({ 
            success: true, 
            ticketId: newReport.ticket_id,
            message: 'บันทึกรายงานสำเร็จ',
            data: {
              id: newReport.id,
              ticketId: newReport.ticket_id,
              assetCode: newReport.asset_code,
              reportType: newReport.report_type,
              problemType: newReport.problem_type,
              title: newReport.title,
              description: newReport.description,
              status: newReport.status,
              priority: newReport.priority,
              reportedBy: newReport.reported_by,
              reporterPhone: newReport.reporter_phone,
              reportedAt: newReport.reported_at,
              images: parsedImages,
              location: newReport.location,
              coordinates: parsedCoordinates,
              createdAt: newReport.created_at
            }
          });
        } catch (parseError) {
          console.error('❌ POST /api/reports Error:', parseError);
          console.error('❌ Error stack:', parseError.stack);
          return res.status(400).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการอ่านข้อมูล',
            details: parseError.message,
            stack: process.env.NODE_ENV === 'development' ? parseError.stack : undefined
          });
        }
        break;

      case 'PUT':
        const { 
          id: updateId, 
          status: updateStatus, 
          priority: updatePriority, 
          description: updateDescription,
          images: updateImages,
          note: updateNote,
          rejectionReason: updateRejectionReason
        } = req.body;

        if (!updateId) {
          return res.status(400).json({ 
            success: false, 
            error: 'กรุณาระบุ ID ของรายงาน' 
          });
        }

        // Check if report exists
        const reportExists = await pool.query(
          'SELECT id FROM reports WHERE id = $1',
          [updateId]
        );

        if (reportExists.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'ไม่พบรายงานที่ต้องการอัปเดต'
          });
        }

        const updateResult = await pool.query(`
          UPDATE reports 
          SET status = COALESCE($2, status),
              priority = COALESCE($3, priority),
              description = COALESCE($4, description),
              images = COALESCE($5, images),
              rejection_reason = COALESCE($6, rejection_reason),
              updated_at = NOW()
          WHERE id = $1
          RETURNING *
        `, [
          updateId,
          updateStatus,
          updatePriority,
          updateDescription?.trim(),
          updateImages ? JSON.stringify(updateImages) : null,
          updateRejectionReason?.trim()
        ]);

        res.status(200).json({ 
          success: true, 
          message: 'อัปเดตรายงานสำเร็จ',
          data: updateResult.rows[0]
        });
        break;

      case 'DELETE':
        const { id: deleteId } = req.query;
        
        if (!deleteId) {
          return res.status(400).json({ 
            success: false, 
            error: 'กรุณาระบุ ID ของรายงานที่ต้องการลบ' 
          });
        }

        // Check if report exists
        const reportToDelete = await pool.query(
          'SELECT id FROM reports WHERE id = $1',
          [deleteId]
        );

        if (reportToDelete.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'ไม่พบรายงานที่ต้องการลบ'
          });
        }

        // Check if report has repairs
        const repairsCheck = await pool.query(
          'SELECT COUNT(*) as count FROM repairs WHERE report_id = $1',
          [deleteId]
        );

        if (parseInt(repairsCheck.rows[0].count) > 0) {
          return res.status(400).json({
            success: false,
            error: 'ไม่สามารถลบรายงานที่มีงานซ่อมได้'
          });
        }

        await pool.query('DELETE FROM reports WHERE id = $1', [deleteId]);
        
        res.status(200).json({ 
          success: true, 
          message: 'ลบรายงานสำเร็จ' 
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
    }
    } // Close else block

  } catch (error) {
    console.error('Reports API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Configure API route - Enable body parser for PUT/DELETE, disable for POST (multipart/form-data)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};