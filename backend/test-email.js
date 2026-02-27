const nodemailer = require('nodemailer');
require('dotenv').config({ path: './.env' });

async function testEmail() {
    console.log('Testing with user:', process.env.EMAIL_USER);
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 587,
        secure: false, // Use STARTTLS on port 587
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        // Adding debug/logger for more info
        debug: true,
        logger: true
    });

    try {
        console.log('Attempting to send test email...');
        const info = await transporter.sendMail({
            from: `"ICST Issue Portal" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'SMTP Diagnostic Test',
            text: 'If you are reading this, your SMTP settings are correct!',
            html: '<b>If you are reading this, your SMTP settings are correct!</b>'
        });
        console.log('✅ Success! Message ID:', info.messageId);
    } catch (err) {
        console.error('❌ SMTP Test Failed:', err);
    }
}

testEmail();
