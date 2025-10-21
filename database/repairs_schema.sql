-- Repairs Schema
-- repairs and repair_feedback tables with related indexes

-- ==============================================
-- REPAIRS TABLE
-- ==============================================

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
    location VARCHAR(200), -- Location name/address
    latitude DECIMAL(10,8), -- GPS latitude
    longitude DECIMAL(11,8), -- GPS longitude
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- REPAIR FEEDBACK TABLE
-- ==============================================

CREATE TABLE repair_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repair_id UUID REFERENCES repairs(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    feedback_by VARCHAR(100), -- Name of person giving feedback
    feedback_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- INDEXES FOR REPAIRS TABLES
-- ==============================================

CREATE INDEX idx_repairs_report_id ON repairs(report_id);
CREATE INDEX idx_repairs_assigned_to ON repairs(assigned_to);
CREATE INDEX idx_repairs_status ON repairs(status);
CREATE INDEX idx_repairs_due_date ON repairs(due_date);

-- ==============================================
-- COMMENTS FOR REPAIRS TABLES
-- ==============================================

COMMENT ON TABLE repairs IS 'ตารางงานซ่อมบำรุง';
COMMENT ON COLUMN repairs.asset_code IS 'รหัสทรัพย์สินที่เกี่ยวข้อง';
COMMENT ON COLUMN repairs.status IS 'สถานะงานซ่อม (รอดำเนินการ, กำลังดำเนินการ, เสร็จสิ้น, ยกเลิก)';
COMMENT ON COLUMN repairs.priority IS 'ความสำคัญ (ต่ำ, ปานกลาง, สูง, ฉุกเฉิน)';
COMMENT ON COLUMN repairs.estimated_cost IS 'งบประมาณที่คาดการณ์ (บาท)';
COMMENT ON COLUMN repairs.actual_cost IS 'ค่าใช้จ่ายจริง (บาท)';
COMMENT ON COLUMN repairs.location IS 'ตำแหน่งที่ซ่อม';
COMMENT ON COLUMN repairs.latitude IS 'พิกัดละติจูด';
COMMENT ON COLUMN repairs.longitude IS 'พิกัดลองจิจูด';
COMMENT ON COLUMN repairs.images IS 'รูปภาพงานซ่อม (JSON array)';

COMMENT ON TABLE repair_feedback IS 'ตารางความคิดเห็นงานซ่อม';
COMMENT ON COLUMN repair_feedback.rating IS 'คะแนน (1-5)';
COMMENT ON COLUMN repair_feedback.comment IS 'ความคิดเห็น';
COMMENT ON COLUMN repair_feedback.feedback_by IS 'ชื่อผู้ให้ความคิดเห็น';
COMMENT ON COLUMN repair_feedback.feedback_phone IS 'เบอร์โทรผู้ให้ความคิดเห็น';
