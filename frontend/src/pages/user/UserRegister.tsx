import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, BookOpen, Hash, ChevronDown, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import api from '@/services/api';

const DEPARTMENTS = [
    { value: 'CST', label: 'CST', full: 'Computer Science Technology' },
    { value: 'CT', label: 'CT', full: 'Civil Technology' },
    { value: 'ET', label: 'ET', full: 'Electrical Technology' },
    { value: 'TT', label: 'TT', full: 'Textile Technology' },
    { value: 'Architecture', label: 'Architecture', full: 'Architecture' },
];

const UserRegister = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [deptOpen, setDeptOpen] = useState(false);
    const deptRef = useRef<HTMLDivElement>(null);
    const [formData, setFormData] = useState({
        roll: '',
        name: '',
        department: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const selectDepartment = (value: string) => {
        setFormData({ ...formData, department: value });
        setDeptOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (deptRef.current && !deptRef.current.contains(e.target as Node)) {
                setDeptOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.department) {
            toast.error('বিভাগ নির্বাচন করুন (Please select a department)');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('পাসওয়ার্ড মিলছে না (Passwords do not match)');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে (Password must be at least 6 characters)');
            return;
        }

        setLoading(true);
        try {
            await register(formData.roll, formData.name, formData.department, formData.email, formData.password);

            // Auto submit if there was a pending submission
            if (sessionStorage.getItem('pendingSubmit') === 'true') {
                try {
                    const pendingData = sessionStorage.getItem('pendingIssueData');
                    if (pendingData) {
                        const issueData = JSON.parse(pendingData);
                        await api.post('/issues', issueData);
                        sessionStorage.removeItem('pendingSubmit');
                        sessionStorage.removeItem('pendingIssueData');
                        toast.success('রেজিস্ট্রেশন সফল এবং আপনার সমস্যাটি স্বয়ংক্রিয়ভাবে প্রকাশ করা হয়েছে!');
                        navigate('/issues');
                        return;
                    }
                } catch (e) {
                    console.error("Failed to auto-submit issue:", e);
                    toast.error('অটো-সাবমিশন ব্যর্থ হয়েছে। দয়া করে আবার সমস্যাটি জানান।');
                }
            }

            toast.success('রেজিস্ট্রেশন সফল! (Registration successful!)');
            navigate('/user/dashboard');
        } catch (err: unknown) {
            console.error('------- RAW REGISTRATION ERROR -------');
            console.error(err);
            console.error('Response Data:', (err as any)?.response?.data);
            console.error('--------------------------------------');

            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'রেজিস্ট্রেশন ব্যর্থ (Registration failed)');
        } finally {
            setLoading(false);
        }
    };

    const selectedDept = DEPARTMENTS.find(d => d.value === formData.department);

    return (
        <div className="min-h-[90vh] flex items-center justify-center p-4 py-8 relative">
            {/* Background elements */}
            <div className="absolute inset-0 bg-white/40 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg relative z-10"
            >
                <Card className="glass-card border-slate-200 shadow-xl bg-white/80 backdrop-blur-xl overflow-visible">
                    <CardHeader className="text-center space-y-2">
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        >
                            <CardTitle className="text-3xl font-bold text-slate-800">
                                নতুন একাউন্ট খুলুন
                            </CardTitle>
                        </motion.div>
                        <CardDescription className="text-slate-600 font-medium">
                            User Registration Form
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Roll Number */}
                                <motion.div
                                    className="space-y-2"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <label className="text-sm font-semibold text-slate-700">
                                        রোল নম্বর <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none group-focus-within:text-primary transition-colors" />
                                        <Input
                                            type="text"
                                            name="roll"
                                            value={formData.roll}
                                            onChange={handleChange}
                                            required
                                            placeholder="2021-1-60-001"
                                            className="pl-10 bg-white border-slate-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 text-slate-800 placeholder:text-slate-400 rounded-xl h-11 shadow-sm hover:shadow-md transition-shadow"
                                        />
                                    </div>
                                </motion.div>

                                {/* Department — Premium Custom Dropdown */}
                                <motion.div
                                    className="space-y-2"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15 }}
                                    ref={deptRef}
                                >
                                    <label className="text-sm font-semibold text-slate-700">
                                        বিভাগ <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        {/* Trigger Button */}
                                        <button
                                            type="button"
                                            onClick={() => setDeptOpen(prev => !prev)}
                                            className={`w-full h-11 px-3 bg-white border rounded-xl text-sm
                                                shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer
                                                flex items-center gap-2
                                                ${deptOpen
                                                    ? 'border-primary ring-2 ring-primary/10 shadow-md'
                                                    : 'border-slate-200 hover:border-slate-300'
                                                }
                                                ${selectedDept ? 'text-slate-800 font-medium' : 'text-slate-400'}
                                            `}
                                        >
                                            <BookOpen className={`w-4 h-4 shrink-0 transition-colors duration-200 ${deptOpen ? 'text-primary' : 'text-slate-400'}`} />
                                            <span className="flex-1 truncate text-left">
                                                {selectedDept ? selectedDept.label : 'বিভাগ নির্বাচন করুন'}
                                            </span>
                                            <motion.div
                                                className="shrink-0 flex items-center"
                                                animate={{ rotate: deptOpen ? 180 : 0 }}
                                                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                                            >
                                                <ChevronDown className={`w-4 h-4 transition-colors duration-200 ${deptOpen ? 'text-primary' : 'text-slate-400'}`} />
                                            </motion.div>
                                        </button>

                                        {/* Dropdown Menu — Apple style */}
                                        <AnimatePresence>
                                            {deptOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute z-50 w-full mt-2 bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl overflow-hidden"
                                                >
                                                    <div className="py-1.5">
                                                        {DEPARTMENTS.map((dept, index) => (
                                                            <motion.button
                                                                key={dept.value}
                                                                type="button"
                                                                initial={{ opacity: 0, x: -8 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: index * 0.04, duration: 0.15 }}
                                                                onClick={() => selectDepartment(dept.value)}
                                                                className={`w-full px-4 py-2.5 flex items-center justify-between text-left text-sm transition-all duration-150 
                                                                    ${formData.department === dept.value
                                                                        ? 'bg-primary/10 text-primary font-semibold'
                                                                        : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                                                                    }`}
                                                            >
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">{dept.label}</span>
                                                                    {dept.label !== dept.full && (
                                                                        <span className="text-[11px] text-slate-400 mt-0.5">{dept.full}</span>
                                                                    )}
                                                                </div>
                                                                {formData.department === dept.value && (
                                                                    <motion.div
                                                                        initial={{ scale: 0 }}
                                                                        animate={{ scale: 1 }}
                                                                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                                                    >
                                                                        <Check className="w-4 h-4 text-primary" />
                                                                    </motion.div>
                                                                )}
                                                            </motion.button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Name */}
                            <motion.div
                                className="space-y-2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <label className="text-sm font-semibold text-slate-700">
                                    পূর্ণ নাম <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none group-focus-within:text-primary transition-colors" />
                                    <Input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="আপনার পূর্ণ নাম"
                                        className="pl-11 bg-white border-slate-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 text-slate-800 placeholder:text-slate-400 rounded-xl h-11 shadow-sm hover:shadow-md transition-shadow"
                                    />
                                </div>
                            </motion.div>

                            {/* Email */}
                            <motion.div
                                className="space-y-2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                            >
                                <label className="text-sm font-semibold text-slate-700">
                                    ইমেইল <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none group-focus-within:text-primary transition-colors" />
                                    <Input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="example@email.com"
                                        className="pl-11 bg-white border-slate-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 text-slate-800 placeholder:text-slate-400 rounded-xl h-11 shadow-sm hover:shadow-md transition-shadow"
                                    />
                                </div>
                            </motion.div>

                            {/* Password Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <motion.div
                                    className="space-y-2"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <label className="text-sm font-semibold text-slate-700">
                                        পাসওয়ার্ড <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none group-focus-within:text-primary transition-colors" />
                                        <Input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            placeholder="******"
                                            className="pl-10 bg-white border-slate-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 text-slate-800 placeholder:text-slate-400 rounded-xl h-11 shadow-sm hover:shadow-md transition-shadow"
                                        />
                                    </div>
                                </motion.div>
                                <motion.div
                                    className="space-y-2"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35 }}
                                >
                                    <label className="text-sm font-semibold text-slate-700">
                                        নিশ্চিত করুন <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none group-focus-within:text-primary transition-colors" />
                                        <Input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            placeholder="******"
                                            className="pl-10 bg-white border-slate-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 text-slate-800 placeholder:text-slate-400 rounded-xl h-11 shadow-sm hover:shadow-md transition-shadow"
                                        />
                                    </div>
                                </motion.div>
                            </div>

                            {/* Submit */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all mt-2 rounded-xl active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <motion.span
                                            animate={{ opacity: [1, 0.5, 1] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                            রেজিস্টার হচ্ছে...
                                        </motion.span>
                                    ) : 'রেজিস্টার করুন'}
                                </Button>
                            </motion.div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 pt-0">
                        <div className="text-center text-sm text-slate-600">
                            ইতিমধ্যে একাউন্ট আছে?{' '}
                            <Link to="/user/login" className="text-primary hover:text-primary/80 font-semibold hover:underline">
                                লগইন করুন
                            </Link>
                        </div>
                        <div className="text-center w-full text-xs text-slate-600 pt-2">
                            <Link to="/" className="hover:text-slate-800 transition-colors">
                                ← হোম পেজে ফেরত যান
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
};

export default UserRegister;
