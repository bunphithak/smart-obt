// Login API with JWT Authentication
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { generateToken, generateRefreshToken } = require('../../../lib/auth');

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
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน'
      });
    }

    // Query user from database
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND is_active = true AND deleted_at IS NULL',
      [username.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
      });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
      });
    }

    // Get user roles
    const rolesResult = await pool.query(`
      SELECT r.name, r.display_name, ur.is_primary
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = $1 AND r.is_active = true
      ORDER BY ur.is_primary DESC, r.name
    `, [user.id]);

    if (rolesResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'คุณไม่มีสิทธิ์เข้าใช้งานระบบนี้'
      });
    }

    const roles = rolesResult.rows.map(r => r.name);
    const primaryRole = rolesResult.rows[0].name;

    // Check if user has admin or technician role
    if (!roles.includes('admin') && !roles.includes('technician')) {
      return res.status(403).json({
        success: false,
        error: 'คุณไม่มีสิทธิ์เข้าใช้งานระบบนี้'
      });
    }

    // Generate tokens
    const tokenPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.name,
      role: primaryRole, // Primary role for backward compatibility
      roles: roles // All roles array
    };

    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Return success with tokens
    res.status(200).json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.name,
          role: primaryRole, // Primary role for backward compatibility
          roles: roles, // All roles
          phone: user.phone
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login API Error:', error);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
