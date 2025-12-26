const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
require('dotenv').config();

const { sendEmail, sendBulkEmails, emailTemplates } = require('./emailService');

const app = express();

const ALLOWED_ORIGINS = [
    'https://icst-issue-portal.vercel.app',
    'https://icst-issue-portal-git-main-jobayer-hossains-projects-0897a257.vercel.app',
    'http://localhost:5173'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.some(o => origin.startsWith(o))) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

app.use(express.json());

// --- MONGODB CONNECTION ---
const MONGODB_URI = "mongodb+srv://Jobayer:Jovayer1234%26@cluster0.ipt18un.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb && mongoose.connection.readyState === 1) {
        return cachedDb;
    }
    try {
        cachedDb = await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 20000,
            socketTimeoutMS: 45000,
            bufferCommands: true
        });
        console.log('✅ Connected to MongoDB Atlas');
        return cachedDb;
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        throw err;
    }
}

app.use(async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (err) {
        console.error("Database connection failure:", err.message);
        res.status(500).json({ message: `Database connection error: ${err.message}` });
    }
});

// --- MODELS ---

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    department: String,
    roll: String,
    isBlocked: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const AuditLogSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    targetId: String,
    targetType: String, // 'user', 'issue', 'system'
    action: String, // 'block_user', 'change_status', etc.
    details: String,
    ip: String,
    timestamp: { type: Date, default: Date.now }
});

const SystemConfigSchema = new mongoose.Schema({
    categories: [String],
    priorities: [String],
    maintenanceMode: { type: Boolean, default: false },
    allowRegistration: { type: Boolean, default: true },
    slaRules: Object
});

const ArticleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, default: 'FAQ' },
    tags: [String],
    views: { type: Number, default: 0 },
    helpful: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const IssueSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    priority: { type: String, default: 'medium' },
    status: { type: String, default: 'pending' },
    votes: {
        good: { type: Number, default: 0 },
        bad: { type: Number, default: 0 }
    },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    votedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0 },
    timeline: [{
        status: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: String,
        timestamp: { type: Date, default: Date.now }
    }],
    expectedResolution: Date,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const MessageSchema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null for broadcast
    subject: String,
    message: String,
    read: { type: Boolean, default: false },
    type: { type: String, default: 'direct' },
    targetGroup: String,
    createdAt: { type: Date, default: Date.now }
});

const PasswordResetTokenSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Issue = mongoose.model('Issue', IssueSchema);
const Message = mongoose.model('Message', MessageSchema);
const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
const SystemConfig = mongoose.model('SystemConfig', SystemConfigSchema);
const Article = mongoose.model('Article', ArticleSchema);
const PasswordResetToken = mongoose.model('PasswordResetToken', PasswordResetTokenSchema);

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, 'secret_key', (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Maintenance Mode Check Middleware
const checkMaintenanceMode = async (req, res, next) => {
    try {
        const config = await SystemConfig.findOne();

        // If maintenance mode is on and user is not admin, block access
        if (config && config.maintenanceMode && req.user && req.user.role !== 'admin') {
            return res.status(503).json({
                message: 'System is under maintenance. Please try again later.',
                maintenanceMode: true
            });
        }

        next();
    } catch (error) {
        // If config check fails, allow access to prevent lockout
        next();
    }
};

// Authorization Middleware
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

// Permission Helper Functions
const canUpdateIssue = (user, issue) => {
    return user.role === 'admin' || issue.submittedBy?.toString() === user.id;
};

const canDeleteIssue = (user) => {
    return user.role === 'admin';
};

const canSendMessage = (user) => {
    return user.role === 'admin';
};

// --- ROUTES ---

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ICST Portal Backend v2.1 (Node.js)' });
});

