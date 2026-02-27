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
        if (trend === 'up') return 'text-green-600 bg-green-50';
        if (trend === 'down') return 'text-red-600 bg-red-50';
        return 'text-slate-500 bg-slate-100';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-md hover:border-primary/20 transition-all duration-300 group"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${color} shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {trend && trendValue && (
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border border-transparent ${getTrendColor()}`}>
                        {getTrendIcon()}
                        <span>{trendValue}</span>
                    </div>
                )}
            </div>

            <div>
                <p className="text-3xl font-bold text-slate-800 mb-1 group-hover:scale-105 transition-transform origin-left">{value}</p>
                <p className="text-sm font-semibold text-slate-600">{title}</p>
                {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
            </div>
        </motion.div>
    );
});

export default StatsCard;
