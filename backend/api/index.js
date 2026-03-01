const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const compression = require('compression');
const crypto = require('crypto');
const webpush = require('web-push');
require('dotenv').config();

const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { eq, and, or, desc, sql } = require('drizzle-orm');

// Import Drizzle Tables
const schema = require('./schema');
const { users, issues, issueVotedUsers, issueTimeline, auditLogs, systemConfig, articles, messages, passwordResetTokens, comments, pushSubscriptions } = schema;

// ★ WEB PUSH — VAPID Configuration
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BAB6F7jBcqVjNd0fstPiK4NtwW8EdJsSsTScO-LhfAaFxX4HtlLgsCRgFzMGrxTZIIix3GwjqMS9ay4P2bNzzv0';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '-FnSpzQsw6X_IuCEjtLp-70oMl1M3Z92cdL8v2zNYCw';
webpush.setVapidDetails('mailto:jovayerhossain0@gmail.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

// Initialize Postgres & Drizzle
const sqlClient = neon(process.env.DATABASE_URL);
const db = drizzle(sqlClient, { schema });

const { sendEmail, sendBulkEmails, emailTemplates, setSharedDb } = require('./emailService');
setSharedDb(db, systemConfig);

const app = express();
app.use(compression());

const ALLOWED_ORIGINS = [
    'https://icst-issue-portal.vercel.app',
    'https://icst-issue-portal-git-main-jobayer-hossains-projects-0897a257.vercel.app',
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:8081',
    'http://192.168.31.107:8080',
    'http://192.168.31.107:5173'
];

app.use(cors({
    origin: '*', // Temporarily allow all for local dev testing with vite
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

app.use(express.json());

// Remove Mongoose database check middleware (Neon Serverless handles this automatically)

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

const optionalAuthenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        req.user = null;
        return next();
    }

    jwt.verify(token, 'secret_key', (err, user) => {
        if (err) {
            req.user = null;
        } else {
            req.user = user;
        }
        next();
    });
};

// Maintenance Mode Check Middleware
const checkMaintenanceMode = async (req, res, next) => {
    try {
        const config = await db.select().from(systemConfig).limit(1).then(r => r[0]);

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
    return user.role === 'admin' || issue.submittedBy === user.id;
};

const canDeleteIssue = (user) => {
    return user.role === 'admin';
};

const canSendMessage = (user) => {
    return user.role === 'admin';
};

// --- ROUTES ---


// --- ADMIN DATABASE INITIALIZATION ROUTE ---
// Manually run this once after deploying to set up tables. 
// Removed from cold start to prevent Vercel 504 Gateway Timeouts (the "hanging" issue).
app.get('/api/admin/system/init-database', async (req, res) => {
    if (!process.env.DATABASE_URL) {
        return res.status(500).json({ error: 'DATABASE_URL missing' });
    }

    const runQuery = async (name, query) => {
        const start = Date.now();
        console.log(`⏳ [DB INIT] ${name}...`);
        await sqlClient(query);
        console.log(`✅ [DB INIT] ${name} (${Date.now() - start}ms)`);
    };

    try {
        console.log('🚀 [DB INIT] Starting Manual Initialization');

        await runQuery('pgcrypto extension', 'CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

        await runQuery('users table', `CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            department TEXT,
            roll TEXT,
            is_blocked BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT NOW()
        )`);

        await runQuery('system_config table', `CREATE TABLE IF NOT EXISTS system_config (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            categories JSONB DEFAULT '[]',
            priorities JSONB DEFAULT '[]',
            maintenance_mode BOOLEAN DEFAULT false,
            allow_registration BOOLEAN DEFAULT true,
            sla_rules JSONB DEFAULT '{}',
            email_host TEXT,
            email_port INTEGER,
            email_secure BOOLEAN DEFAULT false,
            email_user TEXT,
            email_password TEXT,
            email_from_name TEXT DEFAULT 'ICST Issue Portal',
            resend_api_key TEXT,
            email_from TEXT DEFAULT 'onboarding@resend.dev'
        )`);

        await runQuery('issues table', `CREATE TABLE IF NOT EXISTS issues (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            priority TEXT DEFAULT 'medium',
            status TEXT DEFAULT 'pending',
            votes_good INTEGER DEFAULT 0,
            votes_bad INTEGER DEFAULT 0,
            submitted_by UUID REFERENCES users(id),
            views INTEGER DEFAULT 0,
            image_url TEXT,
            location TEXT,
            contact_email TEXT,
            expected_resolution TIMESTAMP,
            assigned_to UUID REFERENCES users(id),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )`);

        await runQuery('issues migration (columns)', 'ALTER TABLE issues ADD COLUMN IF NOT EXISTS location TEXT, ADD COLUMN IF NOT EXISTS contact_email TEXT');

        await runQuery('issue_voted_users table', `CREATE TABLE IF NOT EXISTS issue_voted_users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            issue_id UUID REFERENCES issues(id),
            user_id UUID REFERENCES users(id),
            type TEXT NOT NULL DEFAULT 'good'
        )`);

        await runQuery('push_subscriptions table', `CREATE TABLE IF NOT EXISTS push_subscriptions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id),
            endpoint TEXT NOT NULL,
            keys JSONB NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        )`);

        await runQuery('audit_logs table', `CREATE TABLE IF NOT EXISTS audit_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            admin_id UUID REFERENCES users(id),
            target_id TEXT,
            target_type TEXT,
            action TEXT,
            details TEXT,
            ip TEXT,
            timestamp TIMESTAMP DEFAULT NOW()
        )`);

        // Seed default config if none exists
        console.log('⏳ [DB INIT] Checking system_config count...');
        const configCount = await sqlClient(`SELECT count(*) FROM system_config`);
        if (parseInt(configCount[0].count) === 0) {
            await sqlClient(`INSERT INTO system_config (allow_registration) VALUES (true)`);
            console.log('🌱 [DB INIT] Seeded default system_config');
        }

        console.log('✅ [DB INIT] All initialization steps complete');
        res.json({ success: true, message: 'Database successfully initialized.' });
    } catch (err) {
        console.error('❌ [DB INIT] DATABASE INITIALIZATION FAILED:', err.message);
        res.status(500).json({ error: err.message });
    }
});


// ★ PUSH NOTIFICATION HELPER — sends push to all of a user's subscribed devices
async function sendPushToUser(userId, payload) {
    try {
        const subs = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
        const payloadStr = JSON.stringify(payload);
        for (const sub of subs) {
            try {
                await webpush.sendNotification({
                    endpoint: sub.endpoint,
                    keys: sub.keys
                }, payloadStr);
            } catch (err) {
                // If subscription expired/invalid, remove it
                if (err.statusCode === 410 || err.statusCode === 404) {
                    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
                }
            }
        }
    } catch (err) {
        console.error('Push notification error:', err.message);
    }
}

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ICST Portal Backend v2.3 (Neon + Web Push)' });
});

// ★ PUSH NOTIFICATION ENDPOINTS
app.get('/api/user/push/vapid-public-key', (req, res) => {
    res.json({ publicKey: VAPID_PUBLIC_KEY });
});

app.post('/api/user/push/subscribe', authenticateToken, async (req, res) => {
    try {
        // Support both direct payload {endpoint, keys} and nested {subscription: {endpoint, keys}}
        const subscription = req.body.subscription || req.body;

        const { endpoint, keys } = subscription;
        if (!endpoint || !keys) {
            return res.status(400).json({
                message: 'Invalid subscription data. Expected endpoint and keys.'
            });
        }

        // Remove existing subscription for this endpoint to avoid duplicates/stale data
        await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));

        // Save new subscription
        await db.insert(pushSubscriptions).values({
            userId: req.user.id,
            endpoint,
            keys
        });

        console.log(`✅ Push subscription saved for user ${req.user.id}`);
        res.json({ message: 'Subscribed successfully' });
    } catch (err) {
        console.error('Push subscribe error:', err);
        res.status(500).json({ message: 'Failed to save push subscription' });
    }
});