// Auth
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id, role: user.role }, 'secret_key', { expiresIn: '7d' });
        res.json({
            token,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            roll: user.roll
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Forgot Password - Real Implementation
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });

        // For security, always return success message even if user doesn't exist
        if (!user) {
            return res.json({ message: 'If this email exists, a reset link has been sent' });
        }

        // Generate unique reset token
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Set expiration to 30 minutes from now
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

        // Delete any existing tokens for this user
        await PasswordResetToken.deleteMany({ userId: user._id });

        // Create new reset token
        await PasswordResetToken.create({
            userId: user._id,
            token: resetToken,
            expiresAt
        });

        // Send password reset email
        await sendEmail(
            user.email,
            emailTemplates.forgotPassword,
            [user.name, resetToken]
        );

        res.json({
            message: 'Password reset link has been sent to your email',
            success: true
        });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ message: 'Failed to process request' });
    }
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }

        // Find valid token
        const resetToken = await PasswordResetToken.findOne({
            token,
            used: false,
            expiresAt: { $gt: new Date() }
        }).populate('userId');

        if (!resetToken) {
            return res.status(400).json({
                message: 'Invalid or expired reset token',
                expired: true
            });
        }

        // Update user password
        const hashedPassword = await bcrypt.hash(newPassword, 8);
        await User.findByIdAndUpdate(resetToken.userId._id, { password: hashedPassword });

        // Mark token as used
        resetToken.used = true;
        await resetToken.save();

        res.json({
            message: 'Password reset successful. You can now login with your new password.',
            success: true
        });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ message: 'Failed to reset password' });
    }
});

const SALT_ROUNDS = 8; // Optimized for Vercel performance while maintaining security

