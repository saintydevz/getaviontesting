import React, { useState, useEffect } from 'react';
import { LicenseKey, licenseHelpers } from '../lib/supabase';

interface LicenseStatusProps {
    license: LicenseKey | null;
    onRenew?: () => void;
}

export const LicenseStatus: React.FC<LicenseStatusProps> = ({ license, onRenew }) => {
    const [timeInfo, setTimeInfo] = useState<{
        isExpired: boolean;
        timeRemaining: string;
        daysRemaining: number;
        hoursRemaining: number;
        minutesRemaining: number;
    } | null>(null);

    useEffect(() => {
        if (!license) return;

        const updateTime = async () => {
            const info = await licenseHelpers.checkLicenseExpiration(license);
            setTimeInfo(info);
        };

        updateTime();

        // Update every minute
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, [license]);

    if (!license) {
        return (
            <div className="bg-[#0d0d14] border border-white/[0.05] p-8 rounded-[32px] shadow-xl">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">License Status</div>
                        <div className="text-xl font-bold text-amber-400 mb-2">No Active License</div>
                        <p className="text-zinc-500 text-sm mb-4">You don't have an active license key. Get one to access all features.</p>
                        <button
                            onClick={onRenew}
                            className="bg-[#ad92ff] text-[#1a1a2e] font-bold px-6 py-3 rounded-xl hover:brightness-110 transition-all text-sm"
                        >
                            Get License Key
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isLifetime = license.type === 'lifetime';
    const isWeekly = license.type === 'weekly';
    const isMonthly = license.type === 'monthly';

    // Determine urgency level
    const getUrgencyColor = () => {
        if (!timeInfo || isLifetime) return { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/20' };
        if (timeInfo.isExpired) return { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/20' };
        if (timeInfo.daysRemaining <= 1) return { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/20' };
        if (timeInfo.daysRemaining <= 3) return { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/20' };
        return { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/20' };
    };

    const colors = getUrgencyColor();

    // Calculate progress percentage for weekly license
    const getProgress = () => {
        if (!timeInfo || isLifetime || timeInfo.isExpired) return 0;
        const totalDays = isWeekly ? 7 : 30;
        return Math.max(0, Math.min(100, (timeInfo.daysRemaining / totalDays) * 100));
    };

    return (
        <div className={`bg-[#0d0d14] border ${timeInfo?.isExpired ? 'border-red-500/20' : 'border-white/[0.05]'} p-8 rounded-[32px] shadow-xl`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">License Status</div>
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${isLifetime ? 'bg-[#ad92ff]/10 text-[#ad92ff]' :
                                isWeekly ? 'bg-blue-500/10 text-blue-400' :
                                    'bg-emerald-500/10 text-emerald-400'
                            }`}>
                            {license.type}
                        </span>
                    </div>

                    {timeInfo?.isExpired ? (
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-red-400">License Expired</div>
                                <p className="text-zinc-500 text-sm mt-1">Your license has expired. Renew to continue using Avion.</p>
                            </div>
                        </div>
                    ) : isLifetime ? (
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#ad92ff]/10 border border-[#ad92ff]/20 flex items-center justify-center">
                                <svg className="w-6 h-6 text-[#ad92ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-[#ad92ff]">Lifetime Access</div>
                                <p className="text-zinc-500 text-sm mt-1">Your license never expires. Enjoy unlimited access forever.</p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-baseline gap-3 mb-4">
                                <span className={`text-4xl font-bold ${colors.text}`}>
                                    {timeInfo?.daysRemaining || 0}
                                </span>
                                <span className="text-zinc-500 font-medium">
                                    days, {timeInfo?.hoursRemaining || 0}h {timeInfo?.minutesRemaining || 0}m remaining
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${colors.bg} rounded-full transition-all duration-500`}
                                    style={{ width: `${getProgress()}%` }}
                                />
                            </div>

                            <div className="flex items-center justify-between mt-3 text-xs text-zinc-600">
                                <span>Activated: {license.activated_at ? new Date(license.activated_at).toLocaleDateString() : 'N/A'}</span>
                                <span>Expires: {license.expires_at ? new Date(license.expires_at).toLocaleDateString() : 'Never'}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Button */}
                {(timeInfo?.isExpired || (timeInfo && timeInfo.daysRemaining <= 3 && !isLifetime)) && (
                    <button
                        onClick={onRenew}
                        className={`px-8 py-4 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${timeInfo.isExpired
                                ? 'bg-red-500 text-white hover:brightness-110'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {timeInfo.isExpired ? 'Renew Now' : 'Renew Soon'}
                    </button>
                )}
            </div>

            {/* License Key Display */}
            <div className="mt-6 pt-6 border-t border-white/[0.05]">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">License Key</div>
                        <div className="text-sm font-mono text-zinc-400">{license.key}</div>
                    </div>
                    <button
                        onClick={() => navigator.clipboard.writeText(license.key)}
                        className="p-3 rounded-xl bg-white/5 border border-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
