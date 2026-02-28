import React from 'react';

export const LiquidBackground = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="relative min-h-screen w-full bg-white text-slate-800">
            {/* Performance-Optimized Background — No mix-blend on mobile (handled by CSS) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-gradient-to-br from-white via-sky-50 to-purple-50">

                {/* Blob 1 - Reduced blur for mobile perf (40px vs 100px) */}
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-300/30 blur-[40px] md:blur-[100px] animate-blob mix-blend-multiply" />

                {/* Blob 2 */}
                <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-sky-200/40 blur-[35px] md:blur-[90px] animate-blob delay-2000 mix-blend-multiply" />

                {/* Blob 3 */}
                <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-indigo-200/30 blur-[50px] md:blur-[120px] animate-blob delay-4000 mix-blend-multiply" />

                {/* Noise texture — hidden on mobile for perf */}
                <div className="hidden md:block absolute inset-0 z-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
            </div>

            {/* Content Layer */}
            <div className="relative z-10 w-full min-h-screen">
                {children}
            </div>
        </div>
    );
};
