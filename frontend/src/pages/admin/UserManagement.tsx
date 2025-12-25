import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, UserX, UserCheck, Key, Eye, BarChart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/services/api';
import { toast } from 'sonner';

interface User {
    _id: string;
    name: string;
    email: string;
    roll: string;
    department: string;
    role: string;
    isBlocked?: boolean;
    createdAt: string;
    issueCount?: number;
}

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            // TODO: Replace with actual API endpoint
            const { data } = await api.get('/admin/users');
            setUsers(data);
        } catch (error) {
            // Demo data for now
            setUsers([
                {
                    _id: '1',
                    name: 'Ahmed Hassan',
                    email: 'ahmed@icst.edu',
                    roll: '2021-1-60-100',
                    department: 'CSE',
                    role: 'user',
                    isBlocked: false,
                    createdAt: new Date().toISOString(),
                    issueCount: 5
                },
                {
                    _id: '2',
                    name: 'Fatima Rahman',
                    email: 'fatima@icst.edu',
                    roll: '2021-1-60-101',
                    department: 'EEE',
                    role: 'user',
                    isBlocked: false,
                    createdAt: new Date().toISOString(),
                    issueCount: 3
                },
                {
                    _id: '3',
                    name: 'Karim Islam',
                    email: 'karim@icst.edu',
                    roll: '2021-1-60-102',
                    department: 'CSE',
                    role: 'user',
                    isBlocked: true,
                    createdAt: new Date().toISOString(),
                    issueCount: 12
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleBlockToggle = async (userId: string, isBlocked: boolean) => {
        try {
            // TODO: API call
            setUsers(prev => prev.map(u =>
                u._id === userId ? { ...u, isBlocked: !isBlocked } : u
            ));
            toast.success(isBlocked ? 'ইউজার আনব্লক করা হয়েছে' : 'ইউজার ব্লক করা হয়েছে');
        } catch (error) {
            toast.error('অপারেশন সফল হয়নি');
        }
    };

    const handlePasswordReset = async (userId: string, email: string) => {
        try {
            // TODO: API call
            toast.success(`পাসওয়ার্ড রিসেট লিংক ${email} এ পাঠানো হয়েছে`);
        } catch (error) {
            toast.error('পাসওয়ার্ড রিসেট সফল হয়নি');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.roll.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment = departmentFilter === 'all' || user.department === departmentFilter;
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;

        return matchesSearch && matchesDepartment && matchesRole;
    });

    return (
        <div className="w-full">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <h1 className="text-3xl font-bold text-gray-800">👥 User Management</h1>
                <p className="text-gray-600 mt-1">সব ইউজার ব্যবস্থাপনা এবং নিয়ন্ত্রণ</p>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-4">
                        <p className="text-sm opacity-90">মোট ইউজার</p>
                        <p className="text-3xl font-bold">{users.length}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent className="p-4">
                        <p className="text-sm opacity-90">সক্রিয়</p>
                        <p className="text-3xl font-bold">{users.filter(u => !u.isBlocked).length}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
                    <CardContent className="p-4">
                        <p className="text-sm opacity-90">ব্লক করা</p>
                        <p className="text-3xl font-bold">{users.filter(u => u.isBlocked).length}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-4">
                        <p className="text-sm opacity-90">আজকে নতুন</p>
                        <p className="text-3xl font-bold">12</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="নাম, রোল বা ইমেইল দিয়ে খুঁজুন..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                            />
                        </div>

                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        >
                            <option value="all">সব ডিপার্টমেন্ট</option>
                            <option value="CSE">CSE</option>
                            <option value="EEE">EEE</option>
                            <option value="CE">CE</option>
                            <option value="BBA">BBA</option>
                            <option value="English">English</option>
                        </select>

                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        >
                            <option value="all">সব Role</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* User Table */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">লোড হচ্ছে...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">কোন ইউজার পাওয়া যায়নি</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">নাম</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">রোল</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ডিপার্টমেন্ট</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ইমেইল</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ইস্যু</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">স্ট্যাটাস</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">অ্যাকশন</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.map((user) => (
                                        <motion.tr
                                            key={user._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{user.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {user.roll}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                    {user.department}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {user.issueCount || 0}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.isBlocked ? (
                                                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                                        Blocked
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                                        Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleBlockToggle(user._id, user.isBlocked || false)}
                                                        className={`p-2 rounded-lg transition-colors ${user.isBlocked
                                                                ? 'text-green-600 hover:bg-green-50'
                                                                : 'text-red-600 hover:bg-red-50'
                                                            }`}
                                                        title={user.isBlocked ? 'আনব্লক করুন' : 'ব্লক করুন'}
                                                    >
                                                        {user.isBlocked ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handlePasswordReset(user._id, user.email)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="পাসওয়ার্ড রিসেট"
                                                    >
                                                        <Key className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                        title="বিস্তারিত দেখুন"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                                        title="পরিসংখ্যান"
                                                    >
                                                        <BarChart className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default UserManagement;
