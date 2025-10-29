require('dotenv').config();
const { sendEmail, sendSOSAlertEmails } = require('./utils/sendEmail');
const mongoose = require('mongoose');
const Contact = require('./models/Contact');

console.log('📧 TESTING EMAIL NOTIFICATIONS\n');
console.log('═'.repeat(60));

async function testEmail() {
  try {
    // Step 1: Verify email credentials
    console.log('\n📋 Step 1: Checking Email Configuration');
    console.log('─'.repeat(60));
    console.log(`EMAIL_USER: ${process.env.EMAIL_USER ? '✅ ' + process.env.EMAIL_USER : '❌ Missing'}`);
    console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ Configured' : '❌ Missing'}`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('\n❌ Email credentials not configured!');
      process.exit(1);
    }

    // Step 2: Test email connection
    console.log('\n📋 Step 2: Testing Email Connection');
    console.log('─'.repeat(60));
    console.log('⏳ Connecting to Gmail SMTP...');

    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();
    console.log('✅ Email connection successful!');

    // Step 3: Get contacts from database
    console.log('\n📋 Step 3: Getting Emergency Contacts');
    console.log('─'.repeat(60));
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    const contacts = await Contact.find({});
    console.log(`Found ${contacts.length} contact(s)`);

    if (contacts.length === 0) {
      console.log('\n⚠️  No contacts found in database');
      console.log('💡 Add contacts at: http://localhost:5173/contacts');
      await mongoose.connection.close();
      process.exit(0);
    }

    contacts.forEach((contact, index) => {
      console.log(`\n  Contact ${index + 1}:`);
      console.log(`  ├─ Name: ${contact.name}`);
      console.log(`  ├─ Email: ${contact.email || '❌ No email'}`);
      console.log(`  └─ Phone: ${contact.phone}`);
    });

    // Step 4: Send test email
    console.log('\n📋 Step 4: Sending Test Email');
    console.log('─'.repeat(60));

    const testAlertData = {
      userName: 'Harsh Ba',
      userEmail: 'harshband@gmail.com',
      location: {
        latitude: 12.8463043,
        longitude: 77.6650548,
        accuracy: 1467
      },
      message: '🧪 TEST EMAIL: This is a test notification to verify the email system is working!',
      timestamp: new Date().toLocaleString()
    };

    console.log('⏳ Sending email to emergency contacts...\n');

    const result = await sendSOSAlertEmails(contacts, testAlertData);

    console.log('\n📊 RESULTS:');
    console.log('─'.repeat(60));
    console.log(`Total contacts: ${result.totalContacts}`);
    console.log(`Emails sent: ${result.emailsSent}`);
    console.log(`Emails failed: ${result.emailsFailed}`);

    if (result.results) {
      console.log('\nDetailed Results:');
      result.results.forEach((res, index) => {
        console.log(`\n  Contact ${index + 1}: ${res.recipient}`);
        if (res.success) {
          console.log(`    ✅ SUCCESS - Message ID: ${res.messageId}`);
        } else {
          console.log(`    ❌ FAILED - Error: ${res.error}`);
        }
      });
    }

    if (result.emailsSent > 0) {
      console.log('\n\n🎉 SUCCESS! Email(s) sent successfully!');
      console.log('📧 Check the recipient inbox(es) for the email.');
      console.log('💡 Also check spam/junk folder if not in inbox.');
    } else {
      console.log('\n\n❌ No emails were sent successfully!');
      console.log('Check the errors above for details.');
    }

    console.log('\n' + '═'.repeat(60));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n💡 SOLUTION:');
      console.log('   1. Make sure 2-Step Verification is enabled in Google Account');
      console.log('   2. Generate a NEW App Password at: https://myaccount.google.com/apppasswords');
      console.log('   3. Use the app password (not your regular Gmail password)');
      console.log('   4. Update EMAIL_PASS in .env file');
    }

    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

testEmail();

