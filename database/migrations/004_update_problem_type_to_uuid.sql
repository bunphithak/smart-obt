-- Migration: Update problem_type column to UUID
-- Description: Change problem_type from VARCHAR to UUID and add foreign key reference to problem_types table

BEGIN;

-- Step 1: Add a new column for UUID temporarily
ALTER TABLE reports ADD COLUMN problem_type_uuid UUID;

-- Step 2: Update existing records by matching problem_type name with problem_types table
UPDATE reports r
SET problem_type_uuid = pt.id
FROM problem_types pt
WHERE r.problem_type = pt.name;

-- Step 3: Drop the old problem_type column
ALTER TABLE reports DROP COLUMN problem_type;

-- Step 4: Rename the new column to problem_type
ALTER TABLE reports RENAME COLUMN problem_type_uuid TO problem_type;

-- Step 5: Add foreign key constraint
ALTER TABLE reports 
ADD CONSTRAINT fk_reports_problem_type 
FOREIGN KEY (problem_type) REFERENCES problem_types(id) ON DELETE SET NULL;

-- Step 6: Create index for better query performance
CREATE INDEX idx_reports_problem_type ON reports(problem_type);

COMMENT ON COLUMN reports.problem_type IS 'Reference to problem_types table (UUID)';

COMMIT;
