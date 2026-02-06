-- ================================================
-- RESET DATABASE SCRIPT
-- ================================================
-- WARNING: This will delete ALL data in these tables!
-- Run this to clear your database before applying the new schema.

-- 1. Drop Tables (order matters due to dependencies)
DROP TABLE IF EXISTS public.hwid_reset_logs;
DROP TABLE IF EXISTS public.rate_limits;
DROP TABLE IF EXISTS public.login_attempts;
DROP TABLE IF EXISTS public.license_keys;
DROP TABLE IF EXISTS public.profiles;

-- 2. Drop Functions
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_rate_limits CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_login_attempts CASCADE;
DROP FUNCTION IF EXISTS activate_license_key CASCADE;
DROP FUNCTION IF EXISTS check_rate_limit CASCADE;
DROP FUNCTION IF EXISTS generate_license_key CASCADE;

-- 3. Drop Triggers (usually dropped with table, but good to be sure)
-- DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- 4. Cleanup any orphaned types or sequences if needed (none used in schema, but good practice)
