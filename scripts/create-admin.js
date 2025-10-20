#!/usr/bin/env node
// Script to create initial admin user
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const readline = require('readline');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'bunphithak',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_obt',
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  console.log('\n🔐 สร้าง Admin User สำหรับระบบ Smart OBT\n');

  try {
    // Check if admin already exists
    const existingAdmin = await pool.query(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
    );

    if (existingAdmin.rows.length > 0) {
      console.log('⚠️  มี Admin user อยู่ในระบบแล้ว');
      const overwrite = await question('ต้องการสร้าง Admin user ใหม่อีกหรือไม่? (y/n): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('ยกเลิกการสร้าง Admin user');
        rl.close();
        process.exit(0);
      }
    }

    // Get user input
    const username = await question('Username (ต้องไม่มีในระบบ): ');
    const password = await question('Password (อย่างน้อย 6 ตัวอักษร): ');
    const email = await question('Email: ');
    const fullName = await question('ชื่อ-นามสกุล: ');
    const phone = await question('เบอร์โทรศัพท์ (optional): ');

    // Validate
    if (!username || !password || !email || !fullName) {
      console.error('❌ กรุณากรอกข้อมูลให้ครบถ้วน');
      rl.close();
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('❌ รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      rl.close();
      process.exit(1);
    }

    // Check if username exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      console.error('❌ Username นี้มีในระบบแล้ว');
      rl.close();
      process.exit(1);
    }

    // Hash password
    console.log('\n🔄 กำลังสร้าง Admin user...');
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(`
      INSERT INTO users (
        username, password_hash, email, full_name, role, phone, is_active
      )
      VALUES ($1, $2, $3, $4, 'admin', $5, true)
      RETURNING id, username, email, full_name, role, created_at
    `, [username, passwordHash, email, fullName, phone || null]);

    const newAdmin = result.rows[0];

    console.log('\n✅ สร้าง Admin user สำเร็จ!\n');
    console.log('📋 ข้อมูล Admin:');
    console.log(`   ID: ${newAdmin.id}`);
    console.log(`   Username: ${newAdmin.username}`);
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   ชื่อ: ${newAdmin.full_name}`);
    console.log(`   Role: ${newAdmin.role}`);
    console.log(`   Created: ${newAdmin.created_at}`);
    console.log('\n🎉 สามารถใช้ username และ password นี้เข้าสู่ระบบได้แล้ว\n');

    rl.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ เกิดข้อผิดพลาด:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }
    rl.close();
    process.exit(1);
  }
}

// Run
createAdmin();
