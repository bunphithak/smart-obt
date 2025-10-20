// API for tracking report status by ticket ID
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'bunphithak',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_obt',
});

export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    const { ticketId } = req.query;

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        error: 'กรุณาระบุรหัสติดตาม'
      });
    }

    // Query from database by ticketId
    const result = await pool.query(`
      SELECT 
        r.*,
        a.name as asset_name,
        u.name as assigned_to_name
      FROM reports r
      LEFT JOIN assets a ON r.asset_code = a.code
      LEFT JOIN users u ON r.assigned_to = u.id
      WHERE r.ticket_id = $1
    `, [ticketId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบรายการที่ระบุ'
      });
    }

    const report = result.rows[0];
    
    // Parse JSON fields
    let images = [];
    let coordinates = null;
    let repair = null;
    
    try {
      images = report.images ? JSON.parse(report.images) : [];
    } catch (e) {
      images = [];
    }
    
    try {
      coordinates = report.coordinates ? JSON.parse(report.coordinates) : null;
    } catch (e) {
      coordinates = null;
    }

    // Get repair details if exists
    const repairResult = await pool.query(`
      SELECT * FROM repairs WHERE report_id = $1
    `, [report.id]);
    
    if (repairResult.rows.length > 0) {
      const repairData = repairResult.rows[0];
      let afterImages = [];
      try {
        afterImages = repairData.after_images ? JSON.parse(repairData.after_images) : [];
      } catch (e) {
        afterImages = [];
      }
      
      repair = {
        id: repairData.id,
        assignedTo: report.assigned_to_name || 'ไม่ระบุ',
        status: repairData.status,
        startDate: repairData.start_date,
        completedDate: repairData.completed_date,
        afterImages: afterImages,
        notes: repairData.notes
      };
    }

    const responseData = {
      id: report.id,
      ticketId: report.ticket_id,
      assetId: report.asset_code,
      assetName: report.asset_name || 'ไม่ระบุ',
      assetCode: report.asset_code,
      title: report.title,
      description: report.description,
      status: report.status,
      priority: report.priority,
      reportedBy: report.reported_by,
      reporterPhone: report.reporter_phone,
      images: images,
      location: coordinates,
      reportedAt: report.reported_at,
      rating: report.rating,
      feedback: report.feedback,
      referrerUrl: report.referrer_url,
      repair: repair
    };

    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    console.error('Track API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

