// Repairs Complete API - Connected to PostgreSQL Database
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { REPAIR_STATUS, REPORT_STATUS } = require('../../../lib/constants');

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
    const validStatuses = [REPAIR_STATUS.COMPLETED, REPAIR_STATUS.CANCELLED];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'สถานะไม่ถูกต้อง'
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

    // Get original report images to merge with completion images
    const repairData = await pool.query(`
      SELECT r.images as repair_images, rep.images as report_images
      FROM repairs r
      LEFT JOIN reports rep ON r.report_id = rep.id
      WHERE r.id = $1
    `, [id]);

    let mergedImages = [];
    
    if (repairData.rows.length > 0) {
      const row = repairData.rows[0];
      
      // Get original report images
      if (row.report_images) {
        try {
          const reportImages = typeof row.report_images === 'string' 
            ? JSON.parse(row.report_images) 
            : row.report_images;
          if (Array.isArray(reportImages)) {
            mergedImages = [...reportImages];
          }
        } catch (e) {
          console.error('Error parsing report images:', e);
        }
      }
      
      // Add completion images
      if (afterImages && Array.isArray(afterImages)) {
        mergedImages = [...mergedImages, ...afterImages];
      }
    }

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
      status || REPAIR_STATUS.COMPLETED,
      actualCost ? parseFloat(actualCost) : null,
      completedDate || new Date().toISOString(),
      notes?.trim() || '',
      mergedImages.length > 0 ? JSON.stringify(mergedImages) : null
    ]);

    // Update related report status if repair is completed
    if (status === REPAIR_STATUS.COMPLETED) {
      await pool.query(`
        UPDATE reports 
        SET status = $1,
            updated_at = NOW()
        WHERE id = (
          SELECT report_id FROM repairs WHERE id = $2
        )
      `, [REPORT_STATUS.APPROVED, id]); // ใช้สถานะ "อนุมัติ" เมื่อซ่อมเสร็จ
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
        afterImages: (() => {
          try {
            return updatedRepair.images ? JSON.parse(updatedRepair.images) : [];
          } catch (e) {
            return [];
          }
        })(),
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