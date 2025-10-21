#!/usr/bin/env node

/**
 * Database Creation Script
 * สร้าง database และ setup เบื้องต้น
 */

const { Client } = require('pg');
require('dotenv').config();

const dbName = process.env.DB_NAME || 'smart_obt';
const dbUser = process.env.DB_USER || 'bunphithak';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 5432;
const dbPassword = process.env.DB_PASSWORD || '';

async function createDatabase() {
  console.log('🚀 Database Setup Script\n');
  console.log(`📊 Database to create: ${dbName}`);
  console.log(`👤 User: ${dbUser}`);
  console.log(`🖥️  Host: ${dbHost}:${dbPort}\n`);

  // Connect to postgres database to create new database
  const client = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: 'postgres', // Connect to default postgres db
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Check if database exists
    const checkDb = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkDb.rows.length > 0) {
      console.log(`⚠️  Database "${dbName}" already exists!`);
      console.log(`\nSkipping database creation.`);
      console.log(`\nYou can now run: npm run migrate\n`);
    } else {
      // Create database
      console.log(`📝 Creating database "${dbName}"...`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database "${dbName}" created successfully!\n`);

      // Create UUID extension
      console.log('🔧 Setting up extensions...');
      const dbClient = new Client({
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
        database: dbName,
      });

      await dbClient.connect();
      await dbClient.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      console.log('✅ UUID extension created\n');
      await dbClient.end();

      console.log('🎉 Database setup completed!\n');
      console.log('Next steps:');
      console.log('1. Run migrations: npm run migrate');
      console.log('2. Create admin user: npm run create-admin\n');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 วิธีแก้ไข:');
      console.log('\n1. ตรวจสอบ PostgreSQL password:');
      console.log(`   - User: ${dbUser}`);
      console.log(`   - Password: ${dbPassword || '(empty)'}`);
      console.log('\n2. สร้างไฟล์ .env และตั้งค่า:');
      console.log('   DB_USER=your_postgres_user');
      console.log('   DB_PASSWORD=your_postgres_password');
      console.log('   DB_NAME=smart_obt');
      console.log('   DB_HOST=localhost');
      console.log('   DB_PORT=5432\n');
    } else if (error.message.includes('connection refused')) {
      console.log('\n💡 วิธีแก้ไข:');
      console.log('\n1. ตรวจสอบว่า PostgreSQL ทำงานอยู่หรือไม่:');
      console.log('   brew services list');
      console.log('\n2. Start PostgreSQL:');
      console.log('   brew services start postgresql@14\n');
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run script
createDatabase();

