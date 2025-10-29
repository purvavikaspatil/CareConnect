require('dotenv').config();
const mongoose = require('mongoose');
const SOSAlert = require('./models/SOSAlert');

/**
 * Quick script to check recent SOS alerts and verify location data
 * 
 * Usage: node server/check-sos-alerts.js
 */

async function checkAlerts() {
  try {
    console.log('🔍 Connecting to MongoDB...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const alerts = await SOSAlert.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email');
    
    if (alerts.length === 0) {
      console.log('📭 No SOS alerts found in database\n');
      process.exit(0);
    }
    
    console.log(`📊 Found ${alerts.length} recent SOS alerts:\n`);
    console.log('═════════════════════════════════════════════════════════════\n');
    
    alerts.forEach((alert, index) => {
      console.log(`${index + 1}. 🚨 Alert ID: ${alert._id}`);
      console.log(`   👤 User: ${alert.userId ? alert.userId.name : 'Unknown'} (${alert.userId ? alert.userId.email : 'N/A'})`);
      console.log(`   💬 Message: ${alert.message}`);
      console.log(`   📅 Time: ${alert.createdAt.toLocaleString()}`);
      console.log(`   🔖 Status: ${alert.status}`);
      
      if (alert.location) {
        if (alert.location.latitude && alert.location.longitude) {
          console.log(`   📍 Location: ${alert.location.latitude}, ${alert.location.longitude}`);
          if (alert.location.accuracy) {
            console.log(`   📏 Accuracy: ${alert.location.accuracy} meters`);
          }
          console.log(`   🗺️  Map: https://www.google.com/maps?q=${alert.location.latitude},${alert.location.longitude}`);
        } else {
          console.log(`   📍 Location: Not provided (null)`);
        }
      } else {
        console.log(`   📍 Location: No location field`);
      }
      
      console.log('─────────────────────────────────────────────────────────────');
    });
    
    console.log('\n✅ Done!\n');
    
    // Statistics
    const alertsWithLocation = alerts.filter(a => 
      a.location && a.location.latitude !== null && a.location.longitude !== null
    ).length;
    
    console.log('📈 Statistics:');
    console.log(`   Total alerts: ${alerts.length}`);
    console.log(`   With location: ${alertsWithLocation}`);
    console.log(`   Without location: ${alerts.length - alertsWithLocation}`);
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAlerts();

