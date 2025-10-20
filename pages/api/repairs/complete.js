// Repairs Complete API - Connected to PostgreSQL Database
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
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { 
      id, 
      status, 
      actualCost, 
      completedDate, 
      notes, 
      afterImages 
    } = req.body;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        error: 'ไม่พบ ID ของงานซ่อม' 
      });
    }

    // Check if repair exists
    const repairExists = await pool.query(
      'SELECT id, status FROM repairs WHERE id = $1',
      [id]
    );

    if (repairExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบงานซ่อมที่ระบุ'
      });
    }

    // Validate status
    const validStatuses = ['เสร็จสิ้น', 'ยกเลิก', 'รอตรวจสอบ'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'สถานะไม่ถูกต้อง ต้องเป็น: เสร็จสิ้น, ยกเลิก, หรือ รอตรวจสอบ'
      });
    }

    console.log('Completing repair:', {
      id,
      status,
      actualCost,
      completedDate,
      notes,
      afterImages: afterImages ? afterImages.length : 0
    });

    // Update repair record
    const updateResult = await pool.query(`
      UPDATE repairs 
      SET status = COALESCE($2, status),
          actual_cost = COALESCE($3, actual_cost),
          completed_date = COALESCE($4, completed_date),
          notes = COALESCE($5, notes),
          images = COALESCE($6, images),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [
      id,
      status || 'เสร็จสิ้น',
      actualCost ? parseFloat(actualCost) : null,
      completedDate || new Date().toISOString(),
      notes?.trim() || '',
      afterImages ? JSON.stringify(afterImages) : null
    ]);

    // Update related report status if repair is completed
    if (status === 'เสร็จสิ้น') {
      await pool.query(`
        UPDATE reports 
        SET status = 'เสร็จสิ้น',
            updated_at = NOW()
        WHERE id = (
          SELECT report_id FROM repairs WHERE id = $1
        )
      `, [id]);
    }

    const updatedRepair = updateResult.rows[0];

    res.status(200).json({ 
      success: true, 
      message: 'ปิดงานสำเร็จ',
      data: {
        id: updatedRepair.id,
        status: updatedRepair.status,
        actualCost: updatedRepair.actual_cost,
        completedDate: updatedRepair.completed_date,
        notes: updatedRepair.notes,
        afterImages: updatedRepair.images ? JSON.parse(updatedRepair.images) : [],
        updatedAt: updatedRepair.updated_at
      }
    });

  } catch (error) {
    console.error('Error completing repair:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Configure API route
export const config = {
  api: {
    bodyParser: true
  }
};