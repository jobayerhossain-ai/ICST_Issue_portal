import React, { useEffect } from 'react';
import Lenis from 'lenis';

interface SmoothScrollProviderProps {
    children: React.ReactNode;
}

// Disable Lenis smooth scroll on mobile — native scroll is faster and more battery-efficient
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

export const SmoothScrollProvider = ({ children }: SmoothScrollProviderProps) => {
    useEffect(() => {
        // On mobile, skip Lenis entirely — native iOS/Android scroll is already optimized
        if (isMobile) return;

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1.5,
            touchMultiplier: 2,
            infinite: false,
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
};
