import { motion, Variants } from 'framer-motion';
import { PlusCircle, Search, FileText, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickActions = () => {
    const actions = [
        {
            icon: PlusCircle,
            label: 'নতুন ইস্যু যোগ করুন',
            engLabel: 'Add New Issue',
            to: '/admin/add-issue',
            color: 'from-blue-600 to-indigo-600',
            shadow: 'shadow-blue-200'
        },
        {
            icon: Search,
            label: 'ইস্যু খুঁজুন',
            engLabel: 'Search Issues',
            to: '/admin/manage-issues',
            color: 'from-fuchsia-600 to-purple-600',
            shadow: 'shadow-purple-200'
        },
        {
            icon: FileText,
            label: 'রিপোর্ট দেখুন',
            engLabel: 'View Reports',
            to: '/admin/reports',
            color: 'from-emerald-600 to-teal-600',
            shadow: 'shadow-emerald-200'
        },
        {
            icon: AlertCircle,
            label: 'জরুরি নিয়ন্ত্রণ',
            engLabel: 'Emergency Control',
            to: '/admin/emergency',
            color: 'from-rose-600 to-pink-600',
            shadow: 'shadow-rose-200'
        },
    ];

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, scale: 0.8, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { type: 'spring' as const, stiffness: 260, damping: 20 }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
            {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                    <motion.div key={index} variants={itemVariants}>
                        <Link
                            to={action.to}
                            className={`group relative flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-br ${action.color} text-white shadow-xl ${action.shadow} transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 active:scale-95 overflow-hidden`}
                        >
                            {/* Animated background shine */}
                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none transform skew-x-12" />

                            <motion.div
                                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                                className="mb-3 p-3 bg-white/20 backdrop-blur-md rounded-xl"
                            >
                                <Icon className="w-8 h-8" />
                            </motion.div>

                            <div className="text-center">
                                <p className="font-bold text-sm tracking-tight">{action.label}</p>
                                <p className="text-[10px] uppercase font-black tracking-widest opacity-70 mt-0.5">{action.engLabel}</p>
                            </div>
                        </Link>
                    </motion.div>
                );
            })}
        </motion.div>
    );
};

export default QuickActions;