app.post('/api/auth/register', async (req, res) => {
    try {
        // Check if registration is allowed
        const config = await SystemConfig.findOne();
        if (config && config.allowRegistration === false) {
            return res.status(403).json({
                message: 'Registration is currently disabled. Please contact administrator.',
                registrationDisabled: true
            });
        }

        const { name, email, password, department, roll } = req.body;
        if (await User.findOne({ email })) return res.status(400).json({ message: 'User exists' });

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const newUser = await User.create({ name, email, password: hashedPassword, department, roll });
        const token = jwt.sign({ id: newUser._id, role: newUser.role }, 'secret_key', { expiresIn: '7d' });

        // Send welcome email (don't await to avoid blocking)
        sendEmail(email, emailTemplates.welcome, [name])
            .catch(err => console.error('Failed to send welcome email:', err));

        res.status(201).json({ token, ...newUser.toObject() });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
});

app.get('/api/auth/seed-admin', async (req, res) => {
    const email = "jovayerhossain0@gmail.com";
    const password = "Jovayer1234&";
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    let user = await User.findOne({ email });

    if (user) {
        user.password = hashedPassword;
        user.role = "admin"; // Ensure admin role
        await user.save();
        return res.json({ message: 'Admin password reset to: Jovayer1234&' });
    }

    await User.create({
        name: "Administrator",
        email,
        password: hashedPassword,
        role: "admin",
        department: "Administration",
        roll: "ADMIN"
    });
    res.json({ message: 'Admin created with password: Jovayer1234&' });
});

// Issues
// NOTE: GET /api/issues is INTENTIONALLY PUBLIC
// The issue board is designed to be publicly accessible for transparency
// All users (including non-authenticated) can view the list of issues
app.get('/api/issues', async (req, res) => {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
});

app.post('/api/issues', authenticateToken, checkMaintenanceMode, async (req, res) => {
    try {
        const issue = await Issue.create({
            ...req.body,
            submittedBy: req.user.id,
            votes: { good: 0, bad: 0 },
            views: 0
        });
        res.status(201).json(issue);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// View single issue - Requires authentication to prevent view count manipulation
app.get('/api/issues/:id', authenticateToken, checkMaintenanceMode, async (req, res) => {
    const issue = await Issue.findById(req.params.id).populate('submittedBy', 'name');
    if (!issue) return res.status(404).json({ message: "Not found" });

    // Increment view (only counted for authenticated users)
    issue.views += 1;
    await issue.save();

    // Transform votedUsers array into a generic object map { userId: "voted" } for frontend compatibility if needed
    const issueObj = issue.toObject();
    issueObj.voters = {};
    if (issue.votedUsers) {
        issue.votedUsers.forEach(uid => {
            issueObj.voters[uid.toString()] = "voted";
        });
    }

    res.json(issueObj);
});

app.patch('/api/issues/:id', authenticateToken, checkMaintenanceMode, async (req, res) => {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Not found" });

    // Check permission
    if (req.user.role !== 'admin' && issue.submittedBy?.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
    }

    const oldStatus = issue.status;
    Object.assign(issue, req.body);
    issue.updatedAt = Date.now();
    await issue.save();

    // Audit log for admin actions
    if (req.user.role === 'admin') {
        try {
            await AuditLog.create({
                adminId: req.user.id,
                targetId: issue._id,
                targetType: 'issue',
                action: req.body.status ? 'update_status' : 'update_issue',
                details: req.body.status
                    ? `Status changed from "${oldStatus}" to "${req.body.status}" for issue "${issue.title}"`
                    : `Issue "${issue.title}" updated`,
                ip: req.ip
            });
        } catch (auditError) {
            console.error('Audit log failed:', auditError);
        }
    }

    res.json(issue);
});

app.delete('/api/issues/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin only" });

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Not found" });

    const issueTitle = issue.title;
    await Issue.findByIdAndDelete(req.params.id);

    // Audit log
    try {
        await AuditLog.create({
            adminId: req.user.id,
            targetId: req.params.id,
            targetType: 'issue',
            action: 'delete_issue',
            details: `Issue "${issueTitle}" permanently deleted`,
            ip: req.ip
        });
    } catch (auditError) {
        console.error('Audit log failed:', auditError);
    }

    res.json({ message: "Deleted" });
});

// Issue Status Update (for PendingIssues approval workflow)
app.put('/api/issues/:id/status', authenticateToken, async (req, res) => {
    try {
        // Only admins can update issue status
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin only' });
        }

        const issue = await Issue.findById(req.params.id);
        if (!issue) return res.status(404).json({ message: 'Issue not found' });

        const oldStatus = issue.status;
        issue.status = req.body.status;
        issue.updatedAt = Date.now();
        await issue.save();

        // Audit log
        try {
            await AuditLog.create({
                adminId: req.user.id,
                targetId: issue._id,
                targetType: 'issue',
                action: 'update_status',
                details: `Status changed from "${oldStatus}" to "${req.body.status}" for issue "${issue.title}"`,
                ip: req.ip
            });
        } catch (auditError) {
            console.error('Audit log failed:', auditError);
        }

        res.json({ message: 'Status updated', issue });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Failed to update status' });
    }
});

// Voting (PUT to match frontend IssueCard line 132: api.put)
app.put('/api/issues/:id/vote', authenticateToken, checkMaintenanceMode, async (req, res) => {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Not found" });

    const userId = req.user.id;
    // Check if user ID is in votedUsers array
    const hasVoted = issue.votedUsers.some(uid => uid.toString() === userId);

    if (hasVoted) {
        return res.status(400).json({ message: "already" });
    }

    const type = req.body.type; // 'good' or 'bad'
    if (type === 'good') issue.votes.good += 1;
    if (type === 'bad') issue.votes.bad += 1;

    issue.votedUsers.push(userId);
    await issue.save();

    // Prepare response format matching frontend IssueCard expectations
    const issueObj = issue.toObject();
    issueObj.voters = {};
    issue.votedUsers.forEach(uid => {
        issueObj.voters[uid.toString()] = "voted";
    });

    res.json(issueObj);
});

// User Dashboard Stats
app.get('/api/user/stats', authenticateToken, checkMaintenanceMode, async (req, res) => {
    const userId = req.user.id;

    const total = await Issue.countDocuments({ submittedBy: userId });
    const pending = await Issue.countDocuments({ submittedBy: userId, status: 'pending' });
    const inProgress = await Issue.countDocuments({ submittedBy: userId, status: 'in-progress' });
    const resolved = await Issue.countDocuments({ submittedBy: userId, status: 'resolved' });
    const criticalCount = await Issue.countDocuments({
        submittedBy: userId,
        priority: { $in: ['high', 'critical'] },
        status: { $ne: 'resolved' }
    });

    res.json({ total, pending, inProgress, resolved, criticalCount, avgResolutionTime: 0 });
});

// User Activities
app.get('/api/user/activities', authenticateToken, checkMaintenanceMode, async (req, res) => {
    const userId = req.user.id;

    const recentIssues = await Issue.find({ submittedBy: userId })
        .sort({ updatedAt: -1 })
        .limit(10);

    const activities = recentIssues.map(issue => ({
        id: issue._id,
        type: 'issue_update',
        message: `Issue "${issue.title}" - Status: ${issue.status}`,
        timestamp: issue.updatedAt
    }));

    res.json(activities);
});

// User Announcements
app.get('/api/user/announcements', authenticateToken, checkMaintenanceMode, async (req, res) => {
    // Fetch broadcast messages as announcements
    const announcements = await Message.find({ type: 'broadcast' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('subject message createdAt');

    const formatted = announcements.map(a => ({
        _id: a._id,
        title: a.subject || 'System Announcement',
        message: a.message,
        type: 'info',
        createdAt: a.createdAt
    }));

    res.json(formatted);
});

// Admin Stats
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
    const total = await Issue.countDocuments();
    const pending = await Issue.countDocuments({ status: 'pending' });
    const inProgress = await Issue.countDocuments({ status: 'in-progress' });
    const resolved = await Issue.countDocuments({ status: 'resolved' });
    const criticalCount = await Issue.countDocuments({ priority: { $in: ['high', 'critical'] }, status: 'pending' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await Issue.countDocuments({ createdAt: { $gte: today } });

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekCount = await Issue.countDocuments({ createdAt: { $gte: weekAgo } });

    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', isBlocked: { $ne: true } });

    res.json({
        total,
        pending,
        inProgress,
        resolved,
        todayCount,
        weekCount,
        criticalCount,
        avgResolutionTime: 0,
        totalUsers,
        activeUsers
    });
});

// Admin Analytics
app.get('/api/admin/analytics', authenticateToken, requireAdmin, async (req, res) => {

    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Issues by category
    const categoryAgg = await Issue.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const issuesByCategory = categoryAgg.map(item => ({
        name: item._id || 'Other',
        value: item.count
    }));

    // Issues by status
    const statusAgg = await Issue.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const issuesByStatus = statusAgg.map(item => ({
        name: item._id,
        value: item.count
    }));

    // Trend data - issues per day
    const trendData = [];
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const totalIssues = await Issue.countDocuments({
            createdAt: { $gte: date, $lt: nextDate }
        });
        const resolved = await Issue.countDocuments({
            createdAt: { $gte: date, $lt: nextDate },
            status: 'resolved'
        });

        trendData.push({
            date: `${date.getMonth() + 1}/${date.getDate()}`,
            issues: totalIssues,
            resolved: resolved
        });
    }

    // Department stats - get issues for each department from submittedBy user
    const users = await User.find({}, 'department');
    const deptMap = {};

    for (const user of users) {
        const dept = user.department || 'Unknown';
        if (!deptMap[dept]) {
            deptMap[dept] = { department: dept, total: 0, resolved: 0, pending: 0 };
        }

        const totalIssues = await Issue.countDocuments({ submittedBy: user._id });
        const resolvedIssues = await Issue.countDocuments({ submittedBy: user._id, status: 'resolved' });
        const pendingIssues = await Issue.countDocuments({ submittedBy: user._id, status: 'pending' });

        deptMap[dept].total += totalIssues;
        deptMap[dept].resolved += resolvedIssues;
        deptMap[dept].pending += pendingIssues;
    }

    const departmentStats = Object.values(deptMap).filter(d => d.total > 0);

    res.json({
        issuesByCategory,
        issuesByStatus,
        trendData,
        departmentStats
    });
});

// Admin System Configuration
app.get('/api/admin/system-config', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

    let config = await SystemConfig.findOne();
    if (!config) {
        // Create default config if none exists
        config = await SystemConfig.create({
            categories: ['Academic', 'Infrastructure', 'Canteen', 'Library', 'Transport', 'Other'],
            priorities: ['low', 'medium', 'high', 'critical'],
            maintenanceMode: false,
            allowRegistration: true,
            slaRules: {
                criticalResponseTime: 2,
                highResponseTime: 24,
                mediumResponseTime: 48
            }
        });
    }
    res.json(config);
});

app.post('/api/admin/system-config', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

    let config = await SystemConfig.findOne();
    if (config) {
        Object.assign(config, req.body);
        await config.save();
    } else {
        config = await SystemConfig.create(req.body);
    }

    // Log audit
    await AuditLog.create({
        adminId: req.user.id,
        targetId: config._id,
        targetType: 'system',
        action: 'update_config',
        details: 'System configuration updated',
        ip: req.ip
    });

    res.json({ message: 'Configuration saved', config });
});

// Admin Activity Feed
app.get('/api/admin/activity', authenticateToken, requireAdmin, async (req, res) => {

    const recentIssues = await Issue.find().sort({ createdAt: -1 }).limit(10).populate('submittedBy', 'name');

    const activities = recentIssues.map(issue => ({
        id: issue._id,
        type: 'new_issue',
        title: 'New Issue Submitted',
        description: `${issue.title} (${issue.priority})`,
        user: issue.submittedBy ? issue.submittedBy.name : 'Anonymous',
        timestamp: issue.createdAt
    }));

    res.json(activities);
});

// Admin Audit Logs
app.get('/api/admin/audit-logs', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

    const logs = await AuditLog.find()
        .sort({ timestamp: -1 })
        .limit(100)
        .populate('adminId', 'name email');

    res.json(logs);
});

