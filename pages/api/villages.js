// Villages API - Connected to PostgreSQL with JWT Protection
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { verifyToken, extractToken } = require('../../lib/auth');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'bunphithak',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_obt',
});

// Middleware to check JWT for write operations
async function checkAuth(req, res, requireAuth = true) {
  if (!requireAuth) return null;

  try {
    const token = extractToken(req);
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return null;
    }

    const user = verifyToken(token);
    
    // Only admin and technician can modify villages
    if (!['admin', 'technician'].includes(user.role)) {
      res.status(403).json({
        success: false,
        error: 'Access denied'
      });
      return null;
    }

    return user;
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
    return null;
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // GET is public (no auth required)
        const { id } = req.query;
        
        if (id) {
          const result = await pool.query(`
            SELECT 
              v.*,
              COUNT(a.id) as total_assets
            FROM villages v
            LEFT JOIN assets a ON v.id = a.village_id
            WHERE v.id = $1
            GROUP BY v.id, v.name, v.description, v.location, v.village_code, v.is_active, v.created_at, v.updated_at
          `, [id]);

          if (result.rows.length === 0) {
            return res.status(404).json({ 
              success: false, 
              error: 'ไม่พบข้อมูลหมู่บ้าน' 
            });
          }

          const village = result.rows[0];
          res.status(200).json({ 
            success: true, 
            data: {
              id: village.id,
              villageCode: village.village_code,
              name: village.name,
              description: village.description,
              location: village.location,
              isActive: village.is_active,
              totalAssets: parseInt(village.total_assets),
              createdAt: village.created_at,
              updatedAt: village.updated_at
            }
          });
        } else {
          const result = await pool.query(`
            SELECT 
              v.*,
              COUNT(a.id) as total_assets
            FROM villages v
            LEFT JOIN assets a ON v.id = a.village_id
            GROUP BY v.id, v.name, v.description, v.location, v.village_code, v.is_active, v.created_at, v.updated_at
            ORDER BY v.name
          `);

          const villages = result.rows.map(row => ({
            id: row.id,
            villageCode: row.village_code,
            name: row.name,
            description: row.description,
            location: row.location,
            isActive: row.is_active,
            totalAssets: parseInt(row.total_assets),
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));

          res.status(200).json({ success: true, data: villages });
        }
        break;

      case 'POST':
        // Require authentication
        const postUser = await checkAuth(req, res, true);
        if (!postUser) return;

        const { 
          name, 
          description, 
          location, 
          isActive 
        } = req.body;

        if (!name) {
          return res.status(400).json({ 
            success: false, 
            error: 'กรุณากรอกชื่อหมู่บ้าน' 
          });
        }

        const existingVillage = await pool.query(
          'SELECT id FROM villages WHERE LOWER(name) = LOWER($1)',
          [name.trim()]
        );

        if (existingVillage.rows.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'ชื่อหมู่บ้านนี้มีอยู่แล้ว'
          });
        }

        const result = await pool.query(`
          INSERT INTO villages (name, description, location, is_active)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `, [name.trim(), description?.trim() || '', location || null, isActive !== undefined ? isActive : true]);

        const newVillage = result.rows[0];
        res.status(201).json({ 
          success: true, 
          data: {
            id: newVillage.id,
            name: newVillage.name,
            description: newVillage.description,
            location: newVillage.location,
            isActive: newVillage.is_active,
            totalAssets: 0,
            createdAt: newVillage.created_at,
            updatedAt: newVillage.updated_at
          }
        });
        break;

      case 'PUT':
        // Require authentication
        const putUser = await checkAuth(req, res, true);
        if (!putUser) return;

        const { 
          id: updateId,
          name: updateName, 
          description: updateDescription, 
          location: updateLocation,
          isActive: updateIsActive
        } = req.body;

        if (!updateId) {
          return res.status(400).json({ 
            success: false, 
            error: 'ไม่พบ ID ของหมู่บ้าน' 
          });
        }

        const updateResult = await pool.query(`
          UPDATE villages 
          SET name = COALESCE($2, name),
              description = COALESCE($3, description),
              location = COALESCE($4, location),
              is_active = COALESCE($5, is_active),
              updated_at = NOW()
          WHERE id = $1
          RETURNING *
        `, [updateId, updateName, updateDescription, updateLocation, updateIsActive]);

        if (updateResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'ไม่พบหมู่บ้านที่ต้องการอัปเดต'
          });
        }

        res.status(200).json({ 
          success: true, 
          message: 'อัปเดตข้อมูลหมู่บ้านสำเร็จ',
          data: updateResult.rows[0]
        });
        break;

      case 'DELETE':
        // Require authentication (admin only)
        const deleteUser = await checkAuth(req, res, true);
        if (!deleteUser) return;

        if (deleteUser.role !== 'admin') {
          return res.status(403).json({
            success: false,
            error: 'เฉพาะผู้ดูแลระบบเท่านั้นที่ลบได้'
          });
        }

        const { id: deleteId } = req.query;

        if (!deleteId) {
          return res.status(400).json({ 
            success: false, 
            error: 'ไม่พบ ID ของหมู่บ้าน' 
          });
        }

        const assetsCheck = await pool.query(
          'SELECT COUNT(*) as asset_count FROM assets WHERE village_id = $1',
          [deleteId]
        );

        if (parseInt(assetsCheck.rows[0].asset_count) > 0) {
          return res.status(400).json({
            success: false,
            error: 'ไม่สามารถลบหมู่บ้านที่มีทรัพย์สินได้ กรุณาลบทรัพย์สินก่อน'
          });
        }

        const deleteResult = await pool.query(
          'DELETE FROM villages WHERE id = $1 RETURNING *',
          [deleteId]
        );

        if (deleteResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'ไม่พบหมู่บ้านที่ต้องการลบ'
          });
        }

        res.status(200).json({ 
          success: true, 
          message: 'ลบหมู่บ้านสำเร็จ' 
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }

  } catch (error) {
    console.error('Villages API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}