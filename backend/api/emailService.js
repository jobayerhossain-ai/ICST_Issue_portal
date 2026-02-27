const nodemailer = require('nodemailer');

// Keep a singleton transporter instance to reuse connections
let transporterInstance = null;

const createTransporter = () => {
    // If instance already exists, return it
    if (transporterInstance) return transporterInstance;

    const config = {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        pool: true, // Use SMTP connection pooling
        maxConnections: 5,
        maxMessages: 100,
        tls: {
            rejectUnauthorized: false
        },
        // Strict timeouts to avoid hanging serverless functions
        connectionTimeout: 10000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
        logger: process.env.EMAIL_DEBUG === 'true',
        debug: process.env.EMAIL_DEBUG === 'true'
    };

    console.log(`📡 Creating new SMTP transporter for ${config.host}:${config.port}`);
    transporterInstance = nodemailer.createTransport(config);
    return transporterInstance;
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
        // Check if email is configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.warn('⚠️ Email not configured. Skipping email send.');
            return { success: false, message: 'Email not configured' };
        }

        const transporter = createTransporter();

        // Verify connection once on first use
        if (!transporterInstance.verified) {
            try {
                await transporter.verify();
                transporterInstance.verified = true;
                console.log('✅ SMTP Connection verified');
            } catch (vErr) {
                console.error('❌ SMTP Verification failed:', vErr.message);
                // Continue anyway, it might work during send
            }
        }

        // Handle template lookup if a string name is provided
        let subject, html;
        if (typeof template === 'function') {
            const result = template(...(Array.isArray(data) ? data : [data]));
            subject = result.subject;
            html = result.html;
        } else if (typeof template === 'string' && emailTemplates[template]) {
            // Check if data is array or object and map accordingly
            const result = Array.isArray(data)
                ? emailTemplates[template](...data)
                : emailTemplates[template](data.subject, data.body);
            subject = result.subject;
            html = result.html;
        } else {
            throw new Error(`Invalid template identifier: ${template}`);
        }

        const mailOptions = {
            from: `"ICST Issue Portal" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            envelope: {
                from: process.env.EMAIL_USER, // Enforce strict envelope from
                to: to
            }
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email successfully sent to ${to}:`, info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ SMTP Error for ${to}:`, error.message);
        if (error.code === 'EAUTH') {
            console.error('Check your EMAIL_USER and EMAIL_PASSWORD in .env');
        }
        return { success: false, error: error.message };
    }
};

// Send Bulk Emails
const sendBulkEmails = async (recipients, template, data) => {
    const results = {
        total: recipients.length,
        sent: 0,
        failed: 0,
        errors: []
    };

    for (const recipient of recipients) {
        const result = await sendEmail(recipient, template, data);
        if (result.success) {
            results.sent++;
        } else {
            results.failed++;
            results.errors.push({ email: recipient, error: result.error });
        }

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
};

module.exports = {
    sendEmail,
    sendBulkEmails,
    emailTemplates
};
