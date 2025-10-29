require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const SOSAlert = require('./models/SOSAlert');

console.log('🔍 CHECKING RECENT SOS ALERTS\n');

async function checkAlerts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    const alerts = await SOSAlert.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email');

    console.log(`Found ${alerts.length} recent SOS alert(s)\n`);
    console.log('═'.repeat(60));

    if (alerts.length === 0) {
      console.log('\n❌ NO SOS ALERTS FOUND!\n');
      console.log('💡 This means the SOS button is not creating alerts.');
      console.log('   Check if:');
      console.log('   1. You are logged in');
      console.log('   2. The server is running');
      console.log('   3. Frontend is connected to backend');
      console.log('   4. Check browser console for errors\n');
    } else {
      alerts.forEach((alert, index) => {
        console.log(`\nAlert ${index + 1}:`);
        console.log(`├─ ID: ${alert._id}`);
        console.log(`├─ User: ${alert.userId?.name || 'Unknown'}`);
        console.log(`├─ Message: ${alert.message}`);
        console.log(`├─ Status: ${alert.status}`);
        console.log(`├─ Time: ${alert.timestamp || alert.createdAt}`);
        console.log(`└─ Location: ${alert.location && alert.location.latitude ? 
          `${alert.location.latitude}, ${alert.location.longitude}` : 
          'Not available'}`);
      });

      console.log('\n═'.repeat(60));
      console.log('\n✅ SOS alerts are being created in database!');
      console.log('\n💡 If SMS is not being sent, check:');
      console.log('   1. Server terminal for error messages');
      console.log('   2. Make sure server was restarted after adding Twilio credentials');
      console.log('   3. Check Twilio SMS logs: https://console.twilio.com/us1/monitor/logs/sms\n');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
}

checkAlerts();

