-- Smart OBT Database Schema
-- PostgreSQL Database for Smart OBT System

-- Create database (run this first)
-- CREATE DATABASE smart_obt;

-- Connect to database
-- \c smart_obt;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(20) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB, -- Store permissions as JSON
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    village_id UUID REFERENCES villages(id),
    deleted_at TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Roles junction table (many-to-many)
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false, -- Primary role for display
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(id),
    UNIQUE(user_id, role_id)
);

-- Villages table
CREATE TABLE villages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    location JSONB, -- Store coordinates and address
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Assets table
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category_id UUID REFERENCES categories(id),
    village_id UUID REFERENCES villages(id),
    location VARCHAR(200),
    coordinates JSONB, -- Store lat/lng
    status VARCHAR(20) DEFAULT 'ใช้งานได้' CHECK (status IN ('ใช้งานได้', 'ชำรุด', 'กำลังซ่อม', 'เลิกใช้')),
    value DECIMAL(12,2),
    purchase_date DATE,
    warranty_expiry DATE,
    qr_code VARCHAR(100),
    images JSONB, -- Store array of image URLs
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reports table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id VARCHAR(20) UNIQUE NOT NULL,
    asset_code VARCHAR(50),
    report_type VARCHAR(20) DEFAULT 'repair' CHECK (report_type IN ('repair', 'request')),
    problem_type VARCHAR(50),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'รอดำเนินการ' CHECK (status IN ('รอดำเนินการ', 'กำลังดำเนินการ', 'เสร็จสิ้น', 'ยกเลิก')),
    priority VARCHAR(20) DEFAULT 'ปานกลาง' CHECK (priority IN ('ต่ำ', 'ปานกลาง', 'สูง', 'ฉุกเฉิน')),
    reported_by VARCHAR(100) NOT NULL,
    reporter_phone VARCHAR(20),
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_to UUID REFERENCES users(id),
    images JSONB, -- Store array of image URLs
    location VARCHAR(200),
    coordinates JSONB, -- Store lat/lng
    referrer_url VARCHAR(500), -- Store the page where the report was submitted from
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Repairs table
CREATE TABLE repairs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES reports(id),
    asset_code VARCHAR(50),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'รอดำเนินการ' CHECK (status IN ('รอดำเนินการ', 'กำลังดำเนินการ', 'เสร็จสิ้น', 'ยกเลิก')),
    priority VARCHAR(20) DEFAULT 'ปานกลาง' CHECK (priority IN ('ต่ำ', 'ปานกลาง', 'สูง', 'ฉุกเฉิน')),
    assigned_to UUID REFERENCES users(id),
    estimated_cost DECIMAL(12,2),
    actual_cost DECIMAL(12,2),
    due_date DATE,
    start_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    images JSONB, -- Store array of image URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Repair feedback table
