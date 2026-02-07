import { createClient } from '@supabase/supabase-js';
import { CONFIG } from './config';

// Supabase configuration - using centralized config for stability
const supabaseUrl = CONFIG.SUPABASE_URL;
const supabaseAnonKey = CONFIG.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export interface UserProfile {
    id: string;
    email: string;
    username: string;
    created_at: string;
    hwid: string | null;
}

export interface LicenseKey {
    id: string;
    key: string;
    user_id: string | null;
    type: 'weekly' | 'monthly' | 'lifetime';
    created_at: string;
    activated_at: string | null;
    expires_at: string | null;
    is_active: boolean;
    hwid_locked: string | null;
}

export interface RateLimitEntry {
    id: string;
    ip_address: string;
    endpoint: string;
    request_count: number;
    window_start: string;
}

// Auth helper functions
export const authHelpers = {
    async signUp(email: string, password: string, username: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                },
            },
        });

        if (error) throw error;

        // Create profile entry
        if (data.user) {
            const { error: profileError } = await supabase.from('profiles').insert({
                id: data.user.id,
                email,
                username,
                hwid: generateHWID(),
            });

            if (profileError) throw profileError;
        }

        return data;
    },

    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    async getSession() {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session;
    },

    async getProfile(userId: string): Promise<UserProfile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) return null;
        return data;
    },
};

// License key helper functions
export const licenseHelpers = {
    async validateLicenseKey(key: string): Promise<LicenseKey | null> {
        const { data, error } = await supabase
            .from('license_keys')
            .select('*')
            .eq('key', key)
            .maybeSingle();

        if (error) {
            console.error('License validation error:', error);
            return null;
        }
        return data;
    },

    async activateLicenseKey(key: string, userId: string, hwid: string) {
        const license = await this.validateLicenseKey(key);

        if (!license) {
            throw new Error('Invalid license key');
        }

        if (license.user_id && license.user_id !== userId) {
            throw new Error('License key is already in use by another user');
        }

        if (license.hwid_locked && license.hwid_locked !== hwid) {
            throw new Error('License key is locked to a different device');
        }

        // Calculate expiration based on type
        let expiresAt: string | null = null;
        const now = new Date();

        switch (license.type) {
            case 'weekly':
                expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
                break;
            case 'monthly':
                expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
                break;
            case 'lifetime':
                expiresAt = null; // Never expires
                break;
        }

        const { data, error } = await supabase
            .from('license_keys')
            .update({
                user_id: userId,
                activated_at: now.toISOString(),
                expires_at: expiresAt,
                is_active: true,
                hwid_locked: hwid,
            })
            .eq('key', key)
            .select();

        if (error) {
            console.error('License activation error:', error);
            throw new Error('Failed to activate license key');
        }

        // Return the first result
        return data?.[0] || null;
    },

    async getUserLicense(userId: string): Promise<LicenseKey | null> {
        const { data, error } = await supabase
            .from('license_keys')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('expires_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error('Error fetching license:', error);
            return null;
        }
        return data;
    },

    async checkLicenseExpiration(license: LicenseKey): Promise<{
        isExpired: boolean;
        timeRemaining: string;
        daysRemaining: number;
        hoursRemaining: number;
        minutesRemaining: number;
    }> {
        if (license.type === 'lifetime' || !license.expires_at) {
            return {
                isExpired: false,
                timeRemaining: 'Lifetime',
                daysRemaining: Infinity,
                hoursRemaining: Infinity,
                minutesRemaining: Infinity,
            };
        }

        const now = new Date();
        const expiresAt = new Date(license.expires_at);
        const diff = expiresAt.getTime() - now.getTime();

        if (diff <= 0) {
            return {
                isExpired: true,
                timeRemaining: 'Expired',
                daysRemaining: 0,
                hoursRemaining: 0,
                minutesRemaining: 0,
            };
        }

        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

        let timeRemaining = '';
        if (days > 0) timeRemaining += `${days}d `;
        if (hours > 0) timeRemaining += `${hours}h `;
        timeRemaining += `${minutes}m`;

        return {
            isExpired: false,
            timeRemaining: timeRemaining.trim(),
            daysRemaining: days,
            hoursRemaining: hours,
            minutesRemaining: minutes,
        };
    },

    async generateWeeklyLicenseKey(): Promise<string> {
        const key = `AVION-${generateRandomSegment()}-${generateRandomSegment()}-${generateRandomSegment()}`;

        const { error } = await supabase.from('license_keys').insert({
            key,
            type: 'weekly',
            is_active: false,
        });

        if (error) throw error;
        return key;
    },
};

// Rate limiting helper
export const rateLimitHelpers = {
    async checkRateLimit(endpoint: string, maxRequests: number = 10, windowMs: number = 60000): Promise<boolean> {
        // Get client IP (this would be passed from Cloudflare headers in production)
        const ipAddress = 'client-ip'; // Placeholder - in production, get from request

        const windowStart = new Date(Date.now() - windowMs).toISOString();

        // Get current count for this IP and endpoint
        const { data, error } = await supabase
            .from('rate_limits')
            .select('request_count')
            .eq('ip_address', ipAddress)
            .eq('endpoint', endpoint)
            .gte('window_start', windowStart)
            .single();

        if (error && error.code !== 'PGRST116') {
            // PGRST116 = no rows returned, which is fine
            console.error('Rate limit check error:', error);
            return true; // Allow on error
        }

        if (data && data.request_count >= maxRequests) {
            return false; // Rate limited
        }

        // Increment or create rate limit entry
        if (data) {
            await supabase
                .from('rate_limits')
                .update({ request_count: data.request_count + 1 })
                .eq('ip_address', ipAddress)
                .eq('endpoint', endpoint);
        } else {
            await supabase.from('rate_limits').insert({
                ip_address: ipAddress,
                endpoint,
                request_count: 1,
                window_start: new Date().toISOString(),
            });
        }

        return true;
    },
};

// Utility functions
function generateHWID(): string {
    const segments = [
        generateRandomSegment(),
        generateRandomSegment(),
        generateRandomSegment(),
        generateRandomSegment(),
    ];
    return `AVION-${segments.join('-')}`;
}

function generateRandomSegment(): string {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
}

export { generateHWID };
