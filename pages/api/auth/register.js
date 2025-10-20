// Register API
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'bunphithak',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_obt',
});

const SALT_ROUNDS = 10;

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
    const { 
      username, 
      password, 
      email, 
      fullName, 
      role, 
      villageId,
      phone 
    } = req.body;

    // Validate input
    if (!username || !password || !email || !fullName || !role) {
      return res.status(400).json({
        success: false,
        error: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }

    // Validate role
    const validRoles = ['admin', 'technician', 'user'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Role ไม่ถูกต้อง'
      });
    }

    // Check if username already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username.trim()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว'
      });
    }

    // Check if email already exists
    const existingEmail = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.trim()]
    );

    if (existingEmail.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'อีเมลนี้มีอยู่ในระบบแล้ว'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user
    const result = await pool.query(`
      INSERT INTO users (
        username, password_hash, email, name, role, 
        phone, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING id, username, email, name, role, phone, created_at
    `, [
      username.trim(),
      passwordHash,
      email.trim(),
      fullName.trim(),
      role,
      phone?.trim() || null
    ]);

    const newUser = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'ลงทะเบียนสำเร็จ',
      data: {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          fullName: newUser.name,
          role: newUser.role,
          phone: newUser.phone,
          createdAt: newUser.created_at
        }
      }
    });

  } catch (error) {
    console.error('Register API Error:', error);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการลงทะเบียน',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
