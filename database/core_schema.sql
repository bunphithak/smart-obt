-- Core Tables Schema
-- roles, villages, categories, users, user_roles

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- ROLES TABLE
-- ==============================================

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

-- ==============================================
-- VILLAGES TABLE
-- ==============================================

CREATE TABLE villages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(10),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- CATEGORIES TABLE
-- ==============================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50), -- Icon class or URL
    color VARCHAR(20), -- Color code
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- USERS TABLE
-- ==============================================

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

-- ==============================================
-- USER ROLES JUNCTION TABLE
-- ==============================================

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false, -- Primary role for display
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(id),
    UNIQUE(user_id, role_id)
);

-- ==============================================
-- INDEXES FOR CORE TABLES
-- ==============================================

-- Users indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_village_id ON users(village_id);
CREATE INDEX idx_users_is_active ON users(is_active);

-- ==============================================
-- INITIAL DATA FOR CORE TABLES
-- ==============================================

-- Insert default roles
INSERT INTO roles (name, display_name, description, permissions) VALUES
('admin', 'ผู้ดูแลระบบ', 'ผู้ดูแลระบบทั้งหมด', '{"all": true}'),
('technician', 'ช่างเทคนิค', 'ช่างซ่อมบำรุง', '{"repairs": true, "assets": true}'),
('staff', 'เจ้าหน้าที่', 'เจ้าหน้าที่ทั่วไป', '{"reports": true, "assets": true}');

-- Insert default categories
INSERT INTO categories (name, description, icon, color) VALUES
('ไฟฟ้า', 'ระบบไฟฟ้าและแสงสว่าง', 'fas fa-bolt', '#FFD700'),
('ประปา', 'ระบบประปาและน้ำ', 'fas fa-tint', '#00BFFF'),
('ถนน', 'ถนนและทางเดิน', 'fas fa-road', '#8B4513'),
('อาคาร', 'อาคารและสิ่งปลูกสร้าง', 'fas fa-building', '#696969'),
('สวนสาธารณะ', 'สวนสาธารณะและพื้นที่สีเขียว', 'fas fa-tree', '#32CD32');

-- Insert default villages (example)
INSERT INTO villages (name, district, province, postal_code) VALUES
('บ้านละหาร', 'ปลวกแดง', 'ระยอง', '21140'),
('บ้านหนองแฟบ', 'ปลวกแดง', 'ระยอง', '21140'),
('บ้านทุ่งกราด', 'ปลวกแดง', 'ระยอง', '21140');

-- ==============================================
-- COMMENTS FOR CORE TABLES
-- ==============================================

COMMENT ON TABLE roles IS 'ตารางบทบาทผู้ใช้งาน';
COMMENT ON TABLE villages IS 'ตารางหมู่บ้าน';
COMMENT ON TABLE categories IS 'ตารางหมวดหมู่ทรัพย์สิน';
COMMENT ON TABLE users IS 'ตารางผู้ใช้งาน';
COMMENT ON TABLE user_roles IS 'ตารางความสัมพันธ์ผู้ใช้-บทบาท';
