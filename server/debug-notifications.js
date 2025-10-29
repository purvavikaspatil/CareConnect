require('dotenv').config();
const mongoose = require('mongoose');
const Contact = require('./models/Contact');
const { sendEmail, sendSOSAlertEmails } = require('./utils/sendEmail');
const { sendSMS, sendSOSAlertSMS } = require('./utils/sendSMS');

console.log('🔍 NOTIFICATION SYSTEM DEBUGGER\n');
console.log('═'.repeat(60));

// Step 1: Check Environment Variables
console.log('\n📋 STEP 1: Checking Environment Variables');
console.log('─'.repeat(60));

const envChecks = {
  'MONGODB_URI': process.env.MONGODB_URI ? '✅ Configured' : '❌ Missing',
  'EMAIL_USER': process.env.EMAIL_USER ? '✅ Configured' : '❌ Missing',
  'EMAIL_PASS': process.env.EMAIL_PASS ? '✅ Configured' : '❌ Missing',
  'TWILIO_SID': process.env.TWILIO_SID ? '✅ Configured' : '❌ Missing',
  'TWILIO_AUTH': process.env.TWILIO_AUTH ? '✅ Configured' : '❌ Missing',
  'TWILIO_PHONE': process.env.TWILIO_PHONE ? '✅ Configured' : '❌ Missing',
};

Object.entries(envChecks).forEach(([key, status]) => {
  console.log(`${key}: ${status}`);
});

// Check if values are just placeholders
if (process.env.EMAIL_USER) {
  const isPlaceholder = 
    process.env.EMAIL_USER.includes('your-email') ||
    process.env.EMAIL_USER.includes('example.com');
  if (isPlaceholder) {
    console.log('\n⚠️  WARNING: EMAIL_USER appears to be a placeholder!');
  }
}

if (process.env.TWILIO_PHONE) {
  const isPlaceholder = 
    process.env.TWILIO_PHONE.includes('15551234567') ||
    !process.env.TWILIO_PHONE.startsWith('+');
  if (isPlaceholder) {
    console.log('\n⚠️  WARNING: TWILIO_PHONE appears to be a placeholder or invalid format!');
  }
}

// Step 2: Test Email Connection
async function testEmailConnection() {
  console.log('\n\n📧 STEP 2: Testing Email Connection');
  console.log('─'.repeat(60));

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email credentials not configured. Skipping test.');
    return false;
  }

  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log('⏳ Verifying email connection...');
    await transporter.verify();
    console.log('✅ Email connection successful!');
    console.log(`   Using: ${process.env.EMAIL_USER}`);
    return true;
  } catch (error) {
    console.log('❌ Email connection failed!');
    console.log(`   Error: ${error.message}`);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n💡 Solution:');
      console.log('   1. Enable 2-Step Verification in your Google Account');
      console.log('   2. Generate an App Password at: https://myaccount.google.com/apppasswords');
      console.log('   3. Use the 16-character app password (without spaces) in EMAIL_PASS');
    }
    return false;
  }
}

// Step 3: Test Twilio Connection
async function testTwilioConnection() {
  console.log('\n\n📱 STEP 3: Testing Twilio Connection');
  console.log('─'.repeat(60));

  if (!process.env.TWILIO_SID || !process.env.TWILIO_AUTH || !process.env.TWILIO_PHONE) {
    console.log('❌ Twilio credentials not configured. Skipping test.');
    return false;
  }

  try {
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

    console.log('⏳ Verifying Twilio account...');
    const account = await client.api.accounts(process.env.TWILIO_SID).fetch();
    console.log('✅ Twilio connection successful!');
    console.log(`   Account SID: ${account.sid}`);
    console.log(`   Status: ${account.status}`);
    console.log(`   From Number: ${process.env.TWILIO_PHONE}`);
    return true;
  } catch (error) {
    console.log('❌ Twilio connection failed!');
    console.log(`   Error: ${error.message}`);
    
    if (error.code === 20003) {
      console.log('\n💡 Solution:');
      console.log('   1. Check your TWILIO_AUTH token is correct');
      console.log('   2. Visit: https://console.twilio.com/');
      console.log('   3. Copy Account SID and Auth Token');
    }
    return false;
  }
}

