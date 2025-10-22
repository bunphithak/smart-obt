-- Migration: Convert Status Values to English Keys
-- Date: 2025-10-22
-- Description: เปลี่ยน status/priority จากภาษาไทยเป็น English keys เพื่อความเป็นมาตรฐาน
-- 
-- ENUM types in database:
--   - repair_status (repairs.status)
--   - report_status (reports.status)
--   - priority_level (repairs.priority, reports.priority)
--   - assets.status = VARCHAR (not ENUM)

-- ==============================================
-- STEP 1: Add new ENUM values (auto-commits)
-- ==============================================

-- Repair Status ENUM
ALTER TYPE repair_status ADD VALUE IF NOT EXISTS 'PENDING';
ALTER TYPE repair_status ADD VALUE IF NOT EXISTS 'IN_PROGRESS';
ALTER TYPE repair_status ADD VALUE IF NOT EXISTS 'COMPLETED';
ALTER TYPE repair_status ADD VALUE IF NOT EXISTS 'CANCELLED';

-- Report Status ENUM
ALTER TYPE report_status ADD VALUE IF NOT EXISTS 'PENDING';
ALTER TYPE report_status ADD VALUE IF NOT EXISTS 'APPROVED';
ALTER TYPE report_status ADD VALUE IF NOT EXISTS 'REJECTED';

-- Priority Level ENUM
ALTER TYPE priority_level ADD VALUE IF NOT EXISTS 'LOW';
ALTER TYPE priority_level ADD VALUE IF NOT EXISTS 'MEDIUM';
ALTER TYPE priority_level ADD VALUE IF NOT EXISTS 'HIGH';
ALTER TYPE priority_level ADD VALUE IF NOT EXISTS 'URGENT';

-- ==============================================
-- STEP 2: Update data (ใน transaction เดียว)
-- ==============================================

BEGIN;

-- Drop CHECK constraints first (ถ้ามี)
ALTER TABLE repairs DROP CONSTRAINT IF EXISTS repairs_status_check;
ALTER TABLE repairs DROP CONSTRAINT IF EXISTS repairs_priority_check;
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_status_check;
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_priority_check;
ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_status_check;

-- ==============================================
-- 3. UPDATE REPAIRS TABLE
-- ==============================================

-- Update status (ENUM)
UPDATE repairs SET status = 'PENDING'::repair_status WHERE status::text = 'รอดำเนินการ';
UPDATE repairs SET status = 'IN_PROGRESS'::repair_status WHERE status::text = 'กำลังดำเนินการ';
UPDATE repairs SET status = 'COMPLETED'::repair_status WHERE status::text = 'เสร็จสิ้น';
UPDATE repairs SET status = 'CANCELLED'::repair_status WHERE status::text = 'ยกเลิก';

-- Update priority (ENUM)
UPDATE repairs SET priority = 'LOW'::priority_level WHERE priority::text = 'ต่ำ';
UPDATE repairs SET priority = 'MEDIUM'::priority_level WHERE priority::text = 'ปานกลาง';
UPDATE repairs SET priority = 'HIGH'::priority_level WHERE priority::text = 'สูง';
UPDATE repairs SET priority = 'URGENT'::priority_level WHERE priority::text = 'ฉุกเฉิน';

-- Update defaults
ALTER TABLE repairs ALTER COLUMN status SET DEFAULT 'PENDING'::repair_status;
ALTER TABLE repairs ALTER COLUMN priority SET DEFAULT 'MEDIUM'::priority_level;

-- Update comments
COMMENT ON COLUMN repairs.status IS 'สถานะงานซ่อม (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)';
COMMENT ON COLUMN repairs.priority IS 'ความสำคัญ (LOW, MEDIUM, HIGH, URGENT)';

-- ==============================================
-- 4. UPDATE REPORTS TABLE
-- ==============================================

-- Update status (ENUM)
UPDATE reports SET status = 'PENDING'::report_status WHERE status::text = 'รอดำเนินการ';
UPDATE reports SET status = 'APPROVED'::report_status WHERE status::text = 'อนุมัติ';
UPDATE reports SET status = 'REJECTED'::report_status WHERE status::text = 'ไม่อนุมัติ';

-- Update priority (ENUM)
UPDATE reports SET priority = 'LOW'::priority_level WHERE priority::text = 'ต่ำ';
UPDATE reports SET priority = 'MEDIUM'::priority_level WHERE priority::text = 'ปานกลาง';
UPDATE reports SET priority = 'HIGH'::priority_level WHERE priority::text = 'สูง';
UPDATE reports SET priority = 'URGENT'::priority_level WHERE priority::text = 'ฉุกเฉิน';

-- Update defaults
ALTER TABLE reports ALTER COLUMN status SET DEFAULT 'PENDING'::report_status;
ALTER TABLE reports ALTER COLUMN priority SET DEFAULT 'MEDIUM'::priority_level;

-- Update comments
COMMENT ON COLUMN reports.status IS 'สถานะรายงาน (PENDING, APPROVED, REJECTED)';
COMMENT ON COLUMN reports.priority IS 'ความสำคัญ (LOW, MEDIUM, HIGH, URGENT)';

-- ==============================================
-- 5. UPDATE ASSETS TABLE (VARCHAR only)
-- ==============================================

-- Update VARCHAR status values
UPDATE assets SET status = 'AVAILABLE' WHERE status = 'ใช้งานได้';
UPDATE assets SET status = 'DAMAGED' WHERE status = 'ชำรุด';
UPDATE assets SET status = 'DETERIORATED' WHERE status = 'เสื่อมสภาพ';
UPDATE assets SET status = 'LOST' WHERE status = 'สูญหาย';
-- Handle old values that might exist
UPDATE assets SET status = 'DAMAGED' WHERE status = 'กำลังซ่อม';
UPDATE assets SET status = 'LOST' WHERE status = 'เลิกใช้';

