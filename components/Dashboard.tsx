
import React, { useState, useEffect } from 'react';
import { supabase, LicenseKey, licenseHelpers } from '../lib/supabase';
import { LicenseStatus } from './LicenseStatus';

interface ChangelogEntry {
  version: string;
  date: string;
  status: 'Latest' | 'Stable' | 'Legacy';
  changes: string[];
}

interface DashboardProps {
  user: { email: string; username: string; id?: string };
  onSignOut: () => void;
}

// USER: Replace this URL with your raw GitHub JSON link
const CHANGELOG_URL = 'https://raw.githubusercontent.com/saintydevz/Avionupdates/refs/heads/main/Updates.json';

export const Dashboard: React.FC<DashboardProps> = ({ user, onSignOut }) => {
  const [showChangelog, setShowChangelog] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [changelogs, setChangelogs] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [license, setLicense] = useState<LicenseKey | null>(null);
  const [licenseLoading, setLicenseLoading] = useState(true);
  const [hwid, setHwid] = useState<string>('');
  const [activatingKey, setActivatingKey] = useState('');
  const [activationError, setActivationError] = useState<string | null>(null);
  const [activationLoading, setActivationLoading] = useState(false);

  // Fetch user license and HWID
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user.id) {
        setLicenseLoading(false);
        return;
      }

      try {
        // Get user profile for HWID
        const { data: profile } = await supabase
          .from('profiles')
          .select('hwid')
          .eq('id', user.id)
          .single();

        if (profile?.hwid) {
          setHwid(profile.hwid);
        }

        // Get user's license
        const userLicense = await licenseHelpers.getUserLicense(user.id);

        // Check if expired
        if (userLicense) {
          const expInfo = await licenseHelpers.checkLicenseExpiration(userLicense);
          if (expInfo.isExpired) {
            // Mark as inactive
            await supabase
              .from('license_keys')
              .update({ is_active: false })
              .eq('id', userLicense.id);
            setLicense(null);
          } else {
            setLicense(userLicense);
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLicenseLoading(false);
      }
    };

    fetchUserData();
  }, [user.id]);

  // Fetch changelog
  useEffect(() => {
    const fetchChangelog = async () => {
      try {
        setLoading(true);
        const response = await fetch(CHANGELOG_URL);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setChangelogs(data);
        setError(false);
      } catch (err) {
        console.error('Changelog fetch error:', err);
        setError(true);
        setChangelogs([
          {
            version: "Build 2.4.1",
            date: "Feb 2026",
            status: "Latest",
            changes: [
              "Complete 100% UNC compliance for the latest engine patches.",
              "New 'Phantom Execution' mode for undetected background runs.",
              "Automated HWID reset system integrated directly into the dashboard."
            ]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchChangelog();
  }, []);

  // Handle license activation
  const handleActivateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.id || !activatingKey.trim()) return;

    setActivationLoading(true);
    setActivationError(null);

    try {
      const activatedLicense = await licenseHelpers.activateLicenseKey(
        activatingKey.trim(),
        user.id,
        hwid
      );
      setLicense(activatedLicense);
      setShowLicenseModal(false);
      setActivatingKey('');
    } catch (err: any) {
      setActivationError(err.message || 'Failed to activate license key');
    } finally {
      setActivationLoading(false);
    }
  };

  // Handle HWID reset
  const handleHWIDReset = async () => {
    if (!user.id) return;

    const newHwid = `AVION-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Log the reset
    await supabase.from('hwid_reset_logs').insert({
      user_id: user.id,
      old_hwid: hwid,
      new_hwid: newHwid,
    });

    // Update profile
    await supabase
      .from('profiles')
      .update({ hwid: newHwid })
      .eq('id', user.id);

    // Update license HWID lock
    if (license) {
      await supabase
        .from('license_keys')
        .update({ hwid_locked: newHwid })
        .eq('id', license.id);
    }

    setHwid(newHwid);
  };

  // STRICT ACCESS CONTROL: If loading, show spinner. If loaded and no license, BLOCK ACCESS.
  if (licenseLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ad92ff]/20 border-t-[#ad92ff] rounded-full animate-spin" />
      </div>
    );
  }

  // If no license found after loading, show LOCKED screen
  if (!license) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-500/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="z-10 max-w-md w-full bg-[#0a0a0f] border border-red-500/20 rounded-3xl p-10 text-center shadow-2xl relative">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-zinc-500 text-sm mb-8">
            Your account does not have an active membership. Avion is a premium service and requires a valid license key to operate.
          </p>

          <button
            onClick={onSignOut}
            className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-xl transition-all border border-white/10"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mt-48 px-4 flex flex-col items-center">
      {/* License Activation Modal */}
      {showLicenseModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setShowLicenseModal(false)}
          />
          <div className="relative w-full max-w-md bg-[#0a0a0f] border border-white/[0.08] rounded-[40px] p-10 shadow-[0_32px_128px_rgba(0,0,0,0.9)] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ad92ff] to-transparent" />

            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold hero-heading">Activate License</h3>
                <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest mt-1">Enter your key below</p>
              </div>
              <button
                onClick={() => setShowLicenseModal(false)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-zinc-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleActivateLicense} className="space-y-6">
              {activationError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                  <p className="text-red-400 text-sm font-medium">{activationError}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">License Key</label>
                <input
                  type="text"
                  value={activatingKey}
                  onChange={(e) => setActivatingKey(e.target.value.toUpperCase())}
                  disabled={activationLoading}
                  className="w-full bg-black/40 border border-white/[0.06] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#ad92ff]/40 transition-all text-[14px] font-mono uppercase tracking-wider placeholder:text-zinc-800 disabled:opacity-50"
                  placeholder="AVION-XXXX-XXXX-XXXX"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={activationLoading}
                className="w-full bg-[#ad92ff] text-[#1a1a2e] font-bold py-4 rounded-2xl hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {activationLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#1a1a2e]/30 border-t-[#1a1a2e] rounded-full animate-spin" />
                    Activating...
                  </>
                ) : (
                  'Activate Key'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Changelog Modal Overlay - Premium Glassmorphism UI */}
      {showChangelog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setShowChangelog(false)}
          />
          <div className="relative w-full max-w-lg bg-[#0a0a0f] border border-white/[0.08] rounded-[40px] p-10 shadow-[0_32px_128px_rgba(0,0,0,0.9)] overflow-hidden transition-all animate-in fade-in zoom-in duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ad92ff] to-transparent" />

            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold hero-heading">What's New</h3>
                <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest mt-1">Avion Version History</p>
              </div>
              <button
                onClick={() => setShowChangelog(false)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-zinc-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-10 max-h-[450px] overflow-y-auto pr-3 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-8 h-8 border-2 border-[#ad92ff]/20 border-t-[#ad92ff] rounded-full animate-spin" />
                  <p className="text-zinc-500 text-sm font-medium">Fetching updates...</p>
                </div>
              ) : error ? (
                <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-3xl text-center">
                  <p className="text-red-400 text-sm font-medium mb-2">Failed to sync with repository</p>
                  <p className="text-zinc-600 text-xs">Displaying cached changelog data</p>
                </div>
              ) : null}

              {!loading && changelogs.map((log, index) => (
                <div key={index} className={`space-y-4 ${log.status !== 'Latest' ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm ${log.status === 'Latest'
                      ? 'bg-[#ad92ff]/10 text-[#ad92ff] shadow-[#ad92ff]/10'
                      : 'bg-white/5 text-zinc-500'
                      }`}>
                      {log.status}
                    </span>
                    <span className="text-zinc-400 text-sm font-bold">{log.version} ({log.date})</span>
                  </div>
                  <ul className="space-y-4 text-zinc-500 text-[15px] font-medium leading-relaxed">
                    {log.changes.map((change, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-3">
                        <span className={`${log.status === 'Latest' ? 'text-[#ad92ff]' : 'text-zinc-700'} mt-1.5 w-1.5 h-1.5 rounded-full bg-current`} />
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowChangelog(false)}
              className="w-full mt-10 bg-[#ad92ff] text-[#1a1a2e] font-bold py-4 rounded-2xl hover:brightness-110 transition-all active:scale-95 shadow-xl shadow-purple-500/10"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
        <div className="text-center md:text-left">
          <h2 className="text-5xl font-bold hero-heading mb-2">Hello, {user.username}.</h2>
          <p className="text-zinc-500 font-medium">Welcome to your Avion control panel.</p>
        </div>

        <button
          onClick={onSignOut}
          className="bg-white/5 border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/10 px-8 py-3 rounded-2xl font-bold text-sm transition-all"
        >
          Sign Out
        </button>
      </div>

      {/* License Status Card */}
      <div className="w-full mb-6">
        {licenseLoading ? (
          <div className="bg-[#0d0d14] border border-white/[0.05] p-8 rounded-[32px] shadow-xl flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#ad92ff]/20 border-t-[#ad92ff] rounded-full animate-spin" />
            <span className="ml-3 text-zinc-500 font-medium">Loading license...</span>
          </div>
        ) : (
          <LicenseStatus license={license} onRenew={() => setShowLicenseModal(true)} />
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
        <div className="bg-[#0d0d14] border border-white/[0.05] p-8 rounded-[32px] shadow-xl">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Membership</div>
          <div className="text-2xl font-bold text-[#ad92ff]">
            {license?.type === 'lifetime' ? 'Lifetime Premium' :
              license?.type === 'monthly' ? 'Monthly Premium' :
                license?.type === 'weekly' ? 'Weekly Premium' : 'No License'}
          </div>
          <div className="text-zinc-600 text-sm mt-2">
            {license?.activated_at
              ? `Active since ${new Date(license.activated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
              : 'No active subscription'}
          </div>
        </div>

        <div className="bg-[#0d0d14] border border-white/[0.05] p-8 rounded-[32px] shadow-xl md:col-span-2 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Hardware Identifier (HWID)</div>
            <div className="text-xl font-mono text-zinc-400 select-all">{hwid || 'Not assigned'}</div>
            <div className="text-zinc-600 text-xs mt-2 italic">* This key is locked to your current hardware.</div>
          </div>
          <button
            onClick={handleHWIDReset}
            className="bg-white/5 border border-white/[0.05] text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-white/10 transition-all"
          >
            Reset HWID
          </button>
        </div>
      </div>

      {/* Download Section */}
      <div className="w-full bg-[#ad92ff]/5 border border-[#ad92ff]/20 p-10 rounded-[40px] flex flex-col items-center text-center shadow-[0_20px_60px_rgba(173,146,255,0.03)]">
        <div className="w-16 h-16 bg-[#ad92ff] text-[#1a1a2e] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 3.449L9.75 2.1V11.719H0V3.449ZM0 12.332H9.75V21.9L0 20.551V12.332ZM10.706 1.969L24 0V11.719H10.706V1.969ZM10.706 12.332H24V24L10.706 22.031V12.332Z" />
          </svg>
        </div>
        <h3 className="text-3xl font-bold mb-4">Ready to execute?</h3>
        <p className="text-zinc-500 max-w-md mb-10 leading-relaxed">
          Download the latest client build (v2.4.1). Avion provides 100% UNC support and industry-leading stability.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <button
            disabled={!license}
            className="flex-1 bg-[#ad92ff] text-[#1a1a2e] font-bold py-4 rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-purple-500/10 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M0 3.449L9.75 2.1V11.719H0V3.449ZM0 12.332H9.75V21.9L0 20.551V12.332ZM10.706 1.969L24 0V11.719H10.706V1.969ZM10.706 12.332H24V24L10.706 22.031V12.332Z" />
            </svg>
            {license ? 'Download' : 'License Required'}
          </button>
          <button
            onClick={() => setShowChangelog(true)}
            className="flex-1 bg-white/5 border border-white/[0.1] text-white font-bold py-4 rounded-2xl hover:bg-white/10 transition-all"
          >
            Changelog
          </button>
        </div>
        {!license && (
          <p className="text-zinc-600 text-sm mt-4">
            You need an active license to download. <button onClick={() => setShowLicenseModal(true)} className="text-[#ad92ff] hover:underline">Activate a license</button>
          </p>
        )}
      </div>
    </div>
  );
};
