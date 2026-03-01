const { Resend } = require('resend');
const nodemailer = require('nodemailer'); // SMTP fallback for local dev

// ============================================================
// ★ Resend (Primary — works on Vercel via HTTPS)
// ★ Nodemailer SMTP (Fallback — local dev only)
// ============================================================

// ★ Helper: Fetch latest config from DB (lazy-loaded to avoid circular deps)
// ★ Helper: Fetch latest config from DB (lazy-loaded to avoid circular deps)
let _db = null;
let _systemConfig = null;

// Allow main app to inject its DB to share connection
const setSharedDb = (db, configTable) => {
    _db = db;
    _systemConfig = configTable;
};

const getDbEmailConfig = async () => {
    try {
        if (!_db) {
            const { neon } = require('@neondatabase/serverless');
            const { drizzle } = require('drizzle-orm/neon-http');
            const schema = require('./schema');
            const sqlClient = neon(process.env.DATABASE_URL);
            _db = drizzle(sqlClient, { schema });
            _systemConfig = schema.systemConfig;
        }
        const rows = await _db.select().from(_systemConfig).limit(1);
        if (rows.length > 0) return rows[0];
        return null;
    } catch (err) {
        console.warn('⚠️ Could not fetch DB email config:', err.message);
        return null;
    }
};

// ★ Get the effective sending config (DB > .env)
const getEmailConfig = async () => {
    const dbConfig = await getDbEmailConfig();
    return {
        resendApiKey: (dbConfig && dbConfig.resendApiKey) || process.env.RESEND_API_KEY || null,
        fromEmail: (dbConfig && dbConfig.emailFrom) || process.env.EMAIL_FROM || 'onboarding@resend.dev',
        fromName: (dbConfig && dbConfig.emailFromName) || process.env.EMAIL_FROM_NAME || 'ICST Issue Portal',
        // SMTP fallback (for local dev if no Resend key)
        smtpHost: process.env.EMAIL_HOST || 'smtp.gmail.com',
        smtpPort: parseInt(process.env.EMAIL_PORT || '587'),
        smtpSecure: process.env.EMAIL_SECURE === 'true',
        smtpUser: process.env.EMAIL_USER || null,
        smtpPass: process.env.EMAIL_PASSWORD || null,
    };
};


// Email Templates
const emailTemplates = {
    welcome: (name) => ({
        subject: '🎉 Welcome to ICST Issue Portal!',
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">স্বাগতম ICST Issue Portal এ!</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
            <h2 style="color: #333333; margin-bottom: 20px;">হ্যালো ${name},</h2>
            <p style="color: #666666; line-height: 1.6; margin-bottom: 20px;">
                আপনার registration সফল হয়েছে! এখন আপনি ICST Issue Portal এ সব features ব্যবহার করতে পারবেন।
            </p>
            
            <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0;">
                <h3 style="margin: 0 0 10px 0; color: #333;">আপনি যা যা করতে পারবেন:</h3>
                <ul style="margin: 10px 0; padding-left: 20px; color: #666;">
                    <li style="margin-bottom: 8px;">Issue submit করুন</li>
                    <li style="margin-bottom: 8px;">Issue এর status track করুন</li>
                    <li style="margin-bottom: 8px;">অন্যান্য issues দেখুন ও vote করুন</li>
                    <li style="margin-bottom: 8px;">Admin থেকে message পান</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'https://icst-issue-portal.vercel.app'}/user/login" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; 
                          font-weight: bold; font-size: 16px;">
                    Login করুন →
                </a>
            </div>
            
            <p style="color: #999999; font-size: 14px; margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 20px;">
                যেকোনো সমস্যা হলে আমাদের contact করুন।
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
            <p style="color: #999999; font-size: 12px; margin: 0;">
                © 2025 ICST Issue Portal. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
        `
    }),

    forgotPassword: (name, resetToken) => ({
        subject: '🔑 Password Reset Request - ICST Issue Portal',
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🔑 Password Reset</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
            <h2 style="color: #333333; margin-bottom: 20px;">হ্যালো ${name},</h2>
            <p style="color: #666666; line-height: 1.6; margin-bottom: 20px;">
                আপনি password reset request করেছেন। নিচের link এ click করে নতুন password set করুন।
            </p>
            
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 30px 0;">
                <p style="margin: 0; color: #856404; font-size: 14px;">
                    ⚠️ এই link শুধুমাত্র <strong>30 minutes</strong> এর জন্য valid। আপনি যদি এই request না করে থাকেন, তাহলে এই email ignore করুন।
                </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'https://icst-issue-portal.vercel.app'}/user/reset-password?token=${resetToken}" 
                   style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); 
                          color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; 
                          font-weight: bold; font-size: 16px;">
                    নতুন Password Set করুন →
                </a>
            </div>
            
            <p style="color: #999999; font-size: 14px; margin-top: 30px;">
                অথবা এই link copy করুন:<br>
                <span style="color: #667eea; word-break: break-all; font-size: 12px;">
                    ${process.env.FRONTEND_URL || 'https://icst-issue-portal.vercel.app'}/user/reset-password?token=${resetToken}
                </span>
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
            <p style="color: #999999; font-size: 12px; margin: 0;">
                © 2025 ICST Issue Portal. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
        `
    }),

    issueUpdate: (userName, issueTitle, oldStatus, newStatus) => ({
        subject: `📋 Issue Update: ${issueTitle}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">📋 Issue Update</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
            <h2 style="color: #333333; margin-bottom: 20px;">হ্যালো ${userName},</h2>
            <p style="color: #666666; line-height: 1.6; margin-bottom: 20px;">
                আপনার submit করা issue এর status update হয়েছে।
            </p>
            
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">${issueTitle}</h3>
                <div style="display: inline-block; margin-right: 10px;">
                    <span style="background-color: #ffc107; color: #000; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                        ${oldStatus}
                    </span>
                    <span style="margin: 0 10px; color: #999;">→</span>
                    <span style="background-color: #28a745; color: #fff; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                        ${newStatus}
                    </span>
                </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'https://icst-issue-portal.vercel.app'}/user/dashboard" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; 
                          font-weight: bold; font-size: 16px;">
                    Dashboard দেখুন →
                </a>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
            <p style="color: #999999; font-size: 12px; margin: 0;">
                © 2025 ICST Issue Portal. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
        `
    }),

    bulkEmail: (subject, body) => ({
        subject: `📢 ${subject}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">📢 ${subject}</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
            <div style="color: #333333; line-height: 1.8; white-space: pre-wrap; font-size: 15px;">
${body}
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
            <p style="color: #999999; font-size: 12px; margin: 0;">
                © 2025 ICST Issue Portal. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
        `
    })
};

