import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Alert {
    id: string;
    type: 'critical' | 'warning' | 'info';
    title: string;
    message: string;
    issueId?: string;
    timestamp: Date;
}

interface AlertBannerProps {
    alerts: Alert[];
    onDismiss: (id: string) => void;
}

const AlertBanner = ({ alerts, onDismiss }: AlertBannerProps) => {
    const getAlertColor = (type: Alert['type']) => {
        switch (type) {
            case 'critical': return 'bg-red-50 border-red-200 text-red-800';
            case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };

    const getAlertIcon = (type: Alert['type']) => {
        const baseClass = "w-5 h-5";
        switch (type) {
            case 'critical': return <AlertTriangle className={`${baseClass} text-red-600`} />;
            case 'warning': return <AlertTriangle className={`${baseClass} text-yellow-600`} />;
            case 'info': return <AlertTriangle className={`${baseClass} text-blue-600`} />;
        }
    };

    if (alerts.length === 0) return null;

    return (
        <div className="space-y-3 mb-6">
            <AnimatePresence>
                {alerts.map((alert) => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`border rounded-lg p-4 ${getAlertColor(alert.type)}`}
                    >
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-0.5">
                                {getAlertIcon(alert.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm">{alert.title}</p>
                                <p className="text-sm mt-1">{alert.message}</p>
                                {alert.issueId && (
                                    <Link
                                        to={`/issues/${alert.issueId}`}
                                        className="inline-flex items-center space-x-1 text-xs font-medium mt-2 hover:underline"
                                    >
                                        <span>ইস্যু দেখুন</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </Link>
                                )}
                            </div>

                            <button
                                onClick={() => onDismiss(alert.id)}
                                className="flex-shrink-0 p-1 hover:bg-white/50 rounded transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default AlertBanner;
