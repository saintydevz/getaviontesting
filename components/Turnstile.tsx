import React, { useEffect, useRef, useState } from 'react';

interface TurnstileProps {
    siteKey: string;
    onVerify: (token: string) => void;
    onError?: () => void;
    onExpire?: () => void;
    theme?: 'light' | 'dark' | 'auto';
    size?: 'normal' | 'compact' | 'invisible';
}

declare global {
    interface Window {
        turnstile: {
            render: (container: HTMLElement, options: any) => string;
            reset: (widgetId: string) => void;
            remove: (widgetId: string) => void;
        };
        onTurnstileLoad?: () => void;
    }
}

export const Turnstile: React.FC<TurnstileProps> = ({
    siteKey,
    onVerify,
    onError,
    onExpire,
    theme = 'dark',
    size = 'normal',
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Load Turnstile script if not already loaded
        const existingScript = document.querySelector('script[src*="turnstile"]');

        if (!existingScript) {
            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
            script.async = true;
            script.defer = true;

            window.onTurnstileLoad = () => {
                setIsLoaded(true);
            };

            document.head.appendChild(script);
        } else if (window.turnstile) {
            setIsLoaded(true);
        } else {
            // Script exists but not loaded yet
            window.onTurnstileLoad = () => {
                setIsLoaded(true);
            };
        }

        return () => {
            // Cleanup widget on unmount
            if (widgetIdRef.current && window.turnstile) {
                try {
                    window.turnstile.remove(widgetIdRef.current);
                } catch (e) {
                    // Widget may already be removed
                }
            }
        };
    }, []);

    useEffect(() => {
        if (isLoaded && containerRef.current && window.turnstile) {
            // Remove existing widget if any
            if (widgetIdRef.current) {
                try {
                    window.turnstile.remove(widgetIdRef.current);
                } catch (e) {
                    // Widget may already be removed
                }
            }

            // Render new widget
            widgetIdRef.current = window.turnstile.render(containerRef.current, {
                sitekey: siteKey,
                theme,
                size,
                callback: (token: string) => {
                    onVerify(token);
                },
                'error-callback': () => {
                    onError?.();
                },
                'expired-callback': () => {
                    onExpire?.();
                },
            });
        }
    }, [isLoaded, siteKey, theme, size, onVerify, onError, onExpire]);

    return (
        <div className="flex justify-center">
            <div ref={containerRef} className="turnstile-container" />
            {!isLoaded && (
                <div className="flex items-center gap-2 text-zinc-500 text-sm py-4">
                    <div className="w-4 h-4 border-2 border-zinc-600 border-t-[#ad92ff] rounded-full animate-spin" />
                    <span>Loading security check...</span>
                </div>
            )}
        </div>
    );
};

// Hook for verifying Turnstile token on the server
export const useTurnstileVerification = () => {
    const verifyToken = async (token: string, secretKey: string): Promise<boolean> => {
        try {
            const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    secret: secretKey,
                    response: token,
                }),
            });

            const data = await response.json();
            return data.success === true;
        } catch (error) {
            console.error('Turnstile verification error:', error);
            return false;
        }
    };

    return { verifyToken };
};
