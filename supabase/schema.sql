-- ================================================
-- AVION SUPABASE DATABASE SCHEMA
-- ================================================
-- Run this SQL in your Supabase SQL Editor to set up the required tables

-- ================================================
-- 1. PROFILES TABLE (extends auth.users)
-- ================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    hwid TEXT,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
-- Policies for profiles
CREATE POLICY "Public can view profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- ================================================
-- 2. LICENSE KEYS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.license_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('weekly', 'monthly', 'lifetime')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activated_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT FALSE,
    hwid_locked TEXT,
    notes TEXT
);

-- Enable Row Level Security
ALTER TABLE public.license_keys ENABLE ROW LEVEL SECURITY;

-- Policies for license_keys
CREATE POLICY "Users can view their own licenses" ON public.license_keys
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view unclaimed licenses for validation" ON public.license_keys
    FOR SELECT USING (user_id IS NULL);

CREATE POLICY "Users can claim licenses" ON public.license_keys
    FOR UPDATE
    USING (user_id IS NULL)
    WITH CHECK (user_id = auth.uid());

-- ================================================
-- 3. RATE LIMITS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ip_address, endpoint)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup 
    ON public.rate_limits(ip_address, endpoint, window_start);

-- Enable Row Level Security (admin only)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- ================================================
-- 4. HWID RESET LOGS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.hwid_reset_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    old_hwid TEXT,
    new_hwid TEXT,
    reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT
);

-- Enable Row Level Security
ALTER TABLE public.hwid_reset_logs ENABLE ROW LEVEL SECURITY;

-- Policies for hwid_reset_logs
CREATE POLICY "Users can view their own reset logs" ON public.hwid_reset_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create reset logs" ON public.hwid_reset_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ================================================
-- 5. LOGIN ATTEMPTS TABLE (for security)
-- ================================================
CREATE TABLE IF NOT EXISTS public.login_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    ip_address TEXT,
    success BOOLEAN DEFAULT FALSE,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT
);

-- Index for rate limiting
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip 
    ON public.login_attempts(ip_address, attempted_at);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email 
    ON public.login_attempts(email, attempted_at);

-- ================================================
-- FUNCTIONS & TRIGGERS
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up old rate limit entries (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM public.rate_limits 
    WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Function to check and clean expired login attempts
CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS void AS $$
BEGIN
    DELETE FROM public.login_attempts 
    WHERE attempted_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Function to activate a license key
CREATE OR REPLACE FUNCTION activate_license_key(
    p_license_key TEXT,
    p_user_id UUID,
    p_hwid TEXT
)
RETURNS json AS $$
DECLARE
    v_license RECORD;
    v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get the license
    SELECT * INTO v_license FROM public.license_keys WHERE key = p_license_key;
    
    -- Check if license exists
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Invalid license key');
    END IF;
    
    -- Check if already used by another user
    IF v_license.user_id IS NOT NULL AND v_license.user_id != p_user_id THEN
        RETURN json_build_object('success', false, 'error', 'License key already in use');
    END IF;
    
    -- Check HWID lock
    IF v_license.hwid_locked IS NOT NULL AND v_license.hwid_locked != p_hwid THEN
        RETURN json_build_object('success', false, 'error', 'License key locked to different device');
    END IF;
    
    -- Calculate expiration
    CASE v_license.type
        WHEN 'weekly' THEN
            v_expires_at := NOW() + INTERVAL '7 days';
        WHEN 'monthly' THEN
            v_expires_at := NOW() + INTERVAL '30 days';
        WHEN 'lifetime' THEN
            v_expires_at := NULL;
    END CASE;
    
    -- Update the license
    UPDATE public.license_keys 
    SET 
        user_id = p_user_id,
        activated_at = NOW(),
        expires_at = v_expires_at,
        is_active = true,
        hwid_locked = p_hwid
    WHERE key = p_license_key;
    
    RETURN json_build_object(
        'success', true, 
        'type', v_license.type,
        'expires_at', v_expires_at
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_ip_address TEXT,
    p_endpoint TEXT,
    p_max_requests INTEGER DEFAULT 10,
    p_window_seconds INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
    v_count INTEGER;
    v_window_start TIMESTAMP WITH TIME ZONE;
BEGIN
    v_window_start := NOW() - (p_window_seconds || ' seconds')::INTERVAL;
    
    -- Count requests in window
    SELECT request_count INTO v_count
    FROM public.rate_limits
    WHERE ip_address = p_ip_address 
      AND endpoint = p_endpoint
      AND window_start > v_window_start;
    
    IF v_count IS NULL THEN
        -- First request, create entry
        INSERT INTO public.rate_limits (ip_address, endpoint, request_count, window_start)
        VALUES (p_ip_address, p_endpoint, 1, NOW())
        ON CONFLICT (ip_address, endpoint) 
        DO UPDATE SET request_count = 1, window_start = NOW();
        RETURN TRUE;
    ELSIF v_count >= p_max_requests THEN
        -- Rate limited
        RETURN FALSE;
    ELSE
        -- Increment counter
        UPDATE public.rate_limits 
        SET request_count = request_count + 1
        WHERE ip_address = p_ip_address AND endpoint = p_endpoint;
        RETURN TRUE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- SAMPLE DATA - Generate some test license keys
-- ================================================

-- Generate a sample weekly license key (uncomment to use)
-- INSERT INTO public.license_keys (key, type, is_active)
-- VALUES ('AVION-TEST-WEEK-0001', 'weekly', false);

-- Generate a sample monthly license key (uncomment to use)
-- INSERT INTO public.license_keys (key, type, is_active)
-- VALUES ('AVION-TEST-MNTH-0001', 'monthly', false);

-- Generate a sample lifetime license key (uncomment to use)
-- INSERT INTO public.license_keys (key, type, is_active)
-- VALUES ('AVION-TEST-LIFE-0001', 'lifetime', false);

-- ================================================
-- ADMIN FUNCTIONS (for generating keys)
-- ================================================

-- Function to generate a new license key (admin use)
CREATE OR REPLACE FUNCTION generate_license_key(
    p_type TEXT,
    p_notes TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    v_key TEXT;
    v_prefix TEXT;
BEGIN
    -- Generate unique key
    v_prefix := CASE p_type
        WHEN 'weekly' THEN 'WEEK'
        WHEN 'monthly' THEN 'MNTH'
        WHEN 'lifetime' THEN 'LIFE'
        ELSE 'UNKN'
    END;
    
    v_key := 'AVION-' || v_prefix || '-' ||
             UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 4)) || '-' ||
             UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 4));
    
    -- Insert the key
    INSERT INTO public.license_keys (key, type, notes)
    VALUES (v_key, p_type, p_notes);
    
    RETURN v_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
