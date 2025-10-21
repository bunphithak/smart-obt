-- Reports Schema
-- reports table and related indexes

-- ==============================================
-- REPORTS TABLE
-- ==============================================

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id VARCHAR(20) UNIQUE NOT NULL,
    asset_code VARCHAR(50),
    report_type VARCHAR(20) DEFAULT 'repair' CHECK (report_type IN ('repair', 'request')),
    problem_type VARCHAR(50),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'รอดำเนินการ' CHECK (status IN ('รอดำเนินการ', 'อนุมัติ', 'ไม่อนุมัติ')),
    priority VARCHAR(20) DEFAULT 'ปานกลาง' CHECK (priority IN ('ต่ำ', 'ปานกลาง', 'สูง', 'ฉุกเฉิน')),
    reported_by VARCHAR(100) NOT NULL,
    reporter_phone VARCHAR(20),
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_to UUID REFERENCES users(id),
    images JSONB, -- Store array of image URLs
    location VARCHAR(200),
    coordinates JSONB, -- Store lat/lng
    referrer_url VARCHAR(500), -- Store the page where the report was submitted from
    rejection_reason TEXT, -- Reason for rejection
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- INDEXES FOR REPORTS TABLE
-- ==============================================

CREATE INDEX idx_reports_ticket_id ON reports(ticket_id);
CREATE INDEX idx_reports_asset_code ON reports(asset_code);
CREATE INDEX idx_reports_report_type ON reports(report_type);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_reported_at ON reports(reported_at);

-- ==============================================
-- COMMENTS FOR REPORTS TABLE
-- ==============================================

COMMENT ON TABLE reports IS 'ตารางรายงานปัญหา';
COMMENT ON COLUMN reports.ticket_id IS 'รหัสติดตามงาน (UNIQUE)';
COMMENT ON COLUMN reports.report_type IS 'ประเภทรายงาน (repair/request)';
COMMENT ON COLUMN reports.status IS 'สถานะรายงาน (รอดำเนินการ, อนุมัติ, ไม่อนุมัติ)';
COMMENT ON COLUMN reports.priority IS 'ความสำคัญ (ต่ำ, ปานกลาง, สูง, ฉุกเฉิน)';
COMMENT ON COLUMN reports.images IS 'รูปภาพประกอบ (JSON array)';
COMMENT ON COLUMN reports.coordinates IS 'พิกัด GPS (JSON lat/lng)';
COMMENT ON COLUMN reports.referrer_url IS 'URL หน้าต้นทางที่ส่งรายงาน';
COMMENT ON COLUMN reports.rejection_reason IS 'สาเหตุการไม่อนุมัติ';
