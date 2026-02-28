const { sendEmail, sendBulkEmails } = require('./api/emailService');
require('dotenv').config();

const testService = async () => {
    console.log('--- Testing Optimized Email Service ---');

    // Test 1: Single Email
    console.log('\nTesting Single Email (Diagnostic)...');
    try {
        const singleResult = await sendEmail("jobayerhossain0@gmail.com", 'welcome', ["Test User"]);
        console.log('Single Email Result:', singleResult);
    } catch (e) {
        console.log('Single Email Caught Error:', e.message);
    }

    // Test 2: Bulk Email (Parallel)
    console.log('\nTesting Bulk Email (Parallel Batching)...');
    const recipients = [
        "jobayerhossain0@gmail.com",
        "test1@devorica.com",
        "test2@devorica.com",
        "test3@devorica.com",
        "test4@devorica.com",
        "test5@devorica.com",
        "test6@devorica.com"
    ];

    console.log(`Sending to ${recipients.length} recipients in batches of 5...`);
    console.time('BulkSendTime');
    try {
        const bulkResult = await sendBulkEmails(recipients, 'bulkEmail', {
            subject: "Unit Test: Parallel Sending",
            body: "This is a test of the new parallel batching logic (Batch Size 5)."
        });
        console.timeEnd('BulkSendTime');

        console.log('\nBulk Email Result Summary:');
        console.log(`Sent: ${bulkResult.sent}`);
        console.log(`Failed: ${bulkResult.failed}`);
        if (bulkResult.errors.length > 0) {
            console.log('Sample Error (EXPECTED TIMEOUTS):', bulkResult.errors[0].error);
        }
    } catch (e) {
        console.log('Bulk Email Caught Error:', e.message);
    }
};

testService();
