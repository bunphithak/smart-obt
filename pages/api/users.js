// Users API - Connected to PostgreSQL with JWT Protection
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { withAuth } = require('../../lib/auth');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'bunphithak',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_obt',
});

const SALT_ROUNDS = 10;

async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        const { id, role, villageId } = req.query;
        
        if (id) {
          // Get single user with roles
          const userResult = await pool.query(`
            SELECT 
              u.id, u.username, u.email, u.name, 
              u.phone, u.is_active, u.village_id,
              u.created_at, u.updated_at
            FROM users u
            WHERE u.id = $1
          `, [id]);

          if (userResult.rows.length === 0) {
            return res.status(404).json({
              success: false,
              error: 'ไม่พบผู้ใช้'
            });
          }

          const user = userResult.rows[0];
          
          // Get user roles
          const rolesResult = await pool.query(`
            SELECT 
              r.id, r.name, r.display_name, r.permissions,
              ur.is_primary
            FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = $1 AND r.is_active = true
            ORDER BY ur.is_primary DESC, r.name
          `, [id]);

          const roles = rolesResult.rows.map(row => ({
            id: row.id,
            name: row.name,
            displayName: row.display_name,
            permissions: row.permissions,
            isPrimary: row.is_primary
          }));

          res.status(200).json({
            success: true,
            data: {
              id: user.id,
              username: user.username,
              email: user.email,
              fullName: user.name,
              roles: roles,
              phone: user.phone,
              isActive: user.is_active,
              villageId: user.village_id,
              createdAt: user.created_at,
              updatedAt: user.updated_at
            }
          });
        } else {
          // Get all users with filters
          let query = `
            SELECT 
              u.id, u.username, u.email, u.name, 
              u.phone, u.is_active, u.village_id,
              u.created_at, u.updated_at
            FROM users u
            WHERE u.deleted_at IS NULL
          `;
          const queryParams = [];
          let paramIndex = 1;

          if (role) {
            // Filter by role using user_roles table
            query += ` AND u.id IN (
              SELECT ur.user_id 
              FROM user_roles ur 
              JOIN roles r ON ur.role_id = r.id 
              WHERE r.name = $${paramIndex} AND r.is_active = true
            )`;
            queryParams.push(role);
            paramIndex++;
          }

          if (villageId) {
            query += ` AND u.village_id = $${paramIndex}`;
            queryParams.push(villageId);
            paramIndex++;
          }

          query += ` ORDER BY u.created_at DESC`;

          const result = await pool.query(query, queryParams);
          
          // Get roles for each user
          const users = await Promise.all(result.rows.map(async (row) => {
            const rolesResult = await pool.query(`
              SELECT 
                r.id, r.name, r.display_name, r.permissions,
                ur.is_primary
              FROM user_roles ur
              JOIN roles r ON ur.role_id = r.id
              WHERE ur.user_id = $1 AND r.is_active = true
              ORDER BY ur.is_primary DESC, r.name
            `, [row.id]);

            const roles = rolesResult.rows.map(roleRow => ({
              id: roleRow.id,
              name: roleRow.name,
              displayName: roleRow.display_name,
              permissions: roleRow.permissions,
              isPrimary: roleRow.is_primary
            }));

            return {
              id: row.id,
              username: row.username,
              email: row.email,
              fullName: row.name,
              roles: roles,
              phone: row.phone,
              isActive: row.is_active,
              villageId: row.village_id,
              createdAt: row.created_at,
              updatedAt: row.updated_at
            };
          }));

          res.status(200).json({
            success: true,
            data: users,
            total: users.length
          });
        }
        break;
      }

      case 'POST': {
        const { 
          username, 
          password, 
          email, 
          fullName, 
          roles: userRoles, 
          villageId: userVillageId,
          phone 
        } = req.body;

        // Only admin can create users
        if (req.user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            error: 'ไม่มีสิทธิ์สร้างผู้ใช้'
          });
        }

        if (!username || !password || !email || !fullName || !userRoles || userRoles.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'กรุณากรอกข้อมูลให้ครบถ้วน'
          });
        }

        // Check if username exists
        const existingUser = await pool.query(
          'SELECT id FROM users WHERE username = $1',
          [username.trim()]
        );

        if (existingUser.rows.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'ชื่อผู้ใช้นี้มีอยู่แล้ว'
          });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Use transaction to create user and roles
        const client = await pool.connect();
        try {
          await client.query('BEGIN');

          // Create user (without role column)
          const newUserResult = await client.query(`
            INSERT INTO users (
              username, password_hash, email, name,
              phone, village_id, is_active
            )
            VALUES ($1, $2, $3, $4, $5, $6, true)
            RETURNING id, username, email, name, phone, village_id, created_at
          `, [
            username.trim(),
            passwordHash,
            email.trim(),
            fullName.trim(),
            phone?.trim() || null,
            userVillageId || null
          ]);

          const newUser = newUserResult.rows[0];

          // Create user_roles
          for (let i = 0; i < userRoles.length; i++) {
            const roleId = userRoles[i];
            const isPrimary = i === 0; // First role is primary
            
            await client.query(`
              INSERT INTO user_roles (user_id, role_id, is_primary)
              VALUES ($1, $2, $3)
            `, [newUser.id, roleId, isPrimary]);
          }

          await client.query('COMMIT');

          // Get created user with roles
          const rolesResult = await pool.query(`
            SELECT 
              r.id, r.name, r.display_name, r.permissions,
              ur.is_primary
            FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = $1 AND r.is_active = true
            ORDER BY ur.is_primary DESC, r.name
          `, [newUser.id]);

          const roles = rolesResult.rows.map(row => ({
            id: row.id,
            name: row.name,
            displayName: row.display_name,
            permissions: row.permissions,
            isPrimary: row.is_primary
          }));

          res.status(201).json({
            success: true,
            data: {
              id: newUser.id,
              username: newUser.username,
              email: newUser.email,
              fullName: newUser.name,
              roles: roles,
              phone: newUser.phone,
              isActive: true,
              villageId: newUser.village_id,
              createdAt: newUser.created_at
            }
          });
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
        break;
      }

      case 'PUT': {
        const { 
          id: updateId, 
          email: updateEmail, 
          fullName: updateFullName, 
          roles: updateRoles, 
          phone: updatePhone, 
          villageId: updateVillageId,
          isActive: updateIsActive 
        } = req.body;

        if (!updateId) {
          return res.status(400).json({
            success: false,
            error: 'ไม่พบ ID ของผู้ใช้'
          });
        }

        // Only admin can update other users
        if (req.user.role !== 'admin' && req.user.id !== updateId) {
          return res.status(403).json({
            success: false,
            error: 'ไม่มีสิทธิ์แก้ไขผู้ใช้คนอื่น'
          });
        }

        // Use transaction to update user and roles
        const client = await pool.connect();
        try {
          await client.query('BEGIN');

          // Update user (without role column)
          const updateResult = await client.query(`
            UPDATE users 
            SET email = COALESCE($2, email),
                name = COALESCE($3, name),
                phone = COALESCE($4, phone),
                village_id = COALESCE($5, village_id),
                is_active = COALESCE($6, is_active),
                updated_at = NOW()
            WHERE id = $1
            RETURNING id, username, email, name, phone, village_id, is_active
          `, [
            updateId,
            updateEmail?.trim(),
            updateFullName?.trim(),
            updatePhone?.trim(),
            updateVillageId,
            updateIsActive
          ]);

          if (updateResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
              success: false,
              error: 'ไม่พบผู้ใช้ที่ต้องการอัปเดต'
            });
          }

          // Update roles if provided
          if (updateRoles && updateRoles.length > 0) {
            // Delete existing roles
            await client.query('DELETE FROM user_roles WHERE user_id = $1', [updateId]);
            
            // Insert new roles
            for (let i = 0; i < updateRoles.length; i++) {
              const roleId = updateRoles[i];
              const isPrimary = i === 0; // First role is primary
              
              await client.query(`
                INSERT INTO user_roles (user_id, role_id, is_primary)
                VALUES ($1, $2, $3)
              `, [updateId, roleId, isPrimary]);
            }
          }

          await client.query('COMMIT');

          // Get updated user with roles
          const rolesResult = await pool.query(`
            SELECT 
              r.id, r.name, r.display_name, r.permissions,
              ur.is_primary
            FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = $1 AND r.is_active = true
            ORDER BY ur.is_primary DESC, r.name
          `, [updateId]);

          const roles = rolesResult.rows.map(row => ({
            id: row.id,
            name: row.name,
            displayName: row.display_name,
            permissions: row.permissions,
            isPrimary: row.is_primary
          }));

          const updatedUser = updateResult.rows[0];
          res.status(200).json({
            success: true,
            message: 'อัปเดตข้อมูลผู้ใช้สำเร็จ',
            data: {
              id: updatedUser.id,
              username: updatedUser.username,
              email: updatedUser.email,
              fullName: updatedUser.name,
              roles: roles,
              phone: updatedUser.phone,
              isActive: updatedUser.is_active,
              villageId: updatedUser.village_id
            }
          });
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
        break;
      }

      case 'DELETE': {
        const { id: deleteId } = req.query;

        if (!deleteId) {
          return res.status(400).json({
            success: false,
            error: 'ไม่พบ ID ของผู้ใช้'
          });
        }

        // Only admin can delete users
        if (req.user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            error: 'ไม่มีสิทธิ์ลบผู้ใช้'
          });
        }

        // Soft delete (set deleted_at timestamp)
        const deleteResult = await pool.query(
          'UPDATE users SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING id',
          [deleteId]
        );

        if (deleteResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'ไม่พบผู้ใช้ที่ต้องการลบ'
          });
        }

        res.status(200).json({
          success: true,
          message: 'ลบผู้ใช้สำเร็จ'
        });
        break;
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }

  } catch (error) {
    console.error('Users API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Protect with JWT authentication (admin or technician roles)
export default withAuth(handler, { roles: ['admin', 'technician'] });