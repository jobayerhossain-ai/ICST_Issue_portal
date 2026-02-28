import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: number;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    delay?: number;
}

const StatsCard = React.memo(({ title, value, subtitle, trend, trendValue, icon: Icon, color, delay = 0 }: StatsCardProps) => {
    const getTrendIcon = () => {
        if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
        if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
        return <Minus className="w-4 h-4" />;
    };

    const getTrendColor = () => {
        if (trend === 'up') return 'text-green-600 bg-green-50/50';
        if (trend === 'down') return 'text-red-600 bg-red-50/50';
        return 'text-slate-500 bg-slate-100/50';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                delay,
                type: 'spring',
                stiffness: 100,
                damping: 20,
                mass: 1
            }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:border-primary/30 transition-all duration-500 group relative overflow-hidden"
        >
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="flex items-center justify-between mb-5 relative z-10">
                <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg shadow-black/5`}
                >
                    <Icon className="w-6 h-6 text-white" />
                </motion.div>
                {trend && trendValue && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border border-white/20 ${getTrendColor()}`}
                    >
                        {getTrendIcon()}
                        <span>{trendValue}</span>
                    </motion.div>
                )}
            </div>

            <div className="relative z-10">
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-3xl font-black text-slate-800 tracking-tight mb-0.5"
                >
                    {value}
                </motion.p>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</p>
                {subtitle && (
                    <div className="flex items-center mt-2 pt-2 border-t border-slate-100/50">
                        <p className="text-[11px] font-medium text-slate-400 leading-relaxed italic">{subtitle}</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
});

export default StatsCard;
