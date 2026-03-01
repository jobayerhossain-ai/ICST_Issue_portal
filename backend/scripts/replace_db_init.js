const fs = require('fs');
const content = fs.readFileSync('backend/api/index.js', 'utf8');
const lines = content.split(/\r?\n/);

const startIndex = 127; // line 128
const endIndex = 269; // line 270

const newCode = `
// --- ADMIN DATABASE INITIALIZATION ROUTE ---
// Manually run this once after deploying to set up tables. 
// Removed from cold start to prevent Vercel 504 Gateway Timeouts (the "hanging" issue).
app.get('/api/admin/system/init-database', async (req, res) => {
    if (!process.env.DATABASE_URL) {
        return res.status(500).json({ error: 'DATABASE_URL missing' });
    }
    
    const runQuery = async (name, query) => {
        const start = Date.now();
        console.log(\`⏳ [DB INIT] \${name}...\`);
        await sqlClient(query);
        console.log(\`✅ [DB INIT] \${name} (\${Date.now() - start}ms)\`);
    };

    try {
        console.log('🚀 [DB INIT] Starting Manual Initialization');
        
        await runQuery('pgcrypto extension', 'CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
        
        await runQuery('users table', \`CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            department TEXT,
            roll TEXT,
            is_blocked BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT NOW()
        )\`);

        await runQuery('system_config table', \`CREATE TABLE IF NOT EXISTS system_config (
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
        )\`);

        await runQuery('issues table', \`CREATE TABLE IF NOT EXISTS issues (
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
        )\`);

        await runQuery('issues migration (columns)', 'ALTER TABLE issues ADD COLUMN IF NOT EXISTS location TEXT, ADD COLUMN IF NOT EXISTS contact_email TEXT');

        await runQuery('issue_voted_users table', \`CREATE TABLE IF NOT EXISTS issue_voted_users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            issue_id UUID REFERENCES issues(id),
            user_id UUID REFERENCES users(id),
            type TEXT NOT NULL DEFAULT 'good'
        )\`);

        await runQuery('push_subscriptions table', \`CREATE TABLE IF NOT EXISTS push_subscriptions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id),
            endpoint TEXT NOT NULL,
            keys JSONB NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        )\`);

        await runQuery('audit_logs table', \`CREATE TABLE IF NOT EXISTS audit_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            admin_id UUID REFERENCES users(id),
            target_id TEXT,
            target_type TEXT,
            action TEXT,
            details TEXT,
            ip TEXT,
            timestamp TIMESTAMP DEFAULT NOW()
        )\`);

        // Seed default config if none exists
        console.log('⏳ [DB INIT] Checking system_config count...');
        const configCount = await sqlClient(\`SELECT count(*) FROM system_config\`);
        if (parseInt(configCount[0].count) === 0) {
            await sqlClient(\`INSERT INTO system_config (allow_registration) VALUES (true)\`);
            console.log('🌱 [DB INIT] Seeded default system_config');
        }

        console.log('✅ [DB INIT] All initialization steps complete');
        res.json({ success: true, message: 'Database successfully initialized.' });
    } catch (err) {
        console.error('❌ [DB INIT] DATABASE INITIALIZATION FAILED:', err.message);
        res.status(500).json({ error: err.message });
    }
});
`;

// Always replace
lines.splice(startIndex, endIndex - startIndex, newCode);
fs.writeFileSync('backend/api/index.js', lines.join('\n'));
console.log('Successfully replaced file content.');
