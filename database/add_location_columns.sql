-- Add location columns to repairs table
-- Run this script to update existing database

-- Add location columns to repairs table
ALTER TABLE repairs 
ADD COLUMN IF NOT EXISTS location VARCHAR(200),
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);

-- Add comments for documentation
COMMENT ON COLUMN repairs.location IS 'Location name/address for repair work';
COMMENT ON COLUMN repairs.latitude IS 'GPS latitude coordinate';
COMMENT ON COLUMN repairs.longitude IS 'GPS longitude coordinate';

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'repairs' 
AND column_name IN ('location', 'latitude', 'longitude')
ORDER BY ordinal_position;
