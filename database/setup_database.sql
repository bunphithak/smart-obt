-- Smart OBT Database Setup Script
-- Master script to create complete database schema

-- ==============================================
-- DATABASE SETUP
-- ==============================================

-- Create database (uncomment if needed)
-- CREATE DATABASE smart_obt;

-- Connect to database
-- \c smart_obt;

-- ==============================================
-- SCHEMA EXECUTION ORDER
-- ==============================================

-- 1. Core Tables (roles, villages, categories, users, user_roles)
\i core_schema.sql

-- 2. Assets Table
\i assets_schema.sql

-- 3. Reports Table
\i reports_schema.sql

-- 4. Repairs Tables (repairs, repair_feedback)
\i repairs_schema.sql

-- 5. Views and Performance Functions
\i views_schema.sql

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================

-- Check all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check initial data
SELECT 'Roles' as table_name, COUNT(*) as count FROM roles
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Villages', COUNT(*) FROM villages;

-- Test dashboard view
SELECT * FROM dashboard_stats;

-- ==============================================
-- SUCCESS MESSAGE
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Smart OBT Database setup completed successfully!';
    RAISE NOTICE '📊 Tables created: roles, villages, categories, users, user_roles, assets, reports, repairs, repair_feedback';
    RAISE NOTICE '📈 Views created: dashboard_stats, repair_summary, report_summary, asset_summary';
    RAISE NOTICE '⚡ Functions created: get_technician_stats, get_asset_health_score';
    RAISE NOTICE '🔍 Indexes created for optimal performance';
    RAISE NOTICE '📝 Initial data inserted: roles, categories, villages';
END $$;
