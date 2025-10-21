-- ==============================================
-- Migration: Add Missing Columns
-- Description: เพิ่ม columns ที่หายไปใน assets table
-- Date: 2025-10-21
-- ==============================================

BEGIN;

-- ==============================================
-- 1. ADD DESCRIPTION COLUMN TO ASSETS (if not exists)
-- ==============================================

-- Check if column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'assets' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE assets ADD COLUMN description TEXT;
        COMMENT ON COLUMN assets.description IS 'รายละเอียดทรัพย์สิน';
    END IF;
END $$;

-- ==============================================
-- 2. ADD OTHER MISSING COLUMNS
-- ==============================================

-- Add location_name column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'assets' 
        AND column_name = 'location_name'
    ) THEN
        ALTER TABLE assets ADD COLUMN location_name VARCHAR(200);
        COMMENT ON COLUMN assets.location_name IS 'ชื่อสถานที่';
    END IF;
END $$;

-- Add location_address column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'assets' 
        AND column_name = 'location_address'
    ) THEN
        ALTER TABLE assets ADD COLUMN location_address TEXT;
        COMMENT ON COLUMN assets.location_address IS 'ที่อยู่เต็ม';
    END IF;
END $$;

-- Add latitude column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'assets' 
        AND column_name = 'latitude'
    ) THEN
        ALTER TABLE assets ADD COLUMN latitude DECIMAL(10,8);
        COMMENT ON COLUMN assets.latitude IS 'พิกัดละติจูด';
    END IF;
END $$;

-- Add longitude column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'assets' 
        AND column_name = 'longitude'
    ) THEN
        ALTER TABLE assets ADD COLUMN longitude DECIMAL(11,8);
        COMMENT ON COLUMN assets.longitude IS 'พิกัดลองจิจูด';
    END IF;
END $$;

-- Add value column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'assets' 
        AND column_name = 'value'
    ) THEN
        ALTER TABLE assets ADD COLUMN value DECIMAL(12,2);
        COMMENT ON COLUMN assets.value IS 'มูลค่าทรัพย์สิน (บาท)';
    END IF;
END $$;

-- Add purchase_date column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'assets' 
        AND column_name = 'purchase_date'
    ) THEN
        ALTER TABLE assets ADD COLUMN purchase_date DATE;
        COMMENT ON COLUMN assets.purchase_date IS 'วันที่จัดซื้อ';
    END IF;
END $$;

-- Add qr_code column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'assets' 
        AND column_name = 'qr_code'
    ) THEN
        ALTER TABLE assets ADD COLUMN qr_code VARCHAR(200);
        COMMENT ON COLUMN assets.qr_code IS 'QR Code path/URL';
    END IF;
END $$;

COMMIT;

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'assets' 
-- ORDER BY ordinal_position;