-- Update default
ALTER TABLE assets ALTER COLUMN status SET DEFAULT 'AVAILABLE';

-- Add new CHECK constraint
ALTER TABLE assets ADD CONSTRAINT assets_status_check 
    CHECK (status IN ('AVAILABLE', 'DAMAGED', 'DETERIORATED', 'LOST'));

-- Update comment
COMMENT ON COLUMN assets.status IS 'สถานะทรัพย์สิน (AVAILABLE, DAMAGED, DETERIORATED, LOST)';

-- ==============================================
-- 6. Verify Migration
-- ==============================================

DO $$ 
DECLARE 
    repairs_count INTEGER;
    reports_count INTEGER;
    assets_count INTEGER;
    repairs_pending INTEGER;
    reports_pending INTEGER;
    assets_available INTEGER;
BEGIN
    SELECT COUNT(*) INTO repairs_count FROM repairs;
    SELECT COUNT(*) INTO reports_count FROM reports;
    SELECT COUNT(*) INTO assets_count FROM assets;
    SELECT COUNT(*) INTO repairs_pending FROM repairs WHERE status::text = 'PENDING';
    SELECT COUNT(*) INTO reports_pending FROM reports WHERE status::text = 'PENDING';
    SELECT COUNT(*) INTO assets_available FROM assets WHERE status = 'AVAILABLE';
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Repairs: % total (% PENDING)', repairs_count, repairs_pending;
    RAISE NOTICE '📊 Reports: % total (% PENDING)', reports_count, reports_pending;
    RAISE NOTICE '📊 Assets: % total (% AVAILABLE)', assets_count, assets_available;
    RAISE NOTICE '';
END $$;

-- Show status distribution
SELECT 'REPAIRS' as table_name, status::text as status, COUNT(*) as count 
FROM repairs 
GROUP BY status 
ORDER BY status;

SELECT 'REPORTS' as table_name, status::text as status, COUNT(*) as count 
FROM reports 
GROUP BY status
ORDER BY status;

SELECT 'ASSETS' as table_name, status, COUNT(*) as count 
FROM assets 
GROUP BY status
ORDER BY status;

COMMIT;

-- ==============================================
-- ROLLBACK SCRIPT (ถ้าต้องการกลับไปใช้ภาษาไทย)
-- ==============================================
-- หากต้องการ rollback ให้ run คำสั่งด้านล่างนี้:
--
-- BEGIN;
--
-- -- REPAIRS TABLE
-- UPDATE repairs SET status = 'รอดำเนินการ'::repair_status WHERE status::text = 'PENDING';
-- UPDATE repairs SET status = 'กำลังดำเนินการ'::repair_status WHERE status::text = 'IN_PROGRESS';
-- UPDATE repairs SET status = 'เสร็จสิ้น'::repair_status WHERE status::text = 'COMPLETED';
-- UPDATE repairs SET status = 'ยกเลิก'::repair_status WHERE status::text = 'CANCELLED';
-- UPDATE repairs SET priority = 'ต่ำ'::priority_level WHERE priority::text = 'LOW';
-- UPDATE repairs SET priority = 'ปานกลาง'::priority_level WHERE priority::text = 'MEDIUM';
-- UPDATE repairs SET priority = 'สูง'::priority_level WHERE priority::text = 'HIGH';
-- UPDATE repairs SET priority = 'ฉุกเฉิน'::priority_level WHERE priority::text = 'URGENT';
-- ALTER TABLE repairs ALTER COLUMN status SET DEFAULT 'รอดำเนินการ'::repair_status;
-- ALTER TABLE repairs ALTER COLUMN priority SET DEFAULT 'ปานกลาง'::priority_level;
--
-- -- REPORTS TABLE
-- UPDATE reports SET status = 'รอดำเนินการ'::report_status WHERE status::text = 'PENDING';
-- UPDATE reports SET status = 'อนุมัติ'::report_status WHERE status::text = 'APPROVED';
-- UPDATE reports SET status = 'ไม่อนุมัติ'::report_status WHERE status::text = 'REJECTED';
-- UPDATE reports SET priority = 'ต่ำ'::priority_level WHERE priority::text = 'LOW';
-- UPDATE reports SET priority = 'ปานกลาง'::priority_level WHERE priority::text = 'MEDIUM';
-- UPDATE reports SET priority = 'สูง'::priority_level WHERE priority::text = 'HIGH';
-- UPDATE reports SET priority = 'ฉุกเฉิน'::priority_level WHERE priority::text = 'URGENT';
-- ALTER TABLE reports ALTER COLUMN status SET DEFAULT 'รอดำเนินการ'::report_status;
-- ALTER TABLE reports ALTER COLUMN priority SET DEFAULT 'ปานกลาง'::priority_level;
--
-- -- ASSETS TABLE
-- ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_status_check;
-- UPDATE assets SET status = 'ใช้งานได้' WHERE status = 'AVAILABLE';
-- UPDATE assets SET status = 'ชำรุด' WHERE status = 'DAMAGED';
-- UPDATE assets SET status = 'เสื่อมสภาพ' WHERE status = 'DETERIORATED';
-- UPDATE assets SET status = 'สูญหาย' WHERE status = 'LOST';
-- ALTER TABLE assets ALTER COLUMN status SET DEFAULT 'ใช้งานได้';
-- ALTER TABLE assets ADD CONSTRAINT assets_status_check 
--     CHECK (status IN ('ใช้งานได้', 'ชำรุด', 'กำลังซ่อม', 'เลิกใช้'));
--
-- COMMIT;
