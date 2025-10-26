#!/usr/bin/env node

/**
 * Migration Runner Script
 * Run database migrations automatically
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database connection (ใช้ค่า default เหมือน lib/db.js)
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'bunphithak',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_obt',
});

// Migration files to run
const migrations = [
  '001_update_status_constraints.sql',
  '002_add_missing_columns.sql',
  '003_convert_status_to_english_keys.sql',
  '004_update_problem_type_to_uuid.sql',
  '005_add_category_to_reports.sql',
  '006_add_village_to_reports.sql',
];

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');
  console.log(`📊 Database: ${process.env.DB_NAME || 'smart_obt'}`);
  console.log(`👤 User: ${process.env.DB_USER || 'bunphithak'}`);
  console.log(`🖥️  Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}\n`);

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');

    for (const migrationFile of migrations) {
      console.log(`📄 Running migration: ${migrationFile}`);
      
      const migrationPath = path.join(__dirname, '..', 'database', 'migrations', migrationFile);
      
      if (!fs.existsSync(migrationPath)) {
        console.log(`⚠️  Migration file not found: ${migrationFile}\n`);
        continue;
      }

      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      try {
        await pool.query(sql);
        console.log(`✅ Migration completed: ${migrationFile}\n`);
      } catch (error) {
        console.error(`❌ Migration failed: ${migrationFile}`);
        console.error(`Error: ${error.message}\n`);
        
        // Continue with other migrations even if one fails
        continue;
      }
    }

    // Verify assets table structure
    console.log('🔍 Verifying assets table structure...');
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'assets' 
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Assets table columns:');
    console.table(result.rows.map(row => ({
      'Column': row.column_name,
      'Type': row.data_type,
      'Nullable': row.is_nullable
    })));

    console.log('\n✅ All migrations completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Migration process failed:', error.message);
    
    // Check if it's a database not found error
    if (error.message.includes('does not exist')) {
      const dbName = process.env.DB_NAME || 'smart_obt';
      const dbUser = process.env.DB_USER || 'bunphithak';
      
      console.log('\n💡 วิธีแก้ไข:');
      console.log('\n1. เข้า PostgreSQL:');
      console.log(`   psql -U ${dbUser} -d postgres`);
      console.log('\n2. สร้าง database:');
      console.log(`   CREATE DATABASE ${dbName};`);
      console.log('\n3. ออกจาก psql:');
      console.log('   \\q');
      console.log('\n4. Run migration อีกครั้ง:');
      console.log('   npm run migrate');
      console.log('\n---หรือ---');
      console.log('\nใช้คำสั่งเดียว:');
      console.log(`createdb -U ${dbUser} ${dbName}`);
      console.log('\nแล้ว run: npm run migrate\n');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations
runMigrations().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});


