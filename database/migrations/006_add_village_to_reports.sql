-- Migration: Add village_id to reports table
-- Date: 2024

-- Add village_id column to reports table
ALTER TABLE reports ADD COLUMN IF NOT EXISTS village_id UUID REFERENCES villages(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_reports_village_id ON reports(village_id);

-- Add comment
COMMENT ON COLUMN reports.village_id IS 'หมู่บ้านที่เกี่ยวข้องกับรายงานนี้';

