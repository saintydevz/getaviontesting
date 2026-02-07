import React, { useState, useEffect } from 'react';
import { Turnstile } from './Turnstile';
import { CONFIG } from '../lib/config';

interface CloudflareLoadingProps {
    onVerified: () => void;
}

const TURNSTILE_SITE_KEY = CONFIG.TURNSTILE_SITE_KEY;

export const CloudflareLoading: React.FC<CloudflareLoadingProps> = ({ onVerified }) => {
    const [status, setStatus] = useState<'verifying' | 'verified' | 'error'>('verifying');
    const [fadeOut, setFadeOut] = useState(false);

    const handleVerify = (token: string) => {
        if (token) {
            setStatus('verified');
            // Store token for potential server-side verification
            sessionStorage.setItem('cf_clearance', token);

            // Delay before transitioning to show success state
            setTimeout(() => {
                setFadeOut(true);
                setTimeout(() => {
                    onVerified();
                }, 500);
            }, 800);
        }
    };

    const handleError = () => {
        setStatus('error');
        console.error('Turnstile verification failed.');
    };

    return (
        <div className={`fixed inset-0 z-[9999] bg-[#0a0a0f] flex flex-col items-center justify-center px-4 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#ad92ff]/5 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#6366f1]/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Grid Pattern Overlay */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
                    backgroundSize: '50px 50px',
                }}
            />

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center max-w-md w-full">
                {/* Logo/Brand */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-white tracking-tight mb-2">AVION</h1>
                    <p className="text-zinc-500 text-sm">Security Verification</p>
                </div>

                {/* Status Icon */}
                <div className="relative mb-8">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${status === 'verified'
                        ? 'bg-emerald-500/20 border border-emerald-500/30'
                        : status === 'error'
                            ? 'bg-red-500/20 border border-red-500/30'
                            : 'bg-[#ad92ff]/10 border border-[#ad92ff]/20'
                        }`}>
                        {status === 'verified' ? (
                            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : status === 'error' ? (
                            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-8 h-8 text-[#ad92ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        )}
                    </div>
                </div>

                {/* Status Text */}
                <h2 className="text-xl font-semibold text-white mb-2">
                    {status === 'verified' ? 'Verified!' : status === 'error' ? 'Verification Failed' : 'Checking your browser'}
                </h2>
                <p className="text-zinc-500 text-sm mb-8 text-center">
                    {status === 'verified'
                        ? 'Redirecting you to Avion...'
                        : status === 'error'
                            ? 'Please refresh the page to try again.'
                            : 'This process is automatic. Please wait...'}
                </p>

                {/* Turnstile Widget Container */}
                <div className={`bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 transition-all duration-300 ${status === 'verified' ? 'opacity-50' : 'opacity-100'
                    }`}>
                    <Turnstile
                        siteKey={TURNSTILE_SITE_KEY}
                        onVerify={handleVerify}
                        onError={handleError}
                        theme="dark"
                        size="normal"
                    />
                </div>

                {/* Cloudflare Branding */}
                <div className="mt-10 flex items-center gap-2 text-zinc-600 text-xs">
                    <svg className="w-5 h-5" viewBox="0 0 61 24" fill="currentColor">
                        <path d="M14.784 5.556c-.39 0-.764.032-1.13.094l-.3.524a.37.37 0 0 1-.044.058l-2.24 2.8a.374.374 0 0 0 .292.612h4.7c.456 0 .883.123 1.252.337l.185-.231 1.93-2.412a.374.374 0 0 0-.292-.612h-3.113c-.437 0-.812-.294-.924-.718a.965.965 0 0 0-.316-.452zM9.36 15.228a.374.374 0 0 0 .292.612h4.7a2.03 2.03 0 0 1 1.252.437l.185-.231 1.93-2.412a.374.374 0 0 0-.292-.612h-3.113c-.437 0-.812-.294-.924-.718a.966.966 0 0 0-.316-.452l-3.714-.032v3.408z" />
                        <path d="M20.94 9.756c-.218 1.313-.895 2.458-1.856 3.304l-1.93 2.412-.185.231c.369.214.8.337 1.252.337h4.7a.374.374 0 0 0 .292-.612l-2.24-2.8a.374.374 0 0 1-.044-.058l-.3-.524a4.09 4.09 0 0 1-1.13.094 4.09 4.09 0 0 1 1.44-2.384z" />
                    </svg>
                    <span>Protected by Cloudflare</span>
                </div>
            </div>
        </div>
    );
};
