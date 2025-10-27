-- Migration: Add images column to assets table
-- Date: 2024

-- Add images column to assets table (JSONB to store array of image URLs)
ALTER TABLE assets ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_assets_images ON assets USING GIN (images);

-- Add comment
COMMENT ON COLUMN assets.images IS 'รูปภาพทรัพย์สิน (JSON array of image URLs)';

