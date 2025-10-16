// Database connection and query helpers
// This is a template - configure based on your database choice (MySQL, PostgreSQL, MongoDB, etc.)

// Example for MySQL/MariaDB using mysql2
// npm install mysql2

/*
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_obt',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const db = {
  async query(sql, params) {
    const [results] = await pool.execute(sql, params);
    return results;
  },

  async getConnection() {
    return await pool.getConnection();
  }
};
*/

// Example for PostgreSQL using pg
// npm install pg

/*
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_obt',
  port: process.env.DB_PORT || 5432,
});

export const db = {
  async query(text, params) {
    const result = await pool.query(text, params);
    return result.rows;
  },

  async getClient() {
    return await pool.connect();
  }
};
*/

// Example for MongoDB using mongoose
// npm install mongoose

/*
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_obt';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export const db = {
  connect: connectDB,
  mongoose
};
*/

// Temporary mock database for development
// Replace this with actual database connection
export const db = {
  query: async (sql, params) => {
    console.log('Mock DB Query:', sql, params);
    return [];
  },

  getConnection: async () => {
    console.log('Mock DB Connection');
    return null;
  }
};

// Database initialization SQL (for MySQL/PostgreSQL)
// Run this to create your database schema

export const initSQL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'technician', 'user') DEFAULT 'user',
  village_id INT,
  phone VARCHAR(20),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Villages table
CREATE TABLE IF NOT EXISTS villages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  address TEXT,
  contact_person VARCHAR(100),
  contact_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(50),
  village_id INT NOT NULL,
  description TEXT,
  status ENUM('ใช้งานได้', 'ชำรุด', 'กำลังซ่อม', 'จำหน่าย') DEFAULT 'ใช้งานได้',
  qr_code VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (village_id) REFERENCES villages(id) ON DELETE CASCADE
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  asset_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  priority ENUM('ต่ำ', 'ปานกลาง', 'สูง', 'ฉุกเฉิน') DEFAULT 'ปานกลาง',
  status ENUM('รอดำเนินการ', 'กำลังดำเนินการ', 'เสร็จสิ้น', 'ยกเลิก') DEFAULT 'รอดำเนินการ',
  reported_by VARCHAR(100),
  images JSON,
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

-- Repairs table
CREATE TABLE IF NOT EXISTS repairs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  report_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  assigned_to VARCHAR(100) NOT NULL,
  priority ENUM('ต่ำ', 'ปานกลาง', 'สูง', 'ฉุกเฉิน') DEFAULT 'ปานกลาง',
  status ENUM('รอดำเนินการ', 'กำลังดำเนินการ', 'เสร็จสิ้น', 'ยกเลิก') DEFAULT 'รอดำเนินการ',
  estimated_cost DECIMAL(10, 2) DEFAULT 0,
  actual_cost DECIMAL(10, 2),
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_date TIMESTAMP NULL,
  notes TEXT,
  images JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_assets_village ON assets(village_id);
CREATE INDEX idx_reports_asset ON reports(asset_id);
CREATE INDEX idx_repairs_report ON repairs(report_id);
CREATE INDEX idx_users_village ON users(village_id);
`;

