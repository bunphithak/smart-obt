// Categories API - Connected to PostgreSQL with JWT Protection
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
    
    // Only admin and technician can modify categories
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
              c.*,
              COUNT(a.id) as asset_count
            FROM categories c
            LEFT JOIN assets a ON c.id = a.category_id
            WHERE c.id = $1
            GROUP BY c.id, c.name, c.description, c.is_active, c.created_at, c.updated_at
          `, [id]);

          if (result.rows.length === 0) {
            return res.status(404).json({ 
              success: false, 
              error: 'ไม่พบข้อมูลหมวดหมู่' 
            });
          }

          const category = result.rows[0];
          res.status(200).json({ 
            success: true, 
            data: {
              id: category.id,
              name: category.name,
              description: category.description,
              codePrefix: category.code_prefix,
              isActive: category.is_active,
              assetCount: parseInt(category.asset_count),
              createdAt: category.created_at,
              updatedAt: category.updated_at
            }
          });
        } else {
          const result = await pool.query(`
            SELECT 
              c.*,
              COUNT(a.id) as asset_count
            FROM categories c
            LEFT JOIN assets a ON c.id = a.category_id
            GROUP BY c.id, c.name, c.description, c.is_active, c.created_at, c.updated_at
            ORDER BY c.name
          `);

          const categories = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            codePrefix: row.code_prefix,
            isActive: row.is_active,
            assetCount: parseInt(row.asset_count),
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));

          res.status(200).json({ success: true, data: categories });
        }
        break;

      case 'POST':
        // Require authentication
        const postUser = await checkAuth(req, res, true);
        if (!postUser) return;

        // Only admin can create categories
        if (postUser.role !== 'admin') {
          return res.status(403).json({
            success: false,
            error: 'เฉพาะผู้ดูแลระบบเท่านั้นที่สร้างหมวดหมู่ได้'
          });
        }

        const { name, description, codePrefix, isActive } = req.body;
        
        if (!name) {
          return res.status(400).json({ 
            success: false, 
            error: 'กรุณากรอกชื่อหมวดหมู่' 
          });
        }

        const existingCategory = await pool.query(
          'SELECT id FROM categories WHERE LOWER(name) = LOWER($1)',
          [name.trim()]
        );

        if (existingCategory.rows.length > 0) {
          return res.status(400).json({ 
            success: false, 
            error: 'ชื่อหมวดหมู่นี้มีอยู่แล้ว' 
          });
        }
        
        const result = await pool.query(`
          INSERT INTO categories (name, description, code_prefix, is_active)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `, [name.trim(), description?.trim() || '', codePrefix?.trim() || null, isActive !== undefined ? isActive : true]);

        const newCategory = result.rows[0];
        res.status(201).json({ 
          success: true, 
          data: {
            id: newCategory.id,
            name: newCategory.name,
            description: newCategory.description,
            codePrefix: newCategory.code_prefix,
            isActive: newCategory.is_active,
            assetCount: 0,
            createdAt: newCategory.created_at,
            updatedAt: newCategory.updated_at
          }
        });
        break;

      case 'PUT':
        // Require authentication
        const putUser = await checkAuth(req, res, true);
        if (!putUser) return;

        // Only admin can update categories
        if (putUser.role !== 'admin') {
          return res.status(403).json({
            success: false,
            error: 'เฉพาะผู้ดูแลระบบเท่านั้นที่แก้ไขหมวดหมู่ได้'
          });
        }

        const { 
          id: updateId, 
          name: updateName, 
          description: updateDescription,
          codePrefix: updateCodePrefix,
          isActive: updateIsActive 
        } = req.body;
        
        if (!updateId || !updateName) {
          return res.status(400).json({ 
            success: false, 
            error: 'กรุณากรอกข้อมูลที่จำเป็น (id, name)' 
          });
        }

        const categoryExists = await pool.query(
          'SELECT id FROM categories WHERE id = $1',
          [updateId]
        );

        if (categoryExists.rows.length === 0) {
          return res.status(404).json({ 
            success: false, 
            error: 'ไม่พบข้อมูลหมวดหมู่' 
          });
        }

        const nameConflict = await pool.query(
          'SELECT id FROM categories WHERE LOWER(name) = LOWER($1) AND id != $2',
          [updateName.trim(), updateId]
        );

        if (nameConflict.rows.length > 0) {
          return res.status(400).json({ 
            success: false, 
            error: 'ชื่อหมวดหมู่นี้มีอยู่แล้ว' 
          });
        }
        
        const updateResult = await pool.query(`
          UPDATE categories 
          SET name = $2,
              description = $3,
              code_prefix = $4,
              is_active = $5,
              updated_at = NOW()
          WHERE id = $1
          RETURNING *
        `, [updateId, updateName.trim(), updateDescription?.trim() || '', updateCodePrefix?.trim() || null, updateIsActive !== undefined ? updateIsActive : true]);

        const updatedCategory = updateResult.rows[0];
        res.status(200).json({ 
          success: true, 
          message: 'อัปเดตข้อมูลหมวดหมู่สำเร็จ', 
          data: {
            id: updatedCategory.id,
            name: updatedCategory.name,
            description: updatedCategory.description,
            codePrefix: updatedCategory.code_prefix,
            isActive: updatedCategory.is_active,
            createdAt: updatedCategory.created_at,
            updatedAt: updatedCategory.updated_at
          }
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
            error: 'กรุณาระบุ ID ของหมวดหมู่ที่ต้องการลบ' 
          });
        }

        const categoryToDelete = await pool.query(
          'SELECT id FROM categories WHERE id = $1',
          [deleteId]
        );

        if (categoryToDelete.rows.length === 0) {
          return res.status(404).json({ 
            success: false, 
            error: 'ไม่พบข้อมูลหมวดหมู่' 
          });
        }

        const assetsUsingCategory = await pool.query(
          'SELECT COUNT(*) as count FROM assets WHERE category_id = $1',
          [deleteId]
        );

        if (parseInt(assetsUsingCategory.rows[0].count) > 0) {
          return res.status(400).json({ 
            success: false, 
            error: 'ไม่สามารถลบหมวดหมู่นี้ได้ เนื่องจากมีทรัพย์สินใช้งานอยู่' 
          });
        }
        
        await pool.query('DELETE FROM categories WHERE id = $1', [deleteId]);
        
        res.status(200).json({ 
          success: true, 
          message: 'ลบข้อมูลหมวดหมู่สำเร็จ' 
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
    }

  } catch (error) {
    console.error('Categories API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}