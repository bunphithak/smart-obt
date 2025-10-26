// API for generating asset codes with category prefix and run number
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { categoryId } = req.query;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        error: 'กรุณาระบุหมวดหมู่'
      });
    }

    // Get category info including prefix
    const categoryResult = await pool.query(`
      SELECT id, name, code_prefix 
      FROM categories 
      WHERE id = $1 AND is_active = true
    `, [categoryId]);

    if (categoryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบหมวดหมู่ที่ระบุ'
      });
    }

    const category = categoryResult.rows[0];
    
    // Generate date prefix (YYMMDD format)
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2); // Last 2 digits of year
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Month (01-12)
    const day = now.getDate().toString().padStart(2, '0'); // Day (01-31)
    const datePrefix = `${year}${month}${day}`; // YYMMDD format
    
    // Use LED as prefix + date
    const prefix = `LED-${datePrefix}`;

    // Get the highest run number for this prefix today
    const maxCodeResult = await pool.query(`
      SELECT code 
      FROM assets 
      WHERE code LIKE $1
      ORDER BY code DESC 
      LIMIT 1
    `, [`${prefix}%`]);

    let nextRunNumber = 1;
    
    if (maxCodeResult.rows.length > 0) {
      const lastCode = maxCodeResult.rows[0].code;
      // Extract 6-digit number from code (e.g., "LED-241223000001" -> 1)
      const numberMatch = lastCode.match(/\d{6}$/);
      if (numberMatch) {
        nextRunNumber = parseInt(numberMatch[0]) + 1;
      }
    }

    // Generate new code with 6-digit run number
    const newCode = `${prefix}${nextRunNumber.toString().padStart(6, '0')}`;

    res.status(200).json({
      success: true,
      data: {
        code: newCode,
        prefix: prefix,
        runNumber: nextRunNumber,
        datePrefix: datePrefix,
        categoryName: category.name
      }
    });

  } catch (error) {
    console.error('Generate Asset Code API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