// Send Email Function
const sendEmail = async (to, template, data) => {
    try {
        // Resolve template
        let subject, html;
        if (typeof template === 'function') {
            const result = template(...(Array.isArray(data) ? data : [data]));
            subject = result.subject; html = result.html;
        } else if (typeof template === 'string' && emailTemplates[template]) {
            const result = Array.isArray(data)
                ? emailTemplates[template](...data)
                : emailTemplates[template](data.subject, data.body);
            subject = result.subject; html = result.html;
        } else {
            throw new Error(`Invalid template: ${template}`);
        }

        // Get effective config (DB > .env)
        const cfg = await getEmailConfig();

        // ─── PRIMARY: Resend (works on Vercel) ───────────────────────
        if (cfg.resendApiKey) {
            console.log(`📧 Sending via Resend to ${to}...`);
            const resend = new Resend(cfg.resendApiKey);
            const { data: resendData, error } = await resend.emails.send({
                from: `${cfg.fromName} <${cfg.fromEmail}>`,
                to: [to],
                subject,
                html,
            });
            if (error) {
                console.error(`❌ Resend error for ${to}:`, error);
                return { success: false, error: error.message || JSON.stringify(error) };
            }
            console.log(`✅ Resend: Email sent to ${to}`, resendData?.id);
            return { success: true, messageId: resendData?.id };
        }

        // ─── FALLBACK: Nodemailer SMTP (local dev only) ──────────────
        if (!cfg.smtpUser || !cfg.smtpPass) {
            console.warn('⚠️ No RESEND_API_KEY or SMTP credentials. Skipping email.');
            return { success: false, message: 'Email not configured' };
        }
        console.log(`📧 Sending via SMTP to ${to} (local fallback)...`);
        const transporter = nodemailer.createTransport({
            host: cfg.smtpHost, port: cfg.smtpPort, secure: cfg.smtpSecure,
            auth: { user: cfg.smtpUser, pass: cfg.smtpPass },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 10000, socketTimeout: 20000,
        });
        const info = await transporter.sendMail({
            from: `"${cfg.fromName}" <${cfg.smtpUser}>`,
            to, subject, html,
        });
        console.log(`✅ SMTP: Email sent to ${to}`, info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error(`❌ sendEmail error for ${to}:`, error.message);
        return { success: false, error: error.message };
    }
};

// Send Bulk Emails (Parallel Batch Processing)
const sendBulkEmails = async (recipients, template, data) => {
    const results = {
        total: recipients.length,
        sent: 0,
        failed: 0,
        errors: []
    };

    // Use concurrency to avoid blocking but also avoid hitting SMTP rate limits too hard
    const BATCH_SIZE = 5;
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
        const batch = recipients.slice(i, i + BATCH_SIZE);

        const batchPromises = batch.map(recipient => sendEmail(recipient, template, data));
        const batchResults = await Promise.allSettled(batchPromises);

        batchResults.forEach((res, index) => {
            if (res.status === 'fulfilled' && res.value.success) {
                results.sent++;
            } else {
                results.failed++;
                const errorMsg = res.status === 'fulfilled' ? res.value.error : res.reason.message;
                results.errors.push({
                    email: batch[index],
                    error: errorMsg
                });
            }
        });

        // Small cooling delay between batches
        if (i + BATCH_SIZE < recipients.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    return results;
};

module.exports = {
    setSharedDb,
    sendEmail,
    sendBulkEmails,
    emailTemplates,
    getDbEmailConfig
};
