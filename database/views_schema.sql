-- Views and Performance Schema
-- Dashboard views and performance optimizations

-- ==============================================
-- DASHBOARD STATISTICS VIEW
-- ==============================================

CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM reports WHERE status = 'รอดำเนินการ') as pending_reports,
    (SELECT COUNT(*) FROM reports WHERE status = 'อนุมัติ') as approved_reports,
    (SELECT COUNT(*) FROM reports WHERE status = 'ไม่อนุมัติ') as rejected_reports,
    (SELECT COUNT(*) FROM repairs WHERE status = 'รอดำเนินการ') as pending_repairs,
    (SELECT COUNT(*) FROM repairs WHERE status = 'กำลังดำเนินการ') as in_progress_repairs,
    (SELECT COUNT(*) FROM repairs WHERE status = 'เสร็จสิ้น') as completed_repairs,
    (SELECT COUNT(*) FROM assets WHERE status = 'ใช้งานได้') as active_assets,
    (SELECT COUNT(*) FROM assets WHERE status = 'ชำรุด') as damaged_assets;

-- ==============================================
-- REPAIR SUMMARY VIEW
-- ==============================================

CREATE OR REPLACE VIEW repair_summary AS
SELECT 
    r.id,
    r.title,
    r.status,
    r.priority,
    r.estimated_cost,
    r.actual_cost,
    r.due_date,
    r.created_at,
    u.name as assigned_technician,
    rep.ticket_id,
    rep.reported_by,
    rep.reported_at,
    a.name as asset_name,
    a.code as asset_code,
    v.name as village_name
FROM repairs r
LEFT JOIN users u ON r.assigned_to = u.id
LEFT JOIN reports rep ON r.report_id = rep.id
LEFT JOIN assets a ON rep.asset_code = a.code
LEFT JOIN villages v ON a.village_id = v.id;

-- ==============================================
-- REPORT SUMMARY VIEW
-- ==============================================

CREATE OR REPLACE VIEW report_summary AS
SELECT 
    r.id,
    r.ticket_id,
    r.title,
    r.report_type,
    r.status,
    r.priority,
    r.reported_by,
    r.reporter_phone,
    r.reported_at,
    r.created_at,
    a.name as asset_name,
    a.code as asset_code,
    v.name as village_name,
    c.name as category_name,
    u.name as assigned_to_name
FROM reports r
LEFT JOIN assets a ON r.asset_code = a.code
LEFT JOIN villages v ON a.village_id = v.id
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN users u ON r.assigned_to = u.id;

-- ==============================================
-- ASSET SUMMARY VIEW
-- ==============================================

CREATE OR REPLACE VIEW asset_summary AS
SELECT 
    a.id,
    a.name,
    a.code,
    a.status,
    a.value,
    a.purchase_date,
    a.location_name,
    a.created_at,
    c.name as category_name,
    c.icon as category_icon,
    c.color as category_color,
    v.name as village_name,
    v.district,
    v.province,
    -- Count related reports
    (SELECT COUNT(*) FROM reports rep WHERE rep.asset_code = a.code) as total_reports,
    (SELECT COUNT(*) FROM reports rep WHERE rep.asset_code = a.code AND rep.status = 'รอดำเนินการ') as pending_reports,
    -- Count related repairs
    (SELECT COUNT(*) FROM repairs rep WHERE rep.asset_code = a.code) as total_repairs,
    (SELECT COUNT(*) FROM repairs rep WHERE rep.asset_code = a.code AND rep.status = 'เสร็จสิ้น') as completed_repairs
FROM assets a
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN villages v ON a.village_id = v.id;

-- ==============================================
-- PERFORMANCE FUNCTIONS
-- ==============================================

-- Function to get repair statistics by technician
CREATE OR REPLACE FUNCTION get_technician_stats(technician_id UUID)
RETURNS TABLE (
    total_repairs BIGINT,
    pending_repairs BIGINT,
    in_progress_repairs BIGINT,
    completed_repairs BIGINT,
    avg_rating NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_repairs,
        COUNT(*) FILTER (WHERE status = 'รอดำเนินการ') as pending_repairs,
        COUNT(*) FILTER (WHERE status = 'กำลังดำเนินการ') as in_progress_repairs,
        COUNT(*) FILTER (WHERE status = 'เสร็จสิ้น') as completed_repairs,
        COALESCE(AVG(rf.rating), 0) as avg_rating
    FROM repairs r
    LEFT JOIN repair_feedback rf ON r.id = rf.repair_id
    WHERE r.assigned_to = technician_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get asset health score
CREATE OR REPLACE FUNCTION get_asset_health_score(asset_code_param VARCHAR(50))
RETURNS NUMERIC AS $$
DECLARE
    total_reports BIGINT;
    completed_repairs BIGINT;
    health_score NUMERIC;
BEGIN
    -- Count total reports for this asset
    SELECT COUNT(*) INTO total_reports
    FROM reports 
    WHERE asset_code = asset_code_param;
    
    -- Count completed repairs for this asset
    SELECT COUNT(*) INTO completed_repairs
    FROM repairs 
    WHERE asset_code = asset_code_param AND status = 'เสร็จสิ้น';
    
    -- Calculate health score (0-100)
    IF total_reports = 0 THEN
        health_score := 100; -- No reports = perfect health
    ELSE
        health_score := GREATEST(0, 100 - (total_reports * 10) + (completed_repairs * 5));
    END IF;
    
    RETURN health_score;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- COMMENTS FOR VIEWS AND FUNCTIONS
-- ==============================================

COMMENT ON VIEW dashboard_stats IS 'สถิติภาพรวมสำหรับ dashboard';
COMMENT ON VIEW repair_summary IS 'สรุปข้อมูลงานซ่อมพร้อมข้อมูลที่เกี่ยวข้อง';
COMMENT ON VIEW report_summary IS 'สรุปข้อมูลรายงานพร้อมข้อมูลที่เกี่ยวข้อง';
COMMENT ON VIEW asset_summary IS 'สรุปข้อมูลทรัพย์สินพร้อมสถิติที่เกี่ยวข้อง';

COMMENT ON FUNCTION get_technician_stats(UUID) IS 'ดึงสถิติงานซ่อมของช่างเทคนิค';
COMMENT ON FUNCTION get_asset_health_score(VARCHAR) IS 'คำนวณคะแนนสุขภาพทรัพย์สิน (0-100)';
