-- ================================================
-- GENERATE A WEEKLY LICENSE KEY FOR TESTING
-- ================================================
-- Run this in your Supabase SQL Editor after running schema.sql

-- Generate 5 weekly license keys for testing
DO $$
DECLARE
    v_key TEXT;
    i INTEGER;
BEGIN
    FOR i IN 1..5 LOOP
        v_key := 'AVION-WEEK-' ||
                 UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 4)) || '-' ||
                 UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 4));
        
        INSERT INTO public.license_keys (key, type, notes)
        VALUES (v_key, 'weekly', 'Testing key ' || i);
        
        RAISE NOTICE 'Generated Key: %', v_key;
    END LOOP;
END $$;

-- View generated keys
SELECT key, type, is_active, created_at 
FROM public.license_keys 
WHERE type = 'weekly' 
ORDER BY created_at DESC 
LIMIT 10;