// Admin User Management
app.get('/api/admin/users', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

    // Fetch users with their issue counts
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    const usersWithCounts = await Promise.all(users.map(async (u) => {
        const count = await Issue.countDocuments({ submittedBy: u._id });
        return { ...u.toObject(), issueCount: count };
    }));

    res.json(usersWithCounts);
});

app.patch('/api/admin/users/:id/block', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isBlocked = !user.isBlocked;
    // If blocking, maybe revoke tokens? (Not implemented here, but good for future)
    await user.save();

    // Log audit
    await AuditLog.create({
        adminId: req.user.id,
        targetId: user._id,
        targetType: 'user',
        action: user.isBlocked ? 'block_user' : 'unblock_user',
        details: `User ${user.email} was ${user.isBlocked ? 'blocked' : 'unblocked'}`,
        ip: req.ip
    });

    res.json({ message: `User ${user.isBlocked ? 'blocked' : 'active'}` });
});

app.post('/api/admin/users/:id/reset-password', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const defaultPass = "123456";
    user.password = await bcrypt.hash(defaultPass, SALT_ROUNDS);
    await user.save();

    // Log audit
    await AuditLog.create({
        adminId: req.user.id,
        targetId: user._id,
        targetType: 'user',
        action: 'reset_password',
        details: `Password reset for ${user.email}`,
        ip: req.ip
    });

    res.json({ message: 'Password reset successful' });
});