app.post('/api/user/push/unsubscribe', authenticateToken, async (req, res) => {
    try {
        const { endpoint } = req.body;
        if (endpoint) {
            await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
        }
        res.json({ message: 'Unsubscribed' });
    } catch (err) {
        console.error('Push unsubscribe error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Auth
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db.select().from(users).where(eq(users.email, email)).limit(1).then(r => r[0]);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user.id, role: user.role }, 'secret_key', { expiresIn: '7d' });
        res.json({
            token,
            _id: user.id, // Aliased for legacy frontend support
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            roll: user.roll
        });
    } catch (err) {
        console.error(err);
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

        const user = await db.select().from(users).where(eq(users.email, email)).limit(1).then(r => r[0]);

        // For security, always return success message even if user doesn't exist
        if (!user) {
            return res.json({ message: 'If this email exists, a reset link has been sent' });
        }

        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Set expiration to 30 minutes from now
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

        // Delete any existing tokens for this user
        await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));

        // Create new reset token
        await db.insert(passwordResetTokens).values({
            userId: user.id,
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
        const resetTokenArr = await db.select().from(passwordResetTokens).where(
            and(
                eq(passwordResetTokens.token, token),
                eq(passwordResetTokens.used, false)
            )
        );
        const resetToken = resetTokenArr.find(t => new Date(t.expiresAt) > new Date());

        if (!resetToken) {
            return res.status(400).json({
                message: 'Invalid or expired reset token',
                expired: true
            });
        }

        // Update user password
        const hashedPassword = await bcrypt.hash(newPassword, 8);
        await db.update(users).set({ password: hashedPassword }).where(eq(users.id, resetToken.userId));

        // Mark token as used
        await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.id, resetToken.id));

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
    console.log('[REG] Starting registration for:', req.body.email);
    try {
        // Check if registration is allowed with a graceful fallback
        const configStartTime = Date.now();
        let config = null;
        try {
            const configResult = await db.select().from(systemConfig).limit(1);
            if (configResult && configResult.length > 0) {
                config = configResult[0];
            }
        } catch (configErr) {
            console.warn(`⚠️ [REG] Could not fetch system_config: ${configErr.message}`);
            // If the table doesn't exist yet (e.g. fresh DB before initialization), we allow the first registration
            config = { allowRegistration: true };
        }
        console.log(`[REG] Config fetched/defaulted in ${Date.now() - configStartTime}ms`);

        if (config && config.allowRegistration === false) {
            return res.status(403).json({
                message: 'Registration is currently disabled. Please contact administrator.',
                registrationDisabled: true
            });
        }

        const { name, email, password, department, roll } = req.body;

        const checkStartTime = Date.now();
        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1).then(r => r[0]);
        console.log(`[REG] User check done in ${Date.now() - checkStartTime}ms`);

        if (existingUser) return res.status(400).json({ message: 'User exists' });

        const hashStartTime = Date.now();
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        console.log(`[REG] Password hashed in ${Date.now() - hashStartTime}ms`);

        const insertStartTime = Date.now();
        const [newUser] = await db.insert(users).values({ name, email, password: hashedPassword, department, roll }).returning();
        console.log(`[REG] User inserted in ${Date.now() - insertStartTime}ms`);

        const token = jwt.sign({ id: newUser.id, role: newUser.role }, 'secret_key', { expiresIn: '7d' });

        // Send welcome email (don't await to avoid blocking)
        console.log('[REG] Sending welcome email...');
        sendEmail(email, emailTemplates.welcome, [name])
            .then(() => console.log('[REG] Welcome email sent successfully'))
            .catch(err => console.error('[REG] Failed to send welcome email:', err.message));

        console.log('[REG] Registration complete for:', email);
        res.status(201).json({ token, _id: newUser.id, ...newUser });
    } catch (err) {
        console.error('🔥 [FATAL REGISTRATION ERROR] 🔥');
        console.error('Error Details:', err);
        console.error('Stack Trace:', err.stack);

        // Ensure we send a clean JSON object even if err has circular references
        const errorResponse = {
            message: 'Server error during registration',
            error: err.message || 'Unknown error',
            code: err.code || null,
            detail: err.detail || null,
            hint: err.hint || null,
            stack_snippet: err.stack ? err.stack.toString().substring(0, 200) : null
        };
        res.status(500).json(errorResponse);
    }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
    const user = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        department: users.department,
        roll: users.roll,
        isBlocked: users.isBlocked,
        createdAt: users.createdAt
    }).from(users).where(eq(users.id, req.user.id)).limit(1).then(r => r[0]);

    if (user) user._id = user.id; // Map id for frontend compatibility
    res.json(user);
});

app.get('/api/auth/seed-admin', async (req, res) => {
    const email = "jovayerhossain0@gmail.com";
    const password = "Jovayer1234&";
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    let user = await db.select().from(users).where(eq(users.email, email)).limit(1).then(r => r[0]);

    if (user) {
        await db.update(users).set({ password: hashedPassword, role: "admin" }).where(eq(users.id, user.id));
        return res.json({ message: 'Admin password reset to: Jovayer1234&' });
    }

    await db.insert(users).values({
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
// ★ CLOUDINARY UPLOAD CONFIGURATION
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

if (process.env.CLOUDINARY_URL) {
    cloudinary.config(); // Automatically picks up CLOUDINARY_URL
} else {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

const fileUploadMiddleware = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB limit
    },
});

app.post('/api/upload', authenticateToken, fileUploadMiddleware.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image provided' });
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'icst-issue-portal',
                resource_type: 'image',
                transformation: [
                    { width: 800, crop: "scale" }, // Resize to keep sizes low
                    { quality: "auto", fetch_format: "auto" } // Auto optimize
                ]
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({ message: 'Image upload failed' });
                }
                res.status(200).json({ imageUrl: result.secure_url });
            }
        );

        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({ message: "Server Error during upload" });
    }
});


// The issue board is designed to be publicly accessible for transparency
// All users (including non-authenticated) can view the list of issues
// CACHE OPTIMIZATION: Cache globally at CDN level (s-maxage) and browser level (max-age)
app.get('/api/issues', async (req, res) => {
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
    try {
        // Filter at DB level: only return non-pending issues for public view
        const issuesData = await db.select().from(issues)
            .where(sql`${issues.status} != 'pending'`)
            .orderBy(desc(issues.createdAt));
        // Remap id to _id for frontend components expecting MongoDB format
        const mappedIssues = issuesData.map(i => ({
            ...i,
            _id: i.id,
            votes: i.votesGood - i.votesBad // Simplify to net votes
        }));
        res.json(mappedIssues);
    } catch (err) {
        console.error(err);
        res.status(500).json([]);
    }
});

