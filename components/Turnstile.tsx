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
    const callbacksRef = useRef({ onVerify, onError, onExpire });
    const [isLoaded, setIsLoaded] = useState(false);
    const [isRendered, setIsRendered] = useState(false);

    useEffect(() => {
        callbacksRef.current = { onVerify, onError, onExpire };
    }, [onVerify, onError, onExpire]);

    useEffect(() => {
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
            const originalOnLoad = window.onTurnstileLoad;
            window.onTurnstileLoad = () => {
                originalOnLoad?.();
                setIsLoaded(true);
            };
        }

        return () => {
            if (widgetIdRef.current && window.turnstile) {
                try {
                    window.turnstile.remove(widgetIdRef.current);
                    widgetIdRef.current = null;
                } catch (e) { }
            }
        };
    }, []);

    useEffect(() => {
        if (isLoaded && containerRef.current && window.turnstile && !isRendered) {
            widgetIdRef.current = window.turnstile.render(containerRef.current, {
                sitekey: siteKey,
                theme,
                size,
                callback: (token: string) => {
                    callbacksRef.current.onVerify(token);
                },
                'error-callback': () => {
                    callbacksRef.current.onError?.();
                },
                'expired-callback': () => {
                    callbacksRef.current.onExpire?.();
                },
            });
            setIsRendered(true);
        }
    }, [isLoaded, siteKey, theme, size, isRendered]);

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