// Get specific user statistics (for admin)
app.get('/api/admin/users/:id/stats', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

    const userId = req.params.id;

    const total = await Issue.countDocuments({ submittedBy: userId });
    const pending = await Issue.countDocuments({ submittedBy: userId, status: 'pending' });
    const inProgress = await Issue.countDocuments({ submittedBy: userId, status: 'in-progress' });
    const resolved = await Issue.countDocuments({ submittedBy: userId, status: 'resolved' });

    // Category breakdown
    const categoryAgg = await Issue.aggregate([
        { $match: { submittedBy: mongoose.Types.ObjectId(userId) } }, { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const categoryBreakdown = categoryAgg.map(item => ({
        category: item._id || 'Other',
        count: item.count
    }));

    res.json({
        total,
        pending,
        inProgress,
        resolved,
        categoryBreakdown
    });
});

// Communication Center
app.get('/api/messages', authenticateToken, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { to: req.user.id },           // Messages sent to me
                { from: req.user.id },         // Messages I sent
                { type: 'broadcast' }          // Broadcast messages
            ]
        })
            .sort({ createdAt: -1 })
            .populate('from', 'name email roll')
            .populate('to', 'name email roll');

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
});

app.post('/api/messages', authenticateToken, async (req, res) => {
    try {
        // Only admins can send direct messages
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can send messages' });
        }

        let recipientId = req.body.to;

        // If 'to' is a roll number (string), look up the user
        if (req.body.toRoll) {
            const recipient = await User.findOne({ roll: req.body.toRoll });
            if (!recipient) {
                return res.status(404).json({ message: `User with roll ${req.body.toRoll} not found` });
            }
            recipientId = recipient._id;
        }

        const message = await Message.create({
            from: req.user.id,
            to: recipientId,
            subject: req.body.subject,
            message: req.body.message,
            type: req.body.type || 'direct'
        });

        // Populate for immediate response
        await message.populate('from', 'name email');
        await message.populate('to', 'name email');

        res.status(201).json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
});

