import { PlusCircle, Search, FileText, Settings, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickActions = () => {
    const actions = [
        {
            icon: PlusCircle,
            label: 'নতুন ইস্যু যোগ করুন',
            engLabel: 'Add New Issue',
            to: '/admin/add-issue',
            color: 'from-blue-500 to-blue-600',
            hoverColor: 'hover:from-blue-600 hover:to-blue-700'
        },
        {
            icon: Search,
            label: 'ইস্যু খুঁজুন',
            engLabel: 'Search Issues',
            to: '/admin/manage-issues',
            color: 'from-purple-500 to-purple-600',
            hoverColor: 'hover:from-purple-600 hover:to-purple-700'
        },
        {
            icon: FileText,
            label: 'রিপোর্ট দেখুন',
            engLabel: 'View Reports',
            to: '/admin/reports',
            color: 'from-green-500 to-green-600',
            hoverColor: 'hover:from-green-600 hover:to-green-700'
        },
        {
            icon: AlertCircle,
            label: 'জরুরি নিয়ন্ত্রণ',
            engLabel: 'Emergency Control',
            to: '/admin/emergency',
            color: 'from-red-500 to-red-600',
            hoverColor: 'hover:from-red-600 hover:to-red-700'
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                    <Link
                        key={index}
                        to={action.to}
                        className={`bg-gradient-to-r ${action.color} ${action.hoverColor} text-white p-4 rounded-xl shadow-lg transition-all transform hover:scale-105 hover:shadow-xl`}
                    >
                        <div className="flex flex-col items-center space-y-2">
                            <Icon className="w-8 h-8" />
                            <div className="text-center">
                                <p className="font-semibold text-sm">{action.label}</p>
                                <p className="text-xs opacity-90">{action.engLabel}</p>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
};

export default QuickActions;
