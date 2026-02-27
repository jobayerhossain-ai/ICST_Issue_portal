import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, PieChart as PieIcon, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { toast } from 'sonner';

interface AnalyticsData {
    issuesByCategory: { name: string; value: number }[];
    issuesByStatus: { name: string; value: number }[];
    trendData: { date: string; issues: number; resolved: number }[];
    departmentStats: { department: string; total: number; resolved: number; pending: number }[];
}

const defaultData: AnalyticsData = {
    issuesByCategory: [],
    issuesByStatus: [],
    trendData: [],
    departmentStats: []
};

const ReportsAnalytics = () => {
    const [timeRange, setTimeRange] = useState('30');

    const { data = defaultData } = useQuery<AnalyticsData>({
        queryKey: ['analyticsData', timeRange],
        queryFn: async () => {
            const { data: analyticsData } = await api.get(`/admin/analytics?days=${timeRange}`);
            return analyticsData;
        },
        staleTime: 30000,
        gcTime: 600000,
        refetchInterval: 10000,
        placeholderData: (prev) => prev ?? defaultData,
    });

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

    const handleExport = () => {
        toast.success('Report export functionality coming soon');
    };

    return (
        <div className="w-full p-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">📊 Reports & Analytics</h1>
                        <p className="text-gray-600 mt-1">ডেটা ভিত্তিক সিদ্ধান্ত নিন</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="7">Last 7 Days</option>
                            <option value="30">Last 30 Days</option>
                            <option value="90">Last 90 Days</option>
                        </select>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                        >
                            <Download className="w-4 h-4" />
                            Export PDF
                        </button>
                    </div>
                </div>
            </motion.div>

            {data && (data.issuesByStatus.length > 0 || data.trendData.length > 0) ? (
                <div className="space-y-6">
                    {/* Issues Trend Chart */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-sky-600" />
                                Issue Trends Over Time
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={data.trendData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="issues" stroke="#0088FE" name="Total Issues" />
                                    <Line type="monotone" dataKey="resolved" stroke="#00C49F" name="Resolved" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Category Distribution */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <PieIcon className="w-5 h-5 text-sky-600" />
                                    Issues by Category
                                </h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={data.issuesByCategory}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {data.issuesByCategory.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Status Distribution */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Issues by Status</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={data.issuesByStatus}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#82ca9d"
                                            dataKey="value"
                                        >
                                            {data.issuesByStatus.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Department Performance */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Department-wise Analysis</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data.departmentStats}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="department" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="total" fill="#8884d8" name="Total Issues" />
                                    <Bar dataKey="resolved" fill="#82ca9d" name="Resolved" />
                                    <Bar dataKey="pending" fill="#ffc658" name="Pending" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Statistical Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            <CardContent className="p-4 text-center">
                                <p className="text-sm opacity-90">Total Issues</p>
                                <p className="text-3xl font-bold mt-2">
                                    {data.issuesByStatus.reduce((sum, item) => sum + item.value, 0)}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                            <CardContent className="p-4 text-center">
                                <p className="text-sm opacity-90">Resolved</p>
                                <p className="text-3xl font-bold mt-2">
                                    {data.issuesByStatus.find(s => s.name === 'resolved')?.value || 0}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                            <CardContent className="p-4 text-center">
                                <p className="text-sm opacity-90">Pending</p>
                                <p className="text-3xl font-bold mt-2">
                                    {data.issuesByStatus.find(s => s.name === 'pending')?.value || 0}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                            <CardContent className="p-4 text-center">
                                <p className="text-sm opacity-90">In Progress</p>
                                <p className="text-3xl font-bold mt-2">
                                    {data.issuesByStatus.find(s => s.name === 'in-progress')?.value || 0}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="mt-8">
                    <Card>
                        <CardContent className="py-12 text-center text-gray-500">
                            No analytics data available for the selected timeframe.
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ReportsAnalytics;
