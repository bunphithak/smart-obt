// Problem Types API - Connected to PostgreSQL with JWT Protection
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
    
    // Only admin can modify problem types
    if (user.role !== 'admin') {
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
      case 'GET': {
        const { id, categoryId, activeOnly } = req.query;
        
        if (id) {
          // Get single problem type
          const result = await pool.query(`
            SELECT 
              pt.*,
              c.name as category_name
            FROM problem_types pt
            LEFT JOIN categories c ON pt.category_id = c.id
            WHERE pt.id = $1
          `, [id]);

          if (result.rows.length === 0) {
            return res.status(404).json({
              success: false,
              error: 'ไม่พบประเภทปัญหา'
            });
          }

          res.status(200).json({
            success: true,
            data: result.rows[0]
          });
        } else {
          // Get all problem types
          let query = `
            SELECT 
              pt.*,
              c.name as category_name
            FROM problem_types pt
            LEFT JOIN categories c ON pt.category_id = c.id
            WHERE 1=1
          `;
          const params = [];
          let paramIndex = 1;

          if (categoryId) {
            query += ` AND pt.category_id = $${paramIndex}`;
            params.push(categoryId);
            paramIndex++;
          }

          if (activeOnly === 'true') {
            query += ` AND pt.is_active = true`;
          }

          query += ` ORDER BY pt.display_order, pt.name`;

          const result = await pool.query(query, params);
          
          const problemTypes = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            categoryId: row.category_id,
            categoryName: row.category_name,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }));

          res.status(200).json({
            success: true,
            data: problemTypes
          });
        }
        break;
      }

      case 'POST': {
        // Check authentication
        const user = await checkAuth(req, res);
        if (!user) return;

        const { name, description, categoryId } = req.body;

        if (!name) {
          return res.status(400).json({
            success: false,
            error: 'กรุณาระบุชื่อประเภทปัญหา'
          });
        }

        if (!categoryId) {
          return res.status(400).json({
            success: false,
            error: 'กรุณาเลือกหมวดหมู่ทรัพย์สิน'
          });
        }

        // Check if name already exists
        const existing = await pool.query(
          'SELECT id FROM problem_types WHERE name = $1',
          [name]
        );

        if (existing.rows.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'ชื่อประเภทปัญหานี้มีอยู่แล้ว'
          });
        }

        // Insert new problem type
        const result = await pool.query(`
          INSERT INTO problem_types (
            name, description, category_id, icon, color, display_order
          ) VALUES ($1, $2, $3, NULL, NULL, 0)
          RETURNING *
        `, [name, description || null, categoryId]);

        const newProblemType = result.rows[0];

        // Get category name
        let categoryName = null;
        if (categoryId) {
          const catResult = await pool.query('SELECT name FROM categories WHERE id = $1', [categoryId]);
          if (catResult.rows.length > 0) {
            categoryName = catResult.rows[0].name;
          }
        }

        res.status(201).json({
          success: true,
          data: {
            id: newProblemType.id,
            name: newProblemType.name,
            description: newProblemType.description,
            categoryId: newProblemType.category_id,
            categoryName,
            isActive: newProblemType.is_active,
            createdAt: newProblemType.created_at,
            updatedAt: newProblemType.updated_at
          }
        });
        break;
      }

      case 'PUT': {
        // Check authentication
        const user = await checkAuth(req, res);
        if (!user) return;

        const { id, name, description, categoryId, isActive } = req.body;

        if (!id) {
          return res.status(400).json({
            success: false,
            error: 'กรุณาระบุ ID'
          });
        }

        // Check if problem type exists
        const existing = await pool.query(
          'SELECT id FROM problem_types WHERE id = $1',
          [id]
        );

        if (existing.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'ไม่พบประเภทปัญหา'
          });
        }

        if (!categoryId) {
          return res.status(400).json({
            success: false,
            error: 'กรุณาเลือกหมวดหมู่ทรัพย์สิน'
          });
        }

        // Check if name conflict with other records
        if (name) {
          const nameConflict = await pool.query(
            'SELECT id FROM problem_types WHERE name = $1 AND id != $2',
            [name, id]
          );

          if (nameConflict.rows.length > 0) {
            return res.status(400).json({
              success: false,
              error: 'ชื่อประเภทปัญหานี้มีอยู่แล้ว'
            });
          }
        }

        // Update problem type
        const result = await pool.query(`
          UPDATE problem_types
          SET 
            name = COALESCE($1, name),
            description = COALESCE($2, description),
            category_id = COALESCE($3, category_id),
            is_active = COALESCE($4, is_active),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $5
          RETURNING *
        `, [name, description, categoryId, isActive, id]);

        const updatedProblemType = result.rows[0];

        // Get category name
        let categoryName = null;
        if (updatedProblemType.category_id) {
          const catResult = await pool.query('SELECT name FROM categories WHERE id = $1', [updatedProblemType.category_id]);
          if (catResult.rows.length > 0) {
            categoryName = catResult.rows[0].name;
          }
        }

        res.status(200).json({
          success: true,
          data: {
            id: updatedProblemType.id,
            name: updatedProblemType.name,
            description: updatedProblemType.description,
            categoryId: updatedProblemType.category_id,
            categoryName,
            isActive: updatedProblemType.is_active,
            createdAt: updatedProblemType.created_at,
            updatedAt: updatedProblemType.updated_at
          }
        });
        break;
      }

      case 'DELETE': {
        // Check authentication
        const user = await checkAuth(req, res);
        if (!user) return;

        const { id } = req.query;

        if (!id) {
          return res.status(400).json({
            success: false,
            error: 'กรุณาระบุ ID'
          });
        }

        // Check if problem type exists
        const existing = await pool.query(
          'SELECT id FROM problem_types WHERE id = $1',
          [id]
        );

        if (existing.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'ไม่พบประเภทปัญหา'
          });
        }

        // Hard delete - completely remove from database
        await pool.query('DELETE FROM problem_types WHERE id = $1', [id]);

        res.status(200).json({
          success: true,
          message: 'ลบประเภทปัญหาสำเร็จ'
        });
        break;
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในระบบ',
      details: error.message
    });
  }
}

