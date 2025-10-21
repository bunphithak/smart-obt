-- Assets Schema
-- assets table and related indexes

-- ==============================================
-- ASSETS TABLE
-- ==============================================

CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    category_id UUID REFERENCES categories(id),
    village_id UUID REFERENCES villages(id),
    description TEXT,
    status VARCHAR(20) DEFAULT 'ใช้งานได้' CHECK (status IN ('ใช้งานได้', 'ชำรุด', 'เสื่อมสภาพ', 'สูญหาย')),
    value DECIMAL(12,2), -- Asset value in THB
    purchase_date DATE,
    location_name VARCHAR(200), -- Human readable location
    location_address TEXT, -- Full address
    latitude DECIMAL(10,8), -- GPS latitude
    longitude DECIMAL(11,8), -- GPS longitude
    qr_code VARCHAR(200), -- QR code path/URL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- INDEXES FOR ASSETS TABLE
-- ==============================================

CREATE INDEX idx_assets_code ON assets(code);
CREATE INDEX idx_assets_category_id ON assets(category_id);
CREATE INDEX idx_assets_village_id ON assets(village_id);
CREATE INDEX idx_assets_status ON assets(status);

-- ==============================================
-- COMMENTS FOR ASSETS TABLE
-- ==============================================

COMMENT ON TABLE assets IS 'ตารางทรัพย์สินสาธารณะ';
COMMENT ON COLUMN assets.code IS 'รหัสทรัพย์สิน (UNIQUE)';
COMMENT ON COLUMN assets.status IS 'สถานะทรัพย์สิน (ใช้งานได้, ชำรุด, เสื่อมสภาพ, สูญหาย)';
COMMENT ON COLUMN assets.value IS 'มูลค่าทรัพย์สิน (บาท)';
COMMENT ON COLUMN assets.qr_code IS 'QR Code path/URL';
COMMENT ON COLUMN assets.latitude IS 'พิกัดละติจูด';
COMMENT ON COLUMN assets.longitude IS 'พิกัดลองจิจูด';
