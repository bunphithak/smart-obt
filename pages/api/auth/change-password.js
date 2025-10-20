// Change Password API
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { withAuth } = require('../../../lib/auth');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'bunphithak',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_obt',
});

const SALT_ROUNDS = 10;

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; // From JWT

    // Validate input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'กรุณากรอกรหัสผ่านเดิมและรหัสผ่านใหม่'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร'
      });
    }

    // Get user
    const result = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบผู้ใช้'
      });
    }

    const user = result.rows[0];

    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'รหัสผ่านเดิมไม่ถูกต้อง'
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, userId]
    );

    res.status(200).json({
      success: true,
      message: 'เปลี่ยนรหัสผ่านสำเร็จ'
    });

  } catch (error) {
    console.error('Change Password API Error:', error);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Protect with JWT authentication
export default withAuth(handler);
