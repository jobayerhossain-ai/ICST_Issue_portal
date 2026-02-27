import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Shield, Users, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';

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

const defaultStaff: StaffMember[] = [];

const StaffManagement = () => {
    const queryClient = useQueryClient();
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

    const { data: staffMembers = defaultStaff } = useQuery<StaffMember[]>({
        queryKey: ['adminStaff'],
        queryFn: async () => {
            const { data } = await api.get('/admin/staff');
            return data;
        },
        staleTime: 30000,
        gcTime: 600000,
        refetchInterval: 10000,
        placeholderData: (prev) => prev ?? defaultStaff,
    });

    const addStaffMutation = useMutation({
        mutationFn: async (staffData: typeof newStaff) => {
            const { data } = await api.post('/admin/staff', staffData);
            return data;
        },
        onSuccess: () => {
            toast.success('Staff member added successfully');
            setShowAddForm(false);
            setNewStaff({ name: '', email: '', role: 'staff', department: 'CSE', password: '' });
            queryClient.invalidateQueries({ queryKey: ['adminStaff'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to add staff member');
        }
    });

    const handleAddStaff = () => {
        if (!newStaff.name || !newStaff.email || !newStaff.password) {
            toast.error('Please fill all fields');
            return;
        }

        addStaffMutation.mutate(newStaff);
    };

    const getRoleName = (role: StaffMember['role']) => {
        const roles = {
            super_admin: 'Super Admin',
            admin: 'Admin',
            dept_head: 'Department Head',
            staff: 'Staff Member',
            viewer: 'Viewer'
        };
        return roles[role] || 'Staff Member';
    };

    const getStatusColor = (status: StaffMember['status']) => {
        const colors = {
            available: 'bg-green-100 text-green-800',
            busy: 'bg-yellow-100 text-yellow-800',
            offline: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || colors.offline;
    };

    const getStatusText = (status: StaffMember['status']) => {
        const texts = {
            available: 'Available',
            busy: 'Busy',
            offline: 'Offline'
        };
        return texts[status] || 'Offline';
    };

    const adminCount = staffMembers.filter(s => s.role === 'admin' || s.role === 'super_admin').length;
    const activeCount = staffMembers.filter(s => s.status === 'available').length;
    const avgWorkload = staffMembers.length > 0
        ? Math.round(staffMembers.reduce((acc, s) => acc + (s.assignedIssues || 0), 0) / staffMembers.length)
        : 0;

    return (
        <div className="w-full">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">🧑‍💼 Staff Management</h1>
                        <p className="text-gray-600 mt-1">Manage staff and authorities</p>
                    </div>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors w-full sm:w-auto"
                    >
                        <UserPlus className="w-5 h-5" />
                        <span>Add New Staff</span>
                    </button>
                </div>
            </motion.div>

            {/* Add Staff Form */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="mb-6 rounded-xl border border-gray-100 shadow-sm">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">New Staff Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                        <input
                                            type="text"
                                            value={newStaff.name}
                                            onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition-shadow"
                                            placeholder="Staff Name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={newStaff.email}
                                            onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition-shadow"
                                            placeholder="email@icst.edu"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                        <select
                                            value={newStaff.role}
                                            onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as StaffMember['role'] })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition-shadow bg-white"
                                        >
                                            <option value="staff">Staff Member</option>
                                            <option value="dept_head">Department Head</option>
                                            <option value="admin">Admin</option>
                                            <option value="super_admin">Super Admin</option>
                                            <option value="viewer">Viewer</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                        <select
                                            value={newStaff.department}
                                            onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition-shadow bg-white"
                                        >
                                            <option value="IT">IT</option>
                                            <option value="CSE">CSE</option>
                                            <option value="EEE">EEE</option>
                                            <option value="Administration">Administration</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                        <input
                                            type="password"
                                            value={newStaff.password}
                                            onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition-shadow"
                                            placeholder="Strong password"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
                                    <button
                                        onClick={handleAddStaff}
                                        disabled={addStaffMutation.isPending}
                                        className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex justify-center items-center"
                                    >
                                        {addStaffMutation.isPending ? 'Adding...' : 'Add Staff'}
                                    </button>
                                    <button
                                        onClick={() => setShowAddForm(false)}
                                        className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-sm">
                    <CardContent className="p-5">
                        <Users className="w-8 h-8 mb-3 opacity-80" />
                        <p className="text-sm font-medium opacity-90 mb-1">Total Staff</p>
                        <p className="text-3xl font-bold">{staffMembers.length}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-sm">
                    <CardContent className="p-5">
                        <Shield className="w-8 h-8 mb-3 opacity-80" />
                        <p className="text-sm font-medium opacity-90 mb-1">Admins</p>
                        <p className="text-3xl font-bold">{adminCount}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-sm">
                    <CardContent className="p-5">
                        <Activity className="w-8 h-8 mb-3 opacity-80" />
                        <p className="text-sm font-medium opacity-90 mb-1">Active Now</p>
                        <p className="text-3xl font-bold">{activeCount}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-sm">
                    <CardContent className="p-5">
                        <Users className="w-8 h-8 mb-3 opacity-80" />
                        <p className="text-sm font-medium opacity-90 mb-1">Avg Workload</p>
                        <p className="text-3xl font-bold">{avgWorkload}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Staff List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {staffMembers.map((staff) => (
                        <motion.div
                            key={staff.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            layout
                        >
                            <Card className="hover:shadow-lg transition-shadow border-gray-100 h-full flex flex-col">
                                <CardContent className="p-6 flex flex-col flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <h3 className="font-bold text-lg text-gray-800 truncate">{staff.name}</h3>
                                            <p className="text-sm text-gray-500 truncate">{staff.email}</p>
                                        </div>
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(staff.status)}`}>
                                            {getStatusText(staff.status)}
                                        </span>
                                    </div>

                                    <div className="space-y-3 mb-6 flex-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 font-medium">Role:</span>
                                            <span className="font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">{getRoleName(staff.role)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 font-medium">Department:</span>
                                            <span className="font-medium text-gray-900">{staff.department || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-50">
                                            <span className="text-gray-500 font-medium">Assigned:</span>
                                            <span className="font-medium text-amber-600">{staff.assignedIssues || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 font-medium">Resolved:</span>
                                            <span className="font-medium text-emerald-600">{staff.resolvedIssues || 0}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mt-auto">
                                        <button className="flex-1 bg-sky-50 hover:bg-sky-100 text-sky-700 py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors text-center">
                                            Edit
                                        </button>
                                        <button className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-700 py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors text-center">
                                            Performance
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {staffMembers.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No staff members found</h3>
                        <p>There are currently no staff members added to the system.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffManagement;
