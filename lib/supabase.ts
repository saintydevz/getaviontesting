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

// Helper to timeout long-running promises
const timeoutPromise = <T>(promise: PromiseLike<T>, ms: number = 8000): Promise<T> => {
    return Promise.race([
        Promise.resolve(promise),
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error('DATABASE_TIMEOUT')), ms))
    ]);
};

// Auth helper functions
export const authHelpers = {
    async signUp(email: string, password: string, username: string) {
        console.log('[Auth] Attempting sign up...');
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
            console.log('[Auth] Creating profile record...');
            const { error: profileError } = await supabase.from('profiles').insert({
                id: data.user.id,
                email,
                username,
                hwid: generateHWID(),
            });

            if (profileError) {
                console.error('[Auth] Profile creation failed:', profileError);
                // We don't throw here to allow user to still sign in if they exist but profile failed
            }
        }

        return data;
    },

    async signIn(email: string, password: string) {
        console.log('[Auth] Attempting sign in...');
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
        try {
            const response = await timeoutPromise(
                supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single()
            );
            const { data, error } = response as any;
            if (error) return null;
            return data;
        } catch (err) {
            return null;
        }
    },
};

// License key helper functions
export const licenseHelpers = {
    async validateLicenseKey(key: string): Promise<LicenseKey | null> {
        console.log('[License] Validating key:', key);
        try {
            const response = await timeoutPromise(
                supabase
                    .from('license_keys')
                    .select('*')
                    .eq('key', key)
                    .maybeSingle()
            );

            const { data, error } = response as any;

            if (error) {
                console.error('[License] Validation error:', error);
                return null;
            }
            console.log('[License] Validation result:', data ? 'Valid' : 'Invalid');
            return data;
        } catch (err) {
            console.error('[License] Validation TIMEOUT');
            throw new Error('Database connection timed out. Please check your internet or Supabase status.');
        }
    },

    async activateLicenseKey(key: string, userId: string, hwid: string) {
        console.log('[License] Activating key:', key);
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

        try {
            const response = await timeoutPromise(
                supabase
                    .from('license_keys')
                    .update({
                        user_id: userId,
                        activated_at: now.toISOString(),
                        expires_at: expiresAt,
                        is_active: true,
                        hwid_locked: hwid,
                    })
                    .eq('key', key)
                    .select()
            );

            const { data, error } = response as any;
            if (error) throw error;
            console.log('[License] Activated successfully');
            return data?.[0] || data;
        } catch (err) {
            console.error('[License] Activation TIMEOUT or Failure:', err);
            throw new Error(err instanceof Error ? err.message : 'Database connection timed out during activation.');
        }
    },

    async getUserLicense(userId: string): Promise<LicenseKey | null> {
        try {
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
        } catch (err) {
            return null;
        }
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
        const ipAddress = 'client-ip';
        const windowStart = new Date(Date.now() - windowMs).toISOString();

        const { data, error } = await supabase
            .from('rate_limits')
            .select('request_count')
            .eq('ip_address', ipAddress)
            .eq('endpoint', endpoint)
            .gte('window_start', windowStart)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Rate limit check error:', error);
            return true;
        }

        if (data && data.request_count >= maxRequests) {
            return false;
        }

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