CREATE TABLE repair_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repair_id UUID REFERENCES repairs(id),
    report_id UUID REFERENCES reports(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    feedback_by VARCHAR(100),
    feedback_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_assets_code ON assets(code);
CREATE INDEX idx_assets_category ON assets(category_id);
CREATE INDEX idx_assets_village ON assets(village_id);
CREATE INDEX idx_assets_status ON assets(status);

CREATE INDEX idx_reports_ticket_id ON reports(ticket_id);
CREATE INDEX idx_reports_asset_code ON reports(asset_code);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_reported_at ON reports(reported_at);

CREATE INDEX idx_repairs_report_id ON repairs(report_id);
CREATE INDEX idx_repairs_status ON repairs(status);
CREATE INDEX idx_repairs_assigned_to ON repairs(assigned_to);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_villages_updated_at BEFORE UPDATE ON villages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_repairs_updated_at BEFORE UPDATE ON repairs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert roles data
INSERT INTO roles (name, display_name, description, permissions) VALUES
('admin', 'ผู้ดูแลระบบ', 'ผู้ดูแลระบบทั้งหมด มีสิทธิ์เข้าถึงทุกฟีเจอร์', '{"users": ["create", "read", "update", "delete"], "assets": ["create", "read", "update", "delete"], "reports": ["create", "read", "update", "delete"], "repairs": ["create", "read", "update", "delete"], "villages": ["create", "read", "update", "delete"], "categories": ["create", "read", "update", "delete"]}'),
('technician', 'ช่างซ่อม', 'ช่างซ่อมบำรุง รับผิดชอบการซ่อมแซมทรัพย์สิน', '{"assets": ["read"], "reports": ["read", "update"], "repairs": ["create", "read", "update"], "villages": ["read"], "categories": ["read"]}');

-- Insert sample data
INSERT INTO villages (name, description, location) VALUES
('หมู่ 1', 'หมู่บ้านหลัก', '{"lat": 12.3456, "lng": 98.7654, "address": "หมู่ 1 ตำบลละหาร อำเภอปลวกแดง จังหวัดระยอง"}'),
('หมู่ 2', 'หมู่บ้านศาลา', '{"lat": 12.3466, "lng": 98.7664, "address": "หมู่ 2 ตำบลละหาร อำเภอปลวกแดง จังหวัดระยอง"}'),
('หมู่ 3', 'หมู่บ้านโรงเรียน', '{"lat": 12.3476, "lng": 98.7674, "address": "หมู่ 3 ตำบลละหาร อำเภอปลวกแดง จังหวัดระยอง"}'),
('หมู่ 4', 'หมู่บ้านสวน', '{"lat": 12.3486, "lng": 98.7684, "address": "หมู่ 4 ตำบลละหาร อำเภอปลวกแดง จังหวัดระยอง"}'),
('หมู่ 5', 'หมู่บ้านใหม่', '{"lat": 12.3496, "lng": 98.7694, "address": "หมู่ 5 ตำบลละหาร อำเภอปลวกแดง จังหวัดระยอง"}');

INSERT INTO categories (name, description) VALUES
('ไฟส่องสว่าง', 'เสาไฟถนน เสาไฟสาธารณะ โคมไฟ LED และระบบไฟส่องสว่างทุกประเภท');

INSERT INTO users (username, email, password_hash, name, phone) VALUES
('admin', 'admin@smart-obt.com', '$2b$10$example_hash', 'ผู้ดูแลระบบ', '081-234-5678'),
('chang_a', 'changa@smart-obt.com', '$2b$10$example_hash', 'ช่าง A', '082-345-6789'),
('chang_b', 'changb@smart-obt.com', '$2b$10$example_hash', 'ช่าง B', '083-456-7890'),
('manager', 'manager@smart-obt.com', '$2b$10$example_hash', 'ผู้จัดการ', '084-567-8901');

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id, is_primary) VALUES
-- Admin users
((SELECT id FROM users WHERE username = 'admin'), (SELECT id FROM roles WHERE name = 'admin'), true),
((SELECT id FROM users WHERE username = 'manager'), (SELECT id FROM roles WHERE name = 'admin'), true),
-- Technician users
((SELECT id FROM users WHERE username = 'chang_a'), (SELECT id FROM roles WHERE name = 'technician'), true),
((SELECT id FROM users WHERE username = 'chang_b'), (SELECT id FROM roles WHERE name = 'technician'), true),
((SELECT id FROM users WHERE username = 'change1'), (SELECT id FROM roles WHERE name = 'technician'), true);

-- Generate sample assets
INSERT INTO assets (code, name, category_id, village_id, location, status, value, qr_code)
SELECT 
    'LIGHT-' || LPAD(ROW_NUMBER() OVER()::TEXT, 3, '0') as code,
    CASE 
        WHEN ROW_NUMBER() OVER() % 4 = 1 THEN 'เสาไฟ LED ถนนหลัก'
        WHEN ROW_NUMBER() OVER() % 4 = 2 THEN 'เสาไฟซอย'
        WHEN ROW_NUMBER() OVER() % 4 = 3 THEN 'เสาไฟสวนสาธารณะ'
        ELSE 'เสาไฟหน้าศาลา'
    END as name,
    (SELECT id FROM categories WHERE name = 'ไฟส่องสว่าง') as category_id,
    (SELECT id FROM villages ORDER BY RANDOM() LIMIT 1) as village_id,
    CASE 
        WHEN ROW_NUMBER() OVER() % 5 = 1 THEN 'ถนนสายหลัก'
        WHEN ROW_NUMBER() OVER() % 5 = 2 THEN 'ซอย 1'
        WHEN ROW_NUMBER() OVER() % 5 = 3 THEN 'ซอย 2'
        WHEN ROW_NUMBER() OVER() % 5 = 4 THEN 'ซอย 3'
        ELSE 'หน้าหมู่บ้าน'
    END as location,
    CASE 
        WHEN ROW_NUMBER() OVER() % 3 = 1 THEN 'ใช้งานได้'
        WHEN ROW_NUMBER() OVER() % 3 = 2 THEN 'ชำรุด'
        ELSE 'กำลังซ่อม'
    END as status,
    (8000 + (RANDOM() * 15000))::DECIMAL(12,2) as value,
    'QR-' || LPAD(ROW_NUMBER() OVER()::TEXT, 6, '0') as qr_code
FROM generate_series(1, 50);

-- Create a view for dashboard statistics
CREATE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM assets) as total_assets,
    (SELECT COUNT(*) FROM reports) as total_reports,
    (SELECT COUNT(*) FROM repairs WHERE status = 'รอดำเนินการ') as pending_repairs,
    (SELECT COUNT(*) FROM repairs WHERE status = 'เสร็จสิ้น') as completed_repairs,
    (SELECT COUNT(*) FROM assets WHERE status = 'ชำรุด') as damaged_assets,
    (SELECT COUNT(*) FROM reports WHERE status = 'รอดำเนินการ') as pending_reports;

-- Grant permissions (if needed)
-- GRANT ALL PRIVILEGES ON DATABASE smart_obt TO your_username;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_username;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_username;
