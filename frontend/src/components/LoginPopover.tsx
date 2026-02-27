import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import React, { useState, useEffect } from "react";

export const LoginPopover = ({ children, requireAuth, message = "এই কাজটির জন্য লগইন প্রয়োজন" }: { children: React.ReactNode, requireAuth: boolean, message?: string }) => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) return;

        const handleScroll = () => {
            setOpen(false);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('wheel', handleScroll, { passive: true });
        window.addEventListener('touchmove', handleScroll, { passive: true });

        // Cleanup function
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('wheel', handleScroll);
            window.removeEventListener('touchmove', handleScroll);
        };
    }, [open]);

    if (!requireAuth) {
        return <>{children}</>;
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div
                    onClickCapture={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpen(true);
                    }}
                    className="relative inline-flex w-full h-full cursor-pointer flex-1"
                >
                    {/* Intercept overlay */}
                    <div className="absolute inset-0 z-10" />
                    <div className="opacity-80 pointer-events-none w-full h-full flex flex-1">
                        {children}
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent
                side="top"
                sideOffset={12}
                onInteractOutside={() => setOpen(false)}
                className="w-64 p-5 flex flex-col items-center justify-center gap-3 bg-white border border-slate-100 shadow-2xl rounded-2xl z-[100] animate-in fade-in zoom-in-95"
            >
                <AlertCircle size={32} className="text-red-500" />
                <div className="text-center space-y-1">
                    <p className="font-bold text-slate-800 text-base">লগইন প্রয়োজন</p>
                    <p className="text-xs text-slate-500 font-medium">{message}</p>
                </div>
                <button
                    onClick={() => navigate('/user/login')}
                    className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
                >
                    লগইন করুন
                </button>
            </PopoverContent>
        </Popover>
    );
};
