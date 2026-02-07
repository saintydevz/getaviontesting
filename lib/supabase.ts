
export const supabase = {
    auth: {
        async signUp({ email, password, options }: any) {
            return { data: { user: { id: 'mock-user-id', email, user_metadata: options?.data } }, error: null };
        },
        async signInWithPassword({ email }: any) {
            return { data: { user: { id: 'mock-user-id', email } }, error: null };
        },
        async signOut() {
            return { error: null };
        },
        async getSession() {
            return { data: { session: null }, error: null };
        },
        async getUser() {
            const stored = localStorage.getItem('avion_user');
            if (stored) {
                return { data: { user: JSON.parse(stored) }, error: null };
            }
            return { data: { user: null }, error: null };
        },
        onAuthStateChange(callback: any) {
            return { data: { subscription: { unsubscribe: () => { } } } };
        }
    },
    from: () => ({
        select: () => ({
            eq: () => ({
                single: async () => ({ data: null, error: null }),
                maybeSingle: async () => ({ data: null, error: null }),
                order: () => ({ limit: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) })
            }),
            gte: () => ({ single: async () => ({ data: null, error: null }) })
        }),
        insert: async () => ({ error: null }),
        update: () => ({ eq: async () => ({ error: null }) }),
    })
};

export const authHelpers = {
    async signUp(email: string, password: string, username: string) {
        const user = { id: 'mock-id', email, username };
        localStorage.setItem('avion_user', JSON.stringify(user));
        return { user };
    },
    async signIn(email: string, password: string) {
        const user = { id: 'mock-id', email, username: email.split('@')[0] };
        localStorage.setItem('avion_user', JSON.stringify(user));
        return { data: { user }, error: null };
    },
    async signOut() {
        localStorage.removeItem('avion_user');
    },
    async getProfile() {
        return null;
    }
};

export const licenseHelpers = {
    async validateLicenseKey() { return { is_active: true }; },
    async activateLicenseKey() { return true; },
    async getUserLicense() { return { is_active: true, type: 'lifetime' }; },
    async checkLicenseExpiration() {
        return { isExpired: false, timeRemaining: 'Lifetime' };
    }
};

export const generateHWID = () => 'AVION-MOCK-HWID';
