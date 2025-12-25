import { motion } from 'framer-motion';
import { Activity, Wifi, WifiOff } from 'lucide-react';

interface HealthIndicatorProps {
    status: 'healthy' | 'warning' | 'error';
    message?: string;
}

const HealthIndicator = ({ status, message }: HealthIndicatorProps) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'healthy':
                return {
                    color: 'bg-green-500',
                    text: 'সিস্টেম ভালো আছে',
                    engText: 'System Healthy',
                    icon: <Wifi className="w-4 h-4" />,
                    textColor: 'text-green-700',
                    bgColor: 'bg-green-50'
                };
            case 'warning':
                return {
                    color: 'bg-yellow-500',
                    text: 'সতর্কতা',
                    engText: 'Warning',
                    icon: <Activity className="w-4 h-4" />,
                    textColor: 'text-yellow-700',
                    bgColor: 'bg-yellow-50'
                };
            case 'error':
                return {
                    color: 'bg-red-500',
                    text: 'সমস্যা',
                    engText: 'Error',
                    icon: <WifiOff className="w-4 h-4" />,
                    textColor: 'text-red-700',
                    bgColor: 'bg-red-50'
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className={`${config.bgColor} border border-${status === 'healthy' ? 'green' : status === 'warning' ? 'yellow' : 'red'}-200 rounded-lg p-4`}>
            <div className="flex items-center space-x-3">
                <div className="relative">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className={`${config.color} w-3 h-3 rounded-full`}
                    />
                    <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className={`absolute inset-0 ${config.color} rounded-full`}
                    />
                </div>

                <div className="flex-1">
                    <div className="flex items-center space-x-2">
                        <div className={config.textColor}>
                            {config.icon}
                        </div>
                        <p className={`font-semibold text-sm ${config.textColor}`}>
                            {config.text} · {config.engText}
                        </p>
                    </div>
                    {message && (
                        <p className={`text-xs ${config.textColor} mt-1`}>{message}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HealthIndicator;
