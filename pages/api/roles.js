// Roles API - Public endpoint
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'bunphithak',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_obt',
});

async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        const result = await pool.query(`
          SELECT 
            id, name, display_name, description, permissions, is_active,
            created_at, updated_at
          FROM roles 
          WHERE is_active = true
          ORDER BY name
        `);
        
        const roles = result.rows.map(row => ({
          id: row.id,
          name: row.name,
          displayName: row.display_name,
          description: row.description,
          permissions: row.permissions,
          isActive: row.is_active,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));

        res.status(200).json({
          success: true,
          data: roles,
          total: roles.length
        });
        break;

      default:
        res.setHeader('Allow', ['GET']);
        res.status(405).json({
          success: false,
          error: `Method ${method} Not Allowed`
        });
    }
  } catch (error) {
    console.error('Roles API Error:', error);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในระบบ'
    });
  }
}

export default handler;