app.post('/api/issues', optionalAuthenticateToken, checkMaintenanceMode, async (req, res) => {
    try {
        const { title, description, category, priority, imageUrl, location, evidence, contactEmail } = req.body;
        const [issue] = await db.insert(issues).values({
            title,
            description,
            category,
            priority: priority || 'medium',
            status: 'pending',
            submittedBy: req.user ? req.user.id : null,
            votesGood: 0,
            votesBad: 0,
            views: 0,
            imageUrl: imageUrl || evidence || null,
            location: location || null,
            contactEmail: contactEmail || null
        }).returning();

        issue._id = issue.id;
        issue.votes = issue.votesGood - issue.votesBad;

        res.status(201).json(issue);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// 📊 GET /api/issues/stats - Public Stats for Hero Section
// IMPORTANT: Must be defined BEFORE /api/issues/:id
app.get('/api/issues/stats', async (req, res) => {
    try {
        const [totalIssuesCount] = await db.select({ count: sql`count(*)` }).from(issues);
        const [resolvedIssuesCount] = await db.select({ count: sql`count(*)` }).from(issues).where(eq(issues.status, 'resolved'));
        const [totalUsersCount] = await db.select({ count: sql`count(*)` }).from(users);

        res.json({
            totalIssues: Number(totalIssuesCount?.count || 0),
            resolvedIssues: Number(resolvedIssuesCount?.count || 0),
            totalUsers: Number(totalUsersCount?.count || 0)
        });
    } catch (err) {
        console.error('Stats fetch error:', err);
        res.status(500).json({ totalIssues: 0, resolvedIssues: 0, totalUsers: 0 });
    }
});

// View single issue - Requires authentication to prevent view count manipulation
app.get('/api/issues/:id', optionalAuthenticateToken, checkMaintenanceMode, async (req, res) => {
    try {
        const issueRows = await db.select({
            issue: issues,
            submitter: users
        })
            .from(issues)
            .leftJoin(users, eq(issues.submittedBy, users.id))
            .where(eq(issues.id, req.params.id))
            .limit(1);

        if (!issueRows.length) return res.status(404).json({ message: "Not found" });

        const row = issueRows[0];
        const issue = row.issue;

        // Increment view (only counted for authenticated users)
        if (req.user) {
            await db.update(issues).set({ views: issue.views + 1 }).where(eq(issues.id, issue.id));
            issue.views += 1;
        }

        // Fetch voted users and their sentiments
        const votersData = await db.select({
            userId: issueVotedUsers.userId,
            type: issueVotedUsers.type,
            name: users.name
        })
            .from(issueVotedUsers)
            .leftJoin(users, eq(issueVotedUsers.userId, users.id))
            .where(eq(issueVotedUsers.issueId, issue.id));

        const votersMap = {};
        const votersList = [];
        votersData.forEach(v => {
            votersMap[v.userId] = v.type || "voted";
            votersList.push({
                _id: v.userId,
                name: v.name || 'Unknown User',
                type: v.type || 'good'
            });
        });

        const issueObj = {
            ...issue,
            _id: issue.id,
            votes: issue.votesGood - issue.votesBad,
            submittedBy: row.submitter ? { _id: row.submitter.id, name: row.submitter.name } : null,
            voters: votersMap,
            votersList: votersList
        };

        res.json(issueObj);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.patch('/api/issues/:id', authenticateToken, checkMaintenanceMode, async (req, res) => {
    try {
        const issue = await db.select().from(issues).where(eq(issues.id, req.params.id)).limit(1).then(r => r[0]);

        if (!issue) return res.status(404).json({ message: "Not found" });

        // Check permission
        if (req.user.role !== 'admin' && issue.submittedBy !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const oldStatus = issue.status;

        const updateData = { ...req.body, updatedAt: new Date() };
        delete updateData._id; // Prevent updating PK
        if (updateData.id) delete updateData.id;

        const [updatedIssue] = await db.update(issues).set(updateData).where(eq(issues.id, req.params.id)).returning();
        updatedIssue._id = updatedIssue.id;

        // Audit log for admin actions
        if (req.user.role === 'admin') {
            try {
                await db.insert(auditLogs).values({
                    adminId: req.user.id,
                    targetId: updatedIssue.id,
                    targetType: 'issue',
                    action: req.body.status ? 'update_status' : 'update_issue',
                    details: req.body.status
                        ? `Status changed from "${oldStatus}" to "${req.body.status}" for issue "${updatedIssue.title}"`
                        : `Issue "${updatedIssue.title}" updated`,
                    ip: req.ip
                });
            } catch (auditError) {
                console.error('Audit log failed:', auditError);
            }
        }

        res.json(updatedIssue);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.delete('/api/issues/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin only" });

        const issue = await db.select().from(issues).where(eq(issues.id, req.params.id)).limit(1).then(r => r[0]);
        if (!issue) return res.status(404).json({ message: "Not found" });

        const issueTitle = issue.title;

        // Delete dependencies first
        await db.delete(issueVotedUsers).where(eq(issueVotedUsers.issueId, req.params.id));
        await db.delete(issueTimeline).where(eq(issueTimeline.issueId, req.params.id));
        await db.delete(issues).where(eq(issues.id, req.params.id));

        // Audit log
        try {
            await db.insert(auditLogs).values({
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
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Issue Status Update (for PendingIssues approval workflow)
app.put('/api/issues/:id/status', authenticateToken, async (req, res) => {
    try {
        // Only admins can update issue status
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin only' });
        }

        const issue = await db.select().from(issues).where(eq(issues.id, req.params.id)).limit(1).then(r => r[0]);
        if (!issue) return res.status(404).json({ message: 'Issue not found' });

        const oldStatus = issue.status;
        const [updatedIssue] = await db.update(issues).set({
            status: req.body.status,
            updatedAt: new Date()
        }).where(eq(issues.id, req.params.id)).returning();

        // Audit log
        try {
            await db.insert(auditLogs).values({
                adminId: req.user.id,
                targetId: updatedIssue.id,
                targetType: 'issue',
                action: 'update_status',
                details: `Status changed from "${oldStatus}" to "${req.body.status}" for issue "${updatedIssue.title}"`,
                ip: req.ip
            });
        } catch (auditError) {
            console.error('Audit log failed:', auditError);
        }

        updatedIssue._id = updatedIssue.id;
        res.json({ message: 'Status updated', issue: updatedIssue });

        // ★ PUSH NOTIFICATION: Status change -> notify issue owner
        if (updatedIssue.submittedBy) {
            const statusLabels = { 'pending': 'পেন্ডিং', 'in-progress': 'প্রসেসিং', 'resolved': 'সমাধান হয়েছে', 'rejected': 'প্রত্যাখ্যান' };
            sendPushToUser(updatedIssue.submittedBy, {
                title: 'ইস্যু আপডেট 📢',
                body: `আপনার ইস্যু "${updatedIssue.title}" এর স্ট্যাটাস: ${statusLabels[req.body.status] || req.body.status}`,
                url: `/issues/${updatedIssue.id}`
            });
        }
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Failed to update status' });
    }
});

// Voting (PUT to match frontend IssueCard line 132: api.put)
app.put('/api/issues/:id/vote', authenticateToken, checkMaintenanceMode, async (req, res) => {
    try {
        const issue = await db.select().from(issues).where(eq(issues.id, req.params.id)).limit(1).then(r => r[0]);
        if (!issue) return res.status(404).json({ message: "Not found" });

        const userId = req.user.id;

        // Check if user ID is in votedUsers array
        const existingVote = await db.select().from(issueVotedUsers).where(
            and(
                eq(issueVotedUsers.issueId, issue.id),
                eq(issueVotedUsers.userId, userId)
            )
        ).limit(1).then(r => r[0]);

        if (existingVote) {
            return res.status(400).json({ message: "already" });
        }

        const type = req.body.type; // 'good' or 'bad'
        let newVotesGood = issue.votesGood;
        let newVotesBad = issue.votesBad;

        if (type === 'good') newVotesGood += 1;
        if (type === 'bad') newVotesBad += 1;

        await db.update(issues).set({
            votesGood: newVotesGood,
            votesBad: newVotesBad
        }).where(eq(issues.id, issue.id));

        await db.insert(issueVotedUsers).values({
            issueId: issue.id,
            userId: userId,
            type: type // Save the exact vote sentiment ('good' or 'bad')
        });

        // Prepare response format matching frontend IssueCard expectations
        const votersData = await db.select().from(issueVotedUsers).where(eq(issueVotedUsers.issueId, issue.id));
        const votersMap = {};
        votersData.forEach(v => votersMap[v.userId] = v.type || "voted");

        const issueObj = {
            ...issue,
            _id: issue.id,
            votesGood: newVotesGood,
            votesBad: newVotesBad,
            votes: {
                good: newVotesGood,
                bad: newVotesBad
            },
            voters: votersMap
        };

        res.json(issueObj);

        // ★ PUSH NOTIFICATION: Vote -> notify issue owner
        if (issue.submittedBy && issue.submittedBy !== userId) {
            sendPushToUser(issue.submittedBy, {
                title: 'নতুন ভোট 👍',
                body: `কেউ আপনার ইস্যু "${issue.title}" তে ভোট দিয়েছেন`,
                url: `/issues/${issue.id}`
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Comments API
app.get('/api/issues/:id/comments', async (req, res) => {
    try {
        const issueId = req.params.id;
        // Fetch comments with user details
        const commentsData = await db.select({
            _id: comments.id,
            text: comments.text,
            parentId: comments.parentId,
            timestamp: comments.createdAt,
            username: users.name
        })
            .from(comments)
            .leftJoin(users, eq(comments.userId, users.id))
            .where(eq(comments.issueId, issueId))
            .orderBy(desc(comments.createdAt));

        res.json(commentsData);
    } catch (err) {
        console.error('Error fetching comments:', err);
        res.status(500).json([]);
    }
});

app.post('/api/issues/:id/comments', authenticateToken, checkMaintenanceMode, async (req, res) => {
    try {
        const issueId = req.params.id;
        const { text, parentId } = req.body;
        const userId = req.user.id;

        if (!text || text.trim() === '') {
            return res.status(400).json({ message: "Comment text is required" });
        }

        // Verify issue exists
        const issueExists = await db.select().from(issues).where(eq(issues.id, issueId)).limit(1).then(r => r[0]);
        if (!issueExists) {
            return res.status(404).json({ message: "Issue not found" });
        }

        const [newComment] = await db.insert(comments).values({
            issueId,
            userId,
            text,
            parentId: parentId && parentId.trim() !== "" ? parentId : null
        }).returning();

        // Fetch user name to append to the response
        const user = await db.select({ name: users.name }).from(users).where(eq(users.id, userId)).limit(1).then(r => r[0]);

        res.status(201).json({
            _id: newComment.id,
            text: newComment.text,
            parentId: newComment.parentId,
            timestamp: newComment.createdAt,
            username: user ? user.name : 'Unknown User'
        });

        // ★ PUSH NOTIFICATION: Comment -> notify issue owner
        if (issueExists.submittedBy && issueExists.submittedBy !== userId) {
            const commenterName = user ? user.name : 'কেউ';
            sendPushToUser(issueExists.submittedBy, {
                title: 'নতুন কমেন্ট 💬',
                body: `${commenterName} আপনার ইস্যু "${issueExists.title}" তে কমেন্ট করেছেন`,
                url: `/issues/${issueId}`
            });
        }
    } catch (err) {
        console.error('Error posting comment:', err);
        res.status(500).json({ message: "Server Error" });
    }
});

// User Dashboard Stats
app.get('/api/user/stats', authenticateToken, checkMaintenanceMode, async (req, res) => {
    try {
        const userId = req.user.id;

        // Use Promise.all to execute queries concurrently
        const [totalRes, pendingRes, inProgressRes, resolvedRes, criticalRes] = await Promise.all([
            db.select({ count: sql`count(*)` }).from(issues).where(eq(issues.submittedBy, userId)),
            db.select({ count: sql`count(*)` }).from(issues).where(and(eq(issues.submittedBy, userId), eq(issues.status, 'pending'))),
            db.select({ count: sql`count(*)` }).from(issues).where(and(eq(issues.submittedBy, userId), eq(issues.status, 'in-progress'))),
            db.select({ count: sql`count(*)` }).from(issues).where(and(eq(issues.submittedBy, userId), eq(issues.status, 'resolved'))),
            db.select({ count: sql`count(*)` }).from(issues).where(
                and(
                    eq(issues.submittedBy, userId),
                    or(eq(issues.priority, 'high'), eq(issues.priority, 'critical')),
                    sql`${issues.status} != 'resolved'`
                )
            )
        ]);

        // Calculate Avg Resolution Time (hours)
        const resolutionTimeRes = await db.select({
            avgTime: sql`AVG(EXTRACT(EPOCH FROM (${issues.updatedAt} - ${issues.createdAt})) / 3600)`
        })
            .from(issues)
            .where(and(eq(issues.submittedBy, userId), eq(issues.status, 'resolved')));

        res.json({
            total: Number(totalRes[0].count),
            pending: Number(pendingRes[0].count),
            inProgress: Number(inProgressRes[0].count),
            resolved: Number(resolvedRes[0].count),
            criticalCount: Number(criticalRes[0].count),
            avgResolutionTime: resolutionTimeRes[0].avgTime ? Math.round(Number(resolutionTimeRes[0].avgTime)) : 0
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// User Activities
app.get('/api/user/activities', authenticateToken, checkMaintenanceMode, async (req, res) => {
    try {
        const userId = req.user.id;

        const recentIssues = await db.select().from(issues)
            .where(eq(issues.submittedBy, userId))
            .orderBy(desc(issues.updatedAt))
            .limit(10);

        const activities = recentIssues.map(issue => ({
            id: issue.id,
            type: 'issue_update',
            message: `Issue "${issue.title}" - Status: ${issue.status}`,
            timestamp: issue.updatedAt
        }));

        res.json(activities);
    } catch (err) {
        console.error(err);
        res.status(500).json([]);
    }
});

// User Announcements
app.get('/api/user/announcements', authenticateToken, checkMaintenanceMode, async (req, res) => {
    try {
        const announcements = await db.select({
            id: messages.id,
            subject: messages.subject,
            message: messages.message,
            createdAt: messages.createdAt
        })
            .from(messages)
            .where(eq(messages.type, 'broadcast'))
            .orderBy(desc(messages.createdAt))
            .limit(5);

        const formatted = announcements.map(a => ({
            _id: a.id,
            title: a.subject || 'System Announcement',
            message: a.message,
            type: 'info',
            createdAt: a.createdAt
        }));

        res.json(formatted);
    } catch (err) {
        console.error(err);
        res.status(500).json([]);
    }
});

// ★ REAL DYNAMIC USER NOTIFICATIONS
// Generates notifications from actual user data: issue status changes, votes, comments, announcements
app.get('/api/user/notifications', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = [];

        // 1. Issue Status Updates — issues owned by user that were recently updated
        const userIssues = await db.select().from(issues)
            .where(eq(issues.submittedBy, userId))
            .orderBy(desc(issues.updatedAt))
            .limit(20);

        for (const issue of userIssues) {
            // Only show if updatedAt is different from createdAt (meaning it was actually updated)
            if (issue.updatedAt && issue.createdAt &&
                new Date(issue.updatedAt).getTime() !== new Date(issue.createdAt).getTime()) {

                const statusLabels = {
                    'pending': 'পেন্ডিং',
                    'in-progress': 'প্রসেসিং হচ্ছে',
                    'resolved': 'সমাধান হয়েছে',
                    'rejected': 'প্রত্যাখ্যান হয়েছে'
                };

                const statusLabel = statusLabels[issue.status] || issue.status;
                const notifType = issue.status === 'resolved' ? 'resolution'
                    : issue.status === 'in-progress' ? 'issue_update'
                        : 'issue_update';

                notifications.push({
                    id: `status_${issue.id}`,
                    type: notifType,
                    title: issue.status === 'resolved' ? 'সমাধান সম্পন্ন ✅' : 'ইস্যু আপডেট',
                    message: `আপনার ইস্যু "${issue.title}" — স্ট্যাটাস: ${statusLabel}`,
                    read: false,
                    createdAt: issue.updatedAt,
                    issueId: issue.id
                });
            }
        }

        // 2. Votes on user's issues
        for (const issue of userIssues) {
            const totalVotes = (issue.votesGood || 0) + (issue.votesBad || 0);
            if (totalVotes > 0) {
                notifications.push({
                    id: `vote_${issue.id}`,
                    type: 'vote',
                    title: 'নতুন ভোট',
                    message: `আপনার ইস্যু "${issue.title}" তে ${totalVotes} জন ভোট দিয়েছেন`,
                    read: false,
                    createdAt: issue.updatedAt || issue.createdAt,
                    issueId: issue.id
                });
            }
        }

        // 3. Comments on user's issues
        const issueIds = userIssues.map(i => i.id);
        if (issueIds.length > 0) {
            const recentComments = await db.select({
                commentId: comments.id,
                issueId: comments.issueId,
                text: comments.text,
                createdAt: comments.createdAt,
                commenterName: users.name,
                commenterId: comments.userId
            })
                .from(comments)
                .leftJoin(users, eq(comments.userId, users.id))
                .where(sql`${comments.issueId} IN (${sql.join(issueIds.map(id => sql`${id}`), sql`, `)})`)
                .orderBy(desc(comments.createdAt))
                .limit(10);

            for (const comment of recentComments) {
                // Don't notify for user's own comments
                if (comment.commenterId === userId) continue;

                const matchingIssue = userIssues.find(i => i.id === comment.issueId);
                notifications.push({
                    id: `comment_${comment.commentId}`,
                    type: 'comment',
                    title: 'নতুন কমেন্ট',
                    message: `${comment.commenterName || 'কেউ'} আপনার ইস্যু "${matchingIssue?.title || ''}" তে কমেন্ট করেছেন`,
                    read: false,
                    createdAt: comment.createdAt,
                    issueId: comment.issueId
                });
            }
        }

        // 4. Broadcast announcements
        const announcements = await db.select({
            id: messages.id,
            subject: messages.subject,
            message: messages.message,
            createdAt: messages.createdAt
        })
            .from(messages)
            .where(eq(messages.type, 'broadcast'))
            .orderBy(desc(messages.createdAt))
            .limit(3);

        for (const a of announcements) {
            notifications.push({
                id: `announce_${a.id}`,
                type: 'announcement',
                title: a.subject || 'ঘোষণা',
                message: a.message,
                read: false, // Make it unread so it triggers the badge for everyone
                createdAt: a.createdAt,
                issueId: null
            });
        }

        // 5. SORT BY DATE DESCENDING (NEWEST FIRST)
        notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        res.json(notifications.slice(0, 30)); // Return top 30
    } catch (err) {
        console.error('Notifications error:', err);
        res.status(500).json([]);
    }
});

// Admin Stats
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        // Run all count aggregations concurrently
        const [
            totalRes, pendingRes, inProgressRes, resolvedRes, criticalRes,
            todayRes, weekRes, totalUsersRes, activeUsersRes
        ] = await Promise.all([
            db.select({ count: sql`count(*)` }).from(issues),
            db.select({ count: sql`count(*)` }).from(issues).where(eq(issues.status, 'pending')),
            db.select({ count: sql`count(*)` }).from(issues).where(eq(issues.status, 'in-progress')),
            db.select({ count: sql`count(*)` }).from(issues).where(eq(issues.status, 'resolved')),
            db.select({ count: sql`count(*)` }).from(issues).where(and(or(eq(issues.priority, 'high'), eq(issues.priority, 'critical')), eq(issues.status, 'pending'))),
            db.select({ count: sql`count(*)` }).from(issues).where(sql`${issues.createdAt} >= ${today}`),
            db.select({ count: sql`count(*)` }).from(issues).where(sql`${issues.createdAt} >= ${weekAgo}`),
            db.select({ count: sql`count(*)` }).from(users).where(eq(users.role, 'user')),
            db.select({ count: sql`count(*)` }).from(users).where(and(eq(users.role, 'user'), eq(users.isBlocked, false)))
        ]);

        res.json({
            total: Number(totalRes[0].count),
            pending: Number(pendingRes[0].count),
            inProgress: Number(inProgressRes[0].count),
            resolved: Number(resolvedRes[0].count),
            todayCount: Number(todayRes[0].count),
            weekCount: Number(weekRes[0].count),
            criticalCount: Number(criticalRes[0].count),
            avgResolutionTime: 0,
            totalUsers: Number(totalUsersRes[0].count),
            activeUsers: Number(activeUsersRes[0].count)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Admin Issues (All records including pending)
app.get('/api/admin/issues', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const issuesData = await db.select().from(issues).orderBy(desc(issues.createdAt));
        const mappedIssues = issuesData.map(i => ({
            ...i,
            _id: i.id,
            votes: i.votesGood - i.votesBad
        }));
        res.json(mappedIssues);
    } catch (err) {
        console.error(err);
        res.status(500).json([]);
    }
});

// Admin Analytics
app.get('/api/admin/analytics', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Optimized aggregation queries using Drizzle ORM native SQL formatting
        const [categoryAgg, statusAgg, dailyStatsAgg, departmentAgg] = await Promise.all([
            db.select({ _id: issues.category, count: sql`count(*)` }).from(issues).groupBy(issues.category),
            db.select({ _id: issues.status, count: sql`count(*)` }).from(issues).groupBy(issues.status),
            db.select({
                _id: sql`to_char(${issues.createdAt}, 'MM/DD')`.as('_id'),
                issues: sql`cast(count(*) as integer)`.as('issues'),
                resolved: sql`cast(sum(case when ${issues.status} = 'resolved' then 1 else 0 end) as integer)`.as('resolved')
            })
                .from(issues)
                .where(sql`${issues.createdAt} >= ${startDate}`)
                .groupBy(sql`to_char(${issues.createdAt}, 'MM/DD')`)
                .orderBy(sql`to_char(${issues.createdAt}, 'MM/DD')`),
            db.select({
                department: sql`coalesce(${users.department}, 'Unknown')`.as('department'),
                total: sql`cast(count(*) as integer)`.as('total'),
                resolved: sql`cast(sum(case when ${issues.status} = 'resolved' then 1 else 0 end) as integer)`.as('resolved'),
                pending: sql`cast(sum(case when ${issues.status} = 'pending' then 1 else 0 end) as integer)`.as('pending')
            })
                .from(issues)
                .leftJoin(users, eq(issues.submittedBy, users.id))
                .groupBy(sql`coalesce(${users.department}, 'Unknown')`)
        ]);

        res.json({
            issuesByCategory: categoryAgg.map(item => ({ name: item._id || 'Other', value: Number(item.count) })),
            issuesByStatus: statusAgg.map(item => ({ name: item._id, value: Number(item.count) })),
            trendData: dailyStatsAgg.map(item => ({ date: item._id, issues: item.issues, resolved: item.resolved })),
            departmentStats: departmentAgg.filter(d => d.total > 0)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Admin System Configuration
app.get('/api/admin/system-config', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

        let config = await db.select().from(systemConfig).limit(1).then(r => r[0]);
        if (!config) {
            // Create default config if none exists
            const [newConfig] = await db.insert(systemConfig).values({
                categories: ['Academic', 'Infrastructure', 'Canteen', 'Library', 'Transport', 'Other'],
                priorities: ['low', 'medium', 'high', 'critical'],
                maintenanceMode: false,
                allowRegistration: true,
                slaRules: {
                    criticalResponseTime: 2,
                    highResponseTime: 24,
                    mediumResponseTime: 48
                }
            }).returning();
            config = newConfig;
        }
        res.json(config);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.post('/api/admin/system-config', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

        let config = await db.select().from(systemConfig).limit(1).then(r => r[0]);
        if (config) {
            const updateProps = { ...req.body };
            delete updateProps._id; // sanitize
            delete updateProps.id;

            const [updatedConfig] = await db.update(systemConfig)
                .set(updateProps)
                .where(eq(systemConfig.id, config.id))
                .returning();
            config = updatedConfig;
        } else {
            const [newConfig] = await db.insert(systemConfig).values(req.body).returning();
            config = newConfig;
        }

        // Log audit
        await db.insert(auditLogs).values({
            adminId: req.user.id,
            targetId: config.id,
            targetType: 'system',
            action: 'update_config',
            details: 'System configuration updated',
            ip: req.ip
        });

        res.json({ message: 'Configuration saved', config });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// ★ ADMIN: Granular System Reset (Mobile Style)
app.post('/api/admin/system/reset', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { type } = req.body;
        let details = "";

        if (type === 'issues') {
            await db.delete(issueVotedUsers);
            await db.delete(issueTimeline);
            await db.delete(comments);
            await db.delete(issues);
            details = "All issues, votes, comments, and timelines reset";
        } else if (type === 'users') {
            // Delete dependants before erasing users
            await db.delete(issueVotedUsers);
            await db.delete(issueTimeline);
            await db.delete(comments);
            await db.delete(issues);
            await db.delete(messages);
            await db.delete(pushSubscriptions);
            await db.delete(passwordResetTokens);

            // Delete all non-admins
            await db.delete(users).where(sql`${users.role} != 'admin'`);
            details = "All non-admin user accounts and related data reset";
        } else if (type === 'all') {
            await db.delete(issueVotedUsers);
            await db.delete(issueTimeline);
            await db.delete(comments);
            await db.delete(issues);
            await db.delete(messages);
            await db.delete(auditLogs).where(sql`${auditLogs.action} != 'system_reset'`);
            await db.delete(pushSubscriptions);
            await db.delete(passwordResetTokens);
            details = "All transactional data (issues, messages, some logs) reset";
        } else if (type === 'factory') {
            await db.delete(issueVotedUsers);
            await db.delete(issueTimeline);
            await db.delete(comments);
            await db.delete(issues);
            await db.delete(messages);
            await db.delete(auditLogs);
            await db.delete(pushSubscriptions);
            await db.delete(passwordResetTokens);
            await db.delete(articles);
            await db.delete(users).where(sql`${users.id} != ${req.user.id}`);

            // Reset system config to default
            const hasConfig = await db.select().from(systemConfig).limit(1).then(r => r[0]);
            if (hasConfig) {
                await db.update(systemConfig).set({
                    categories: ['Academic', 'Infrastructure', 'Canteen', 'Library', 'Transport', 'Other'],
                    priorities: ['low', 'medium', 'high', 'critical'],
                    maintenanceMode: false,
                    allowRegistration: true,
                    slaRules: {
                        criticalResponseTime: 2,
                        highResponseTime: 24,
                        mediumResponseTime: 48
                    }
                }).where(eq(systemConfig.id, hasConfig.id));
            }
            details = "Full factory reset performed. All data except current admin cleared.";
        } else {
            return res.status(400).json({ message: "Invalid reset type" });
        }

        // Log the reset action if auditLogs still exists
        try {
            await db.insert(auditLogs).values({
                adminId: req.user.id,
                targetId: 'system',
                targetType: 'system',
                action: 'system_reset',
                details: details,
                ip: req.ip
            });
        } catch (e) {
            console.error('Audit log for reset failed:', e.message);
        }

        res.json({ message: "Reset successful", details });
    } catch (err) {
        console.error('System reset error:', err);
        res.status(500).json({ message: "Reset failed", error: err.message });
    }
});

// Admin Activity Feed
app.get('/api/admin/activity', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const recentIssues = await db.select({
            id: issues.id,
            title: issues.title,
            priority: issues.priority,
            createdAt: issues.createdAt,
            submitterName: users.name
        })
            .from(issues)
            .leftJoin(users, eq(issues.submittedBy, users.id))
            .orderBy(desc(issues.createdAt))
            .limit(10);

        const activities = recentIssues.map(issue => ({
            id: issue.id,
            type: 'new_issue',
            title: 'New Issue Submitted',
            description: `${issue.title} (${issue.priority})`,
            user: issue.submitterName || 'Anonymous',
            timestamp: issue.createdAt
        }));

        res.json(activities);
    } catch (err) {
        console.error(err);
        res.status(500).json([]);
    }
});

// Admin Audit Logs
app.get('/api/admin/audit-logs', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

        const logs = await db.select({
            _id: auditLogs.id,
            action: auditLogs.action,
            details: auditLogs.details,
            targetId: auditLogs.targetId,
            targetType: auditLogs.targetType,
            ip: auditLogs.ip,
            timestamp: auditLogs.timestamp,
            adminId: { name: users.name, email: users.email }
        })
            .from(auditLogs)
            .leftJoin(users, eq(auditLogs.adminId, users.id))
            .orderBy(desc(auditLogs.timestamp))
            .limit(100);

        res.json(logs);
    } catch (err) {
        console.error(err);
        res.status(500).json([]);
    }
});

// Admin User Management
app.get('/api/admin/users', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

        const usersList = await db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            department: users.department,
            roll: users.roll,
            isBlocked: users.isBlocked,
            createdAt: users.createdAt,
            issueCount: sql`cast(count(${issues.id}) as integer)`
        })
            .from(users)
            .leftJoin(issues, eq(issues.submittedBy, users.id))
            .groupBy(users.id)
            .orderBy(desc(users.createdAt));

        const formatted = usersList.map(u => ({ ...u, _id: u.id }));
        res.json(formatted);
    } catch (err) {
        console.error(err);
        res.status(500).json([]);
    }
});

// Admin Staff Management
app.get('/api/admin/staff', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'super_admin') return res.status(403).json({ message: 'Admin only' });

        const staffList = await db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            department: users.department,
            assignedIssues: sql`cast(count(case when ${issues.status} != 'Resolved' and ${issues.status} != 'Closed' and ${issues.assignedTo} = ${users.id} then 1 else null end) as integer)`,
            resolvedIssues: sql`cast(count(case when (${issues.status} = 'Resolved' or ${issues.status} = 'Closed') and ${issues.assignedTo} = ${users.id} then 1 else null end) as integer)`
        })
            .from(users)
            .leftJoin(issues, eq(issues.assignedTo, users.id))
            .where(or(
                eq(users.role, 'admin'),
                eq(users.role, 'super_admin'),
                eq(users.role, 'dept_head'),
                eq(users.role, 'staff'),
                eq(users.role, 'viewer')
            ))
            .groupBy(users.id)
            .orderBy(desc(users.createdAt));

        const formatted = staffList.map(s => ({
            ...s,
            status: 'available' // Mock availability status for now
        }));

        res.json(formatted);
    } catch (err) {
        console.error(err);
        res.status(500).json([]);
    }
});

app.post('/api/admin/staff', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Admin only access' });
        }

        const { name, email, password, role, department } = req.body;

        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1).then(r => r[0]);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.insert(users).values({
            name,
            email,
            password: hashedPassword,
            role: role || 'staff',
            department: department || 'General'
        });

        res.status(201).json({ message: 'Staff member created successfully' });
    } catch (error) {
        console.error('Error creating staff:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.patch('/api/admin/users/:id/block', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

        const user = await db.select().from(users).where(eq(users.id, req.params.id)).limit(1).then(r => r[0]);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const newBlockedStatus = !user.isBlocked;
        await db.update(users).set({ isBlocked: newBlockedStatus }).where(eq(users.id, user.id));

        // Log audit
        await db.insert(auditLogs).values({
            adminId: req.user.id,
            targetId: user.id,
            targetType: 'user',
            action: newBlockedStatus ? 'block_user' : 'unblock_user',
            details: `User ${user.email} was ${newBlockedStatus ? 'blocked' : 'unblocked'}`,
            ip: req.ip
        });

        res.json({ message: `User ${newBlockedStatus ? 'blocked' : 'active'}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.post('/api/admin/users/:id/reset-password', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

        const user = await db.select().from(users).where(eq(users.id, req.params.id)).limit(1).then(r => r[0]);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const defaultPass = "123456";
        const hashedPassword = await bcrypt.hash(defaultPass, 8);
        await db.update(users).set({ password: hashedPassword }).where(eq(users.id, user.id));

        // Log audit
        await db.insert(auditLogs).values({
            adminId: req.user.id,
            targetId: user.id,
            targetType: 'user',
            action: 'reset_password',
            details: `Password reset for ${user.email}`,
            ip: req.ip
        });

        res.json({ message: 'Password reset successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Get specific user statistics (for admin)
app.get('/api/admin/users/:id/stats', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

        const userId = req.params.id;

        const [totalRes, pendingRes, inProgressRes, resolvedRes, categoryAgg] = await Promise.all([
            db.select({ count: sql`count(*)` }).from(issues).where(eq(issues.submittedBy, userId)),
            db.select({ count: sql`count(*)` }).from(issues).where(and(eq(issues.submittedBy, userId), eq(issues.status, 'pending'))),
            db.select({ count: sql`count(*)` }).from(issues).where(and(eq(issues.submittedBy, userId), eq(issues.status, 'in-progress'))),
            db.select({ count: sql`count(*)` }).from(issues).where(and(eq(issues.submittedBy, userId), eq(issues.status, 'resolved'))),
            db.select({ _id: issues.category, count: sql`count(*)` }).from(issues).where(eq(issues.submittedBy, userId)).groupBy(issues.category)
        ]);

        const categoryBreakdown = categoryAgg.map(item => ({
            category: item._id || 'Other',
            count: Number(item.count)
        }));

        res.json({
            total: Number(totalRes[0].count),
            pending: Number(pendingRes[0].count),
            inProgress: Number(inProgressRes[0].count),
            resolved: Number(resolvedRes[0].count),
            categoryBreakdown
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Communication Center
app.get('/api/messages', authenticateToken, async (req, res) => {
    try {
        const msgs = await db.select({
            _id: messages.id,
            subject: messages.subject,
            message: messages.message,
            type: messages.type,
            createdAt: messages.createdAt,
            from: { _id: users.id, name: users.name, email: users.email, roll: users.roll }
        })
            .from(messages)
            .leftJoin(users, eq(messages.from, users.id))
            .where(
                or(
                    eq(messages.to, req.user.id),
                    eq(messages.from, req.user.id),
                    eq(messages.type, 'broadcast')
                )
            )
            .orderBy(desc(messages.createdAt));

        res.json(msgs);
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
            const recipient = await db.select().from(users).where(eq(users.roll, req.body.toRoll)).limit(1).then(r => r[0]);
            if (!recipient) {
                return res.status(404).json({ message: `User with roll ${req.body.toRoll} not found` });
            }
            recipientId = recipient.id;
        }

        const [message] = await db.insert(messages).values({
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
            let userQuery = req.user.role === 'user' ? 'user' : 'user'; // Assume default targeting 'user' role
            if (recipients === 'students') {
                userQuery = 'user'; // Assuming students have role 'user'
            }

            const targetUsers = await db.select({ email: users.email, name: users.name })
                .from(users)
                .where(eq(users.role, userQuery));

            if (targetUsers.length === 0) {
                return res.status(400).json({ message: 'No users found' });
            }

            emailAddresses = targetUsers.map(u => u.email);
        }

        // Store broadcast message in database
        await db.insert(messages).values({
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

app.get('/api/user/issues', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const userIssues = await db.select().from(issues).where(eq(issues.submittedBy, userId)).orderBy(desc(issues.createdAt));
        const mappedIssues = userIssues.map(i => ({ ...i, _id: i.id, votes: i.votesGood - i.votesBad }));
        res.json(mappedIssues);
    } catch (err) {
        console.error(err);
        res.status(500).json([]);
    }
});

app.get('/api/issues/:id', authenticateToken, async (req, res) => {
    try {
        const issueId = req.params.id;
        const [issue] = await db.select().from(issues).where(eq(issues.id, issueId));

        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        const mappedIssue = { ...issue, _id: issue.id, votes: issue.votesGood - issue.votesBad };
        res.json(mappedIssue);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Knowledge Base Management
app.get('/api/admin/knowledge-base', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

        const articlesList = await db.select().from(articles).orderBy(desc(articles.createdAt));
        const mappedArticles = articlesList.map(a => ({ ...a, _id: a.id }));

        res.json(mappedArticles);
    } catch (err) {
        console.error(err);
        res.status(500).json([]);
    }
});

app.post('/api/admin/knowledge-base', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

        const [article] = await db.insert(articles).values(req.body).returning();

        await db.insert(auditLogs).values({
            adminId: req.user.id,
            targetId: article.id,
            targetType: 'knowledge_base',
            action: 'create_article',
            details: `Article created: ${article.title}`,
            ip: req.ip
        });

        article._id = article.id;
        res.status(201).json(article);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.put('/api/admin/knowledge-base/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

        const updateData = { ...req.body, updatedAt: new Date() };
        delete updateData._id;
        if (updateData.id) delete updateData.id;

        const [article] = await db.update(articles)
            .set(updateData)
            .where(eq(articles.id, req.params.id))
            .returning();

        if (!article) return res.status(404).json({ message: 'Article not found' });

        await db.insert(auditLogs).values({
            adminId: req.user.id,
            targetId: article.id,
            targetType: 'knowledge_base',
            action: 'update_article',
            details: `Article updated: ${article.title}`,
            ip: req.ip
        });

        article._id = article.id;
        res.json(article);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.delete('/api/admin/knowledge-base/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

        const [article] = await db.delete(articles).where(eq(articles.id, req.params.id)).returning();

        if (!article) return res.status(404).json({ message: 'Article not found' });

        await db.insert(auditLogs).values({
            adminId: req.user.id,
            targetId: article.id,
            targetType: 'knowledge_base',
            action: 'delete_article',
            details: `Article deleted: ${article.title}`,
            ip: req.ip
        });

        res.json({ message: 'Article deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

const upload = multer();
app.post('/api/upload', upload.single('file'), (req, res) => {
    res.json({
        url: 'https://placehold.co/600x400?text=Uploaded+Image',
        message: 'Mock upload successful'
    });
});


// ★ ADMIN: Get all users for user selector
app.get('/api/admin/all-users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const allUsers = await db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            department: users.department,
            roll: users.roll,
            role: users.role
        }).from(users).orderBy(users.name);
        res.json(allUsers);
    } catch (err) {
        console.error(err);
        res.status(500).json([]);
    }
});

// ★ ADMIN: Test Email Configuration
app.post('/api/admin/test-email', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { email, testRecipient } = req.body;
        const recipient = email || testRecipient || req.user.email;

        console.log(`📧 Testing email delivery to ${recipient}...`);

        const result = await sendEmail(recipient, 'welcome', [req.user.name || 'Admin']);

        // Determine what provider was used
        const resendKey = process.env.RESEND_API_KEY;
        const providerInfo = {
            provider: resendKey ? 'Resend (API)' : 'SMTP',
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            fromName: process.env.EMAIL_FROM_NAME || 'ICST Issue Portal'
        };

        if (result.success) {
            res.json({
                success: true,
                message: `Test email sent successfully to ${recipient}`,
                messageId: result.messageId,
                config: providerInfo
            });
        } else {
            let diagnosis = 'Email delivery failed.';
            const err = result.error || '';
            if (err.includes('ETIMEDOUT') || err.includes('timeout')) diagnosis = 'Connection timed out. SMTP ports may be blocked (use Resend instead).';
            else if (err.includes('EAUTH') || err.includes('auth')) diagnosis = 'Authentication failed. Check your API key or email credentials.';
            else if (err.includes('domain') || err.includes('sender')) diagnosis = 'Sender domain not verified. Verify your domain in Resend dashboard.';
            else if (err.includes('API key')) diagnosis = 'Invalid Resend API key. Check your key in Admin → Email Settings.';

            res.status(500).json({
                success: false,
                message: 'Email Test Failed',
                error: result.error,
                diagnosis,
                config: providerInfo
            });
        }
    } catch (err) {
        console.error('Email test error:', err);
        res.status(500).json({ message: 'Test route failed', error: err.message });
    }
});


// ★ ADMIN: Send custom email
app.post('/api/admin/send-email', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { recipients, subject, body, manualEmails } = req.body;
        // recipients: array of user IDs
        // manualEmails: array of manual email strings

        if (!subject || !body) {
            return res.status(400).json({ message: 'Subject and body are required' });
        }

        const emailList = [];

        // Get emails from selected user IDs
        if (recipients && recipients.length > 0) {
            for (const userId of recipients) {
                const user = await db.select({ email: users.email, name: users.name })
                    .from(users).where(eq(users.id, userId)).limit(1).then(r => r[0]);
                if (user && user.email) emailList.push(user.email);
            }
        }

        // Add manual emails
        if (manualEmails && manualEmails.length > 0) {
            emailList.push(...manualEmails.filter(e => e && e.includes('@')));
        }

        if (emailList.length === 0) {
            return res.status(400).json({ message: 'No recipients specified' });
        }

        // Remove duplicates
        const uniqueEmails = [...new Set(emailList)];

        // AWAIT the sendEmails to ensure the serverless function doesn't kill the process early
        // Vercel kills all background tasks once the response is sent.
        const results = await sendBulkEmails(uniqueEmails, 'bulkEmail', { subject, body });
        console.log(`📧 Email batch finished: ${results.sent} sent, ${results.failed} failed`);

        // Audit log (immediate)
        await db.insert(auditLogs).values({
            adminId: req.user.id,
            targetId: null,
            targetType: 'email',
            action: 'send_bulk_email_queued',
            details: `Queued email "${subject}" for ${uniqueEmails.length} recipients`,
            ip: req.ip
        });

        res.json({
            message: `Email sending started for ${uniqueEmails.length} recipients...`,
            queued: uniqueEmails.length,
            success: true
        });
    } catch (err) {
        console.error('Send email error:', err);
        res.status(500).json({ message: 'Failed to send emails' });
    }
});

// ★ ADMIN: Send custom push notification
app.post('/api/admin/send-push', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { recipients, title, body, url } = req.body;
        // recipients: array of user IDs, or 'all' for all users

        if (!title || !body) {
            return res.status(400).json({ message: 'Title and body are required' });
        }

        let targetUserIds = [];

        if (recipients === 'all' || (Array.isArray(recipients) && recipients.includes('all'))) {
            // Send to all users
            const allUsers = await db.select({ id: users.id }).from(users);
            targetUserIds = allUsers.map(u => u.id);
        } else if (Array.isArray(recipients) && recipients.length > 0) {
            targetUserIds = recipients;
        } else {
            return res.status(400).json({ message: 'No recipients specified' });
        }

        let successCount = 0;
        for (const userId of targetUserIds) {
            try {
                await sendPushToUser(userId, { title, body, url: url || '/user/dashboard' });
                successCount++;
            } catch (e) {
                // Ignore individual failures
            }
        }

        // Audit log
        await db.insert(auditLogs).values({
            adminId: req.user.id,
            targetId: null,
            targetType: 'push_notification',
            action: 'send_push',
            details: `Sent push "${title}" to ${successCount} users`,
            ip: req.ip
        });

        res.json({
            message: `Push notification sent to ${successCount} users`,
            success: successCount,
            total: targetUserIds.length
        });
    } catch (err) {
        console.error('Send push error:', err);
        res.status(500).json({ message: 'Failed to send push notifications' });
    }
});

// Maintenance Mode is checked via middleware
// Audit logs are inserted for all critical actions above

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
