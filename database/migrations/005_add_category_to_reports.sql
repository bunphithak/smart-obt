-- Migration: Add category_id column to reports table
-- Description: Add category reference to reports for better data organization

BEGIN;

-- Add category_id column
ALTER TABLE reports ADD COLUMN category_id UUID;

-- Add foreign key constraint
ALTER TABLE reports 
ADD CONSTRAINT fk_reports_category 
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_reports_category_id ON reports(category_id);

-- Update existing records by getting category from asset
UPDATE reports r
SET category_id = a.category_id
FROM assets a
WHERE r.asset_code = a.code AND a.category_id IS NOT NULL;

COMMENT ON COLUMN reports.category_id IS 'Reference to categories table (from asset)';

COMMIT;
