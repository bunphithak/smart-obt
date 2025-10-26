-- Problem Types Schema
-- problem_types table for categorizing problem reports

-- ==============================================
-- PROBLEM TYPES TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS problem_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    icon VARCHAR(50),
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- INDEXES FOR PROBLEM TYPES TABLE
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_problem_types_category_id ON problem_types(category_id);
CREATE INDEX IF NOT EXISTS idx_problem_types_is_active ON problem_types(is_active);
CREATE INDEX IF NOT EXISTS idx_problem_types_display_order ON problem_types(display_order);

-- ==============================================
-- INITIAL DATA FOR PROBLEM TYPES
-- ==============================================

-- Insert default problem types (example - you can customize these)
-- Note: category_id references should be actual UUIDs from categories table

-- ==============================================
-- COMMENTS FOR PROBLEM TYPES TABLE
-- ==============================================

COMMENT ON TABLE problem_types IS 'ตารางประเภทปัญหา';
COMMENT ON COLUMN problem_types.category_id IS 'หมวดหมู่ทรัพย์สินที่ใช้กับปัญหา';
COMMENT ON COLUMN problem_types.is_active IS 'สถานะการใช้งาน';
COMMENT ON COLUMN problem_types.display_order IS 'ลำดับการแสดงผล';
