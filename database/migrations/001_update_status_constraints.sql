-- ==============================================
-- Migration: Update Status Constraints
-- Description: อัพเดต CHECK constraints ให้ตรงกับ constants ใหม่
-- Date: 2025-10-21
-- ==============================================

BEGIN;

-- ==============================================
-- 1. UPDATE REPORTS TABLE STATUS
-- ==============================================
-- ลบ constraint เก่า
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_status_check;

-- เพิ่ม constraint ใหม่ตาม REPORT_STATUS
ALTER TABLE reports ADD CONSTRAINT reports_status_check 
CHECK (status IN ('รอดำเนินการ', 'อนุมัติ', 'ไม่อนุมัติ'));

-- Update ค่าเก่าที่อาจมีใน database (ถ้ามี)
-- เปลี่ยน 'กำลังดำเนินการ' เป็น 'รอดำเนินการ'
-- เปลี่ยน 'เสร็จสิ้น' เป็น 'อนุมัติ'
UPDATE reports 
SET status = 'ไม่อนุมัติ' 
WHERE status = 'กำลังดำเนินการ';

UPDATE reports 
SET status = 'อนุมัติ' 
WHERE status = 'เสร็จสิ้น';

-- ==============================================
-- 2. VERIFY REPAIRS TABLE STATUS (ไม่เปลี่ยน)
-- ==============================================
-- repairs table ใช้ status: รอดำเนินการ, กำลังดำเนินการ, เสร็จสิ้น, ยกเลิก
-- ตรงกับ REPAIR_STATUS แล้ว ไม่ต้องแก้

-- ==============================================
-- 3. VERIFY ASSETS TABLE STATUS (ไม่เปลี่ยน)
-- ==============================================
-- assets table ใช้ status: ใช้งานได้, ชำรุด, เสื่อมสภาพ, สูญหาย
-- ตรงกับ ASSET_STATUS แล้ว ไม่ต้องแก้

-- ==============================================
-- 4. VERIFY PRIORITY CONSTRAINTS
-- ==============================================
-- ตรวจสอบว่า priority ในทุกตารางตรงกับ PRIORITY constants
-- reports และ repairs ควรมี: ต่ำ, ปานกลาง, สูง, ฉุกเฉิน

-- ==============================================
-- 5. ADD COMMENTS FOR DOCUMENTATION
-- ==============================================
COMMENT ON COLUMN reports.status IS 'สถานะรายงาน: รอดำเนินการ (PENDING), อนุมัติ (APPROVED), ไม่อนุมัติ (REJECTED) - ดู REPORT_STATUS ใน constants.js';
COMMENT ON COLUMN repairs.status IS 'สถานะงานซ่อม: รอดำเนินการ (PENDING), กำลังดำเนินการ (IN_PROGRESS), เสร็จสิ้น (COMPLETED), ยกเลิก (CANCELLED) - ดู REPAIR_STATUS ใน constants.js';
COMMENT ON COLUMN assets.status IS 'สถานะทรัพย์สิน: ใช้งานได้ (AVAILABLE), ชำรุด (DAMAGED), เสื่อมสภาพ (DETERIORATED), สูญหาย (LOST) - ดู ASSET_STATUS ใน constants.js';

-- ==============================================
-- ROLLBACK SCRIPT (กรณีต้องการย้อนกลับ)
-- ==============================================
-- BEGIN;
-- ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_status_check;
-- ALTER TABLE reports ADD CONSTRAINT reports_status_check 
-- CHECK (status IN ('รอดำเนินการ', 'กำลังดำเนินการ', 'เสร็จสิ้น', 'ยกเลิก'));
-- COMMIT;

COMMIT;

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================
-- ตรวจสอบว่า migration สำเร็จ
-- SELECT DISTINCT status FROM reports;
-- SELECT DISTINCT status FROM repairs;
-- SELECT DISTINCT status FROM assets;
-- SELECT DISTINCT priority FROM reports;
-- SELECT DISTINCT priority FROM repairs;