app.post('/api/admin/send-bulk-email', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

        const { subject, body, recipients, customEmails } = req.body;

        if (!subject || !body) {
            return res.status(400).json({ message: 'Subject and body are required' });
        }

        let emailAddresses = [];

        // Handle custom emails
        if (recipients === 'custom') {
            if (!customEmails || !customEmails.trim()) {
                return res.status(400).json({ message: 'Custom emails are required' });
            }

            // Parse comma-separated emails
            emailAddresses = customEmails
                .split(',')
                .map(email => email.trim())
                .filter(email => email && email.includes('@'));

            if (emailAddresses.length === 0) {
                return res.status(400).json({ message: 'No valid email addresses found' });
            }
        } else {
            // Get target users based on recipients filter
            let query = {};
            if (recipients === 'students') {
                query = { role: 'user' }; // Assuming students have role 'user'
            }

            const users = await User.find(query).select('email name');

            if (users.length === 0) {
                return res.status(400).json({ message: 'No users found' });
            }

            emailAddresses = users.map(u => u.email);
        }

        // Store broadcast message in database
        await Message.create({
            from: req.user.id,
            subject: subject,
            message: body,
            type: 'broadcast',
            targetGroup: recipients || 'all',
            read: false
        });

        // Send emails to all users (async, don't block response)

        sendBulkEmails(
            emailAddresses,
            emailTemplates.bulkEmail,
            [subject, body]
        ).then(results => {
            console.log(`📧 Bulk email sent: ${results.sent}/${results.total} successful`);
            if (results.failed > 0) {
                console.error(`Failed emails:`, results.errors);
            }
        }).catch(err => {
            console.error('Bulk email error:', err);
        });

        res.json({
            message: 'Broadcast sent successfully',
            queued: emailAddresses.length
        });
    } catch (error) {
        console.error('Bulk email error:', error);
        res.status(500).json({ message: 'Failed to send bulk email' });
    }
});

// Knowledge Base Management
app.get('/api/admin/knowledge-base', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

    const articles = await Article.find().sort({ createdAt: -1 });
    res.json(articles);
});

app.post('/api/admin/knowledge-base', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

    const article = await Article.create(req.body);

    await AuditLog.create({
        adminId: req.user.id,
        targetId: article._id,
        targetType: 'knowledge_base',
        action: 'create_article',
        details: `Article created: ${article.title}`,
        ip: req.ip
    });

    res.status(201).json(article);
});

app.put('/api/admin/knowledge-base/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

    const article = await Article.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: new Date() },
        { new: true }
    );

    if (!article) return res.status(404).json({ message: 'Article not found' });

    await AuditLog.create({
        adminId: req.user.id,
        targetId: article._id,
        targetType: 'knowledge_base',
        action: 'update_article',
        details: `Article updated: ${article.title}`,
        ip: req.ip
    });

    res.json(article);
});

app.delete('/api/admin/knowledge-base/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });

    await AuditLog.create({
        adminId: req.user.id,
        targetId: article._id,
        targetType: 'knowledge_base',
        action: 'delete_article',
        details: `Article deleted: ${article.title}`,
        ip: req.ip
    });

    res.json({ message: 'Article deleted' });
});

const upload = multer();
app.post('/api/upload', upload.single('file'), (req, res) => {
    res.json({
        url: 'https://placehold.co/600x400?text=Uploaded+Image',
        message: 'Mock upload successful'
    });
});

module.exports = app;
