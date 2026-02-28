const nodemailer = require('nodemailer');
require('dotenv').config({ path: 'c:/Users/jobayer/Documents/ICST_Issue_portal/backend/.env' });

const testEmail = async () => {
    console.log('--- Email Configuration ---');
    console.log('HOST:', process.env.EMAIL_HOST);
    console.log('PORT:', process.env.EMAIL_PORT);
    console.log('SECURE:', process.env.EMAIL_SECURE);
    console.log('USER:', process.env.EMAIL_USER);
    // don't log password

    const config = {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        },
        connectionTimeout: 10000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
        debug: true,
        logger: true
    };

    console.log('\n--- Attempting Connection ---');
    const transporter = nodemailer.createTransport(config);

    try {
        await transporter.verify();
        console.log('✅ SMTP Connection verified successfully!');

        console.log('\n--- Attempting to Send Test Email ---');
        const info = await transporter.sendMail({
            from: `"Test ICST" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // send to self
            subject: "Test Email from Debug Script",
            text: "If you receive this, the SMTP configuration is working correctly.",
            html: "<b>If you receive this, the SMTP configuration is working correctly.</b>"
        });

        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Connection or Send failed:');
        console.error(error);
    }
};

testEmail();
