import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Shield, Users, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface StaffMember {
    id: string;
    name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'dept_head' | 'staff' | 'viewer';
    department: string;
    assignedIssues: number;
    resolvedIssues: number;
    status: 'available' | 'busy' | 'offline';
}

const StaffManagement = () => {
    const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
        {
            id: '1',
            name: 'Dr. Rahman',
            email: 'rahman@icst.edu',
            role: 'admin',
            department: 'IT',
            assignedIssues: 12,
            resolvedIssues: 45,
            status: 'available'
        },
        {
            id: '2',
            name: 'Prof. Ahmed',
            email: 'ahmed@icst.edu',
            role: 'dept_head',
            department: 'CSE',
            assignedIssues: 8,
            resolvedIssues: 32,
            status: 'busy'
        },
    ]);

    const [showAddForm, setShowAddForm] = useState(false);
    const [newStaff, setNewStaff] = useState<{
        name: string;
        email: string;
        role: StaffMember['role'];
        department: string;
        password: string;
    }>({
        name: '',
        email: '',
        role: 'staff',
        department: 'CSE',
        password: ''
    });

    const handleAddStaff = () => {
        if (!newStaff.name || !newStaff.email || !newStaff.password) {
            toast.error('সব ফিল্ড পূরণ করুন');
            return;
        }

        toast.success('স্টাফ সফলভাবে যোগ করা হয়েছে');
        setShowAddForm(false);
        setNewStaff({ name: '', email: '', role: 'staff', department: 'CSE', password: '' });
    };

    const getRoleName = (role: StaffMember['role']) => {
        const roles = {
            super_admin: 'Super Admin',
            admin: 'Admin',
            dept_head: 'Department Head',
            staff: 'Staff Member',
            viewer: 'Viewer'
        };
        return roles[role];
    };

    const getStatusColor = (status: StaffMember['status']) => {
        const colors = {
            available: 'bg-green-100 text-green-800',
            busy: 'bg-yellow-100 text-yellow-800',
            offline: 'bg-gray-100 text-gray-800'
        };
        return colors[status];
    };

    const getStatusText = (status: StaffMember['status']) => {
        const texts = {
            available: 'Available',
            busy: 'Busy',
            offline: 'Offline'
        };
        return texts[status];
    };

    return (
        <div className="w-full">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">🧑‍💼 Staff Management</h1>
                        <p className="text-gray-600 mt-1">স্টাফ এবং কর্তৃপক্ষ ব্যবস্থাপনা</p>
                    </div>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
                    >
                        <UserPlus className="w-5 h-5" />
                        <span>নতুন স্টাফ যোগ করুন</span>
                    </button>
                </div>
            </motion.div>

            {/* Add Staff Form */}
            {showAddForm && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                >
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">নতুন স্টাফ তথ্য</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">নাম</label>
                                    <input
                                        type="text"
                                        value={newStaff.name}
                                        onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                        placeholder="Staff Name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">ইমেইল</label>
                                    <input
                                        type="email"
                                        value={newStaff.email}
                                        onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                        placeholder="email@icst.edu"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                    <select
                                        value={newStaff.role}
                                        onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as StaffMember['role'] })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                    >
                                        <option value="staff">Staff Member</option>
                                        <option value="dept_head">Department Head</option>
                                        <option value="admin">Admin</option>
                                        <option value="super_admin">Super Admin</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">ডিপার্টমেন্ট</label>
                                    <select
                                        value={newStaff.department}
                                        onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                    >
                                        <option value="IT">IT</option>
                                        <option value="CSE">CSE</option>
                                        <option value="EEE">EEE</option>
                                        <option value="Administration">Administration</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">পাসওয়ার্ড</label>
                                    <input
                                        type="password"
                                        value={newStaff.password}
                                        onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                        placeholder="Strong password"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 mt-4">
                                <button
                                    onClick={handleAddStaff}
                                    className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                                >
                                    স্টাফ যোগ করুন
                                </button>
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-semibold transition-colors"
                                >
                                    বাতিল করুন
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-4">
                        <Users className="w-8 h-8 mb-2" />
                        <p className="text-sm opacity-90">মোট স্টাফ</p>
                        <p className="text-3xl font-bold">{staffMembers.length}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent className="p-4">
                        <Shield className="w-8 h-8 mb-2" />
                        <p className="text-sm opacity-90">Admins</p>
                        <p className="text-3xl font-bold">{staffMembers.filter(s => s.role === 'admin' || s.role === 'super_admin').length}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-4">
                        <Activity className="w-8 h-8 mb-2" />
                        <p className="text-sm opacity-90">সক্রিয়</p>
                        <p className="text-3xl font-bold">{staffMembers.filter(s => s.status === 'available').length}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <CardContent className="p-4">
                        <Users className="w-8 h-8 mb-2" />
                        <p className="text-sm opacity-90">গড় Workload</p>
                        <p className="text-3xl font-bold">
                            {Math.round(staffMembers.reduce((acc, s) => acc + s.assignedIssues, 0) / staffMembers.length)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Staff List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staffMembers.map((staff) => (
                    <motion.div
                        key={staff.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-gray-800">{staff.name}</h3>
                                        <p className="text-sm text-gray-600">{staff.email}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(staff.status)}`}>
                                        {getStatusText(staff.status)}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Role:</span>
                                        <span className="font-medium text-gray-800">{getRoleName(staff.role)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Department:</span>
                                        <span className="font-medium text-gray-800">{staff.department}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Assigned:</span>
                                        <span className="font-medium text-orange-600">{staff.assignedIssues}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Resolved:</span>
                                        <span className="font-medium text-green-600">{staff.resolvedIssues}</span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button className="flex-1 bg-sky-100 hover:bg-sky-200 text-sky-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors">
                                        Edit
                                    </button>
                                    <button className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors">
                                        Performance
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default StaffManagement;
