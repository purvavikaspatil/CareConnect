require('dotenv').config();
const mongoose = require('mongoose');
const Contact = require('./models/Contact');
const { sendSOSAlertSMS } = require('./utils/sendSMS');

console.log('🧪 TESTING FULL SMS FLOW\n');
console.log('═'.repeat(60));

async function testFullFlow() {
  try {
    // Check environment
    console.log('\n📋 Step 1: Checking Twilio Configuration');
    console.log('─'.repeat(60));
    console.log(`TWILIO_SID: ${process.env.TWILIO_SID ? '✅ ' + process.env.TWILIO_SID : '❌ Missing'}`);
    console.log(`TWILIO_AUTH: ${process.env.TWILIO_AUTH ? '✅ Configured' : '❌ Missing'}`);
    console.log(`TWILIO_PHONE: ${process.env.TWILIO_PHONE ? '✅ ' + process.env.TWILIO_PHONE : '❌ Missing'}`);

    // Connect to DB
    console.log('\n📋 Step 2: Connecting to Database');
    console.log('─'.repeat(60));
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Get contacts
    console.log('\n📋 Step 3: Fetching Emergency Contacts');
    console.log('─'.repeat(60));
    const contacts = await Contact.find({});
    console.log(`Found ${contacts.length} contact(s)`);

    if (contacts.length === 0) {
      console.log('\n❌ No contacts found!');
      console.log('💡 Add contacts at: http://localhost:5173/contacts');
      await mongoose.connection.close();
      process.exit(1);
    }

    contacts.forEach((contact, index) => {
      console.log(`\nContact ${index + 1}:`);
      console.log(`  Name: ${contact.name}`);
      console.log(`  Phone: ${contact.phone}`);
      console.log(`  Email: ${contact.email}`);
    });

    // Prepare test alert data
    const testAlertData = {
      userName: 'Harsh Ba',
      userEmail: 'harshband@gmail.com',
      location: {
        latitude: 12.8463043,
        longitude: 77.6650548,
        accuracy: 1467
      },
      message: 'TEST: This is a manual SMS test to verify the notification system is working!',
      timestamp: new Date().toLocaleString()
    };

    // Send SMS
    console.log('\n📋 Step 4: Sending SMS to Contacts');
    console.log('─'.repeat(60));
    console.log('⏳ Sending SMS...\n');

    const result = await sendSOSAlertSMS(contacts, testAlertData);

    console.log('\n📊 RESULTS:');
    console.log('─'.repeat(60));
    console.log(`Total contacts: ${result.totalContacts}`);
    console.log(`SMS sent successfully: ${result.smsSent}`);
    console.log(`SMS failed: ${result.smsFailed}`);

    if (result.results) {
      console.log('\nDetailed Results:');
      result.results.forEach((res, index) => {
        console.log(`\n  Contact ${index + 1}: ${res.recipient}`);
        if (res.success) {
          console.log(`    ✅ SUCCESS - Message ID: ${res.messageId}`);
          console.log(`    Status: ${res.status}`);
        } else {
          console.log(`    ❌ FAILED - Error: ${res.error}`);
        }
      });
    }

    if (result.smsSent > 0) {
      console.log('\n\n🎉 SUCCESS! SMS sent successfully!');
      console.log('📱 Check the recipient phone(s) for the SMS within 30-60 seconds.');
    } else {
      console.log('\n\n❌ No SMS were sent successfully!');
      console.log('\n💡 Check the errors above for details.');
    }

    console.log('\n' + '═'.repeat(60));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

testFullFlow();