// Step 4: Check Database and Contacts
async function checkContacts() {
  console.log('\n\n👥 STEP 4: Checking Emergency Contacts in Database');
  console.log('─'.repeat(60));

  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    const contacts = await Contact.find({});
    console.log(`\nFound ${contacts.length} total contacts in database`);

    if (contacts.length === 0) {
      console.log('\n⚠️  No contacts found!');
      console.log('💡 Add contacts through the app at: http://localhost:5173/contacts');
      return false;
    }

    // Group by user
    const userContacts = {};
    contacts.forEach(contact => {
      const userId = contact.userId.toString();
      if (!userContacts[userId]) {
        userContacts[userId] = [];
      }
      userContacts[userId].push(contact);
    });

    console.log(`\nContacts by user:`);
    Object.entries(userContacts).forEach(([userId, userContactList]) => {
      console.log(`\n  User ID: ${userId}`);
      console.log(`  Total contacts: ${userContactList.length}`);
      
      userContactList.forEach((contact, index) => {
        console.log(`\n    Contact ${index + 1}:`);
        console.log(`      Name: ${contact.name}`);
        console.log(`      Relation: ${contact.relation || 'N/A'}`);
        console.log(`      Email: ${contact.email || '❌ Not provided'}`);
        console.log(`      Phone: ${contact.phone || '❌ Not provided'}`);
      });
    });

    // Check for valid notification methods
    const contactsWithEmail = contacts.filter(c => c.email && c.email.trim() !== '');
    const contactsWithPhone = contacts.filter(c => c.phone && c.phone.trim() !== '');

    console.log('\n📊 Summary:');
    console.log(`  Contacts with email: ${contactsWithEmail.length}`);
    console.log(`  Contacts with phone: ${contactsWithPhone.length}`);

    if (contactsWithEmail.length === 0 && contactsWithPhone.length === 0) {
      console.log('\n⚠️  No contacts have email or phone numbers!');
      console.log('💡 Update your contacts to include valid email addresses or phone numbers.');
      return false;
    }

    return true;
  } catch (error) {
    console.log('❌ Database check failed!');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Step 5: Send Test Notifications
async function sendTestNotifications() {
  console.log('\n\n🧪 STEP 5: Sending Test Notifications');
  console.log('─'.repeat(60));

  try {
    // Get first user with contacts
    const contacts = await Contact.find({}).limit(3);
    
    if (contacts.length === 0) {
      console.log('⚠️  No contacts available for testing');
      return;
    }

    console.log(`\nTesting with ${contacts.length} contact(s)...`);

    const testAlertData = {
      userName: 'Test User',
      userEmail: 'testuser@example.com',
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10
      },
      message: 'This is a TEST notification from the debugging script',
      timestamp: new Date().toLocaleString()
    };

    // Test Email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      console.log('\n📧 Testing Email Notifications...');
      try {
        const emailResult = await sendSOSAlertEmails(contacts, testAlertData);
        console.log(`   ✅ Email test complete:`);
        console.log(`      Sent: ${emailResult.emailsSent}`);
        console.log(`      Failed: ${emailResult.emailsFailed}`);
      } catch (error) {
        console.log(`   ❌ Email test failed: ${error.message}`);
      }
    } else {
      console.log('\n📧 Email: Skipped (not configured)');
    }

    // Test SMS
    if (process.env.TWILIO_SID && process.env.TWILIO_AUTH && process.env.TWILIO_PHONE) {
      console.log('\n📱 Testing SMS Notifications...');
      try {
        const smsResult = await sendSOSAlertSMS(contacts, testAlertData);
        console.log(`   ✅ SMS test complete:`);
        console.log(`      Sent: ${smsResult.smsSent}`);
        console.log(`      Failed: ${smsResult.smsFailed}`);
      } catch (error) {
        console.log(`   ❌ SMS test failed: ${error.message}`);
      }
    } else {
      console.log('\n📱 SMS: Skipped (not configured)');
    }

  } catch (error) {
    console.log('❌ Test notification failed!');
    console.log(`   Error: ${error.message}`);
  }
}

// Main execution
async function runDiagnostics() {
  try {
    const emailOk = await testEmailConnection();
    const twilioOk = await testTwilioConnection();
    const contactsOk = await checkContacts();

    if (contactsOk) {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      readline.question('\n\n❓ Would you like to send TEST notifications? (yes/no): ', async (answer) => {
        if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
          await sendTestNotifications();
        }

        console.log('\n\n' + '═'.repeat(60));
        console.log('🏁 DIAGNOSTIC COMPLETE');
        console.log('═'.repeat(60));

        console.log('\n📊 FINAL SUMMARY:');
        console.log(`  Email System: ${emailOk ? '✅ Working' : '❌ Not configured/Failed'}`);
        console.log(`  SMS System: ${twilioOk ? '✅ Working' : '❌ Not configured/Failed'}`);
        console.log(`  Contacts: ${contactsOk ? '✅ Available' : '❌ None found'}`);

        if (!emailOk || !twilioOk || !contactsOk) {
          console.log('\n\n📖 NEXT STEPS:');
          
          if (!emailOk) {
            console.log('\n  📧 To fix EMAIL notifications:');
            console.log('     1. Check server/ENV_CONFIGURATION.md');
            console.log('     2. Set up Gmail App Password');
            console.log('     3. Update .env file with EMAIL_USER and EMAIL_PASS');
          }
          
          if (!twilioOk) {
            console.log('\n  📱 To fix SMS notifications:');
            console.log('     1. Check server/TWILIO_SETUP_INSTRUCTIONS.md');
            console.log('     2. Create Twilio account at https://www.twilio.com');
            console.log('     3. Update .env file with TWILIO_SID, TWILIO_AUTH, TWILIO_PHONE');
          }
          
          if (!contactsOk) {
            console.log('\n  👥 To add emergency contacts:');
            console.log('     1. Start the app (npm run dev)');
            console.log('     2. Login to http://localhost:5173');
            console.log('     3. Go to Contacts page and add contacts with email/phone');
          }
        } else {
          console.log('\n✅ All systems are configured and working!');
          console.log('   Trigger an SOS alert to test the full flow.');
        }

        console.log('\n');
        await mongoose.connection.close();
        readline.close();
        process.exit(0);
      });
    } else {
      console.log('\n\n' + '═'.repeat(60));
      console.log('🏁 DIAGNOSTIC COMPLETE');
      console.log('═'.repeat(60));
      console.log('\n⚠️  Add contacts before testing notifications');
      await mongoose.connection.close();
      process.exit(0);
    }

  } catch (error) {
    console.error('\n❌ Diagnostic failed:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run diagnostics
runDiagnostics();

