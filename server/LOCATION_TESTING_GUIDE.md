# SOS Location Testing Guide

## Overview
This guide helps you verify that location data (latitude/longitude) is properly sent from the frontend to the backend and saved in MongoDB.

---

## 🧪 Testing Steps

### 1. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd elderly-assistant
npm run dev
```

### 2. Open Developer Console
1. Open browser (Chrome/Edge/Firefox)
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Keep it open during testing

### 3. Navigate to Help Page
1. Go to `http://localhost:5173`
2. Login if needed
3. Click **"Help"** in navigation
4. You should see the SOS button

### 4. Test Location Sharing (Optional)
Before testing SOS, you can test location separately:
1. Click **"Share My Location"** button
2. Browser will ask for permission
3. Click **"Allow"**
4. You should see your coordinates displayed

### 5. Test SOS with Location

**Scenario A: Location Allowed**
1. Click the large **"SOS - EMERGENCY"** button
2. Browser asks for location permission
3. Click **"Allow"**
4. Wait for success message

**Expected Frontend Console Output:**
```
📤 Sending SOS alert with payload: {
  message: "Emergency! Need immediate assistance!",
  latitude: 40.7128,
  longitude: -74.0060,
  accuracy: 10
}
📍 Location data: Lat: 40.7128, Lng: -74.0060, Accuracy: 10m
✅ SOS alert sent successfully: { ... }
💾 Alert saved with location: { latitude: 40.7128, longitude: -74.0060, accuracy: 10 }
```

**Expected Backend Console Output:**
```
🚨 SOS ALERT TRIGGERED
📥 Received from user: John Doe (john@example.com)
📍 Location data received: { latitude: 40.7128, longitude: -74.0060, accuracy: 10 }
✅ Location will be saved: { latitude: 40.7128, longitude: -74.0060, accuracy: 10 }
💾 Alert saved to MongoDB with ID: 64abc123def456789
✅ SOS Alert created successfully
📊 Alert Summary:
   - ID: 64abc123def456789
   - User: John Doe
   - Message: Emergency! Need immediate assistance!
   - Location: 40.7128, -74.0060
   - Timestamp: 2024-10-28T10:30:00.000Z
─────────────────────────────────────────

Email alerts sent: 2 successful, 0 failed
SMS alerts sent: 2 successful, 0 failed
```

**Scenario B: Location Denied**
1. Click **"SOS - EMERGENCY"** button
2. Browser asks for location permission
3. Click **"Block"** or **"Deny"**
4. Should still send alert

**Expected Frontend Console Output:**
```
📤 Sending SOS alert with payload: {
  message: "Emergency! Need immediate assistance!",
  latitude: null,
  longitude: null,
  accuracy: null
}
📍 Location data: Location not available
✅ SOS alert sent successfully: { ... }
💾 Alert saved with location: { latitude: null, longitude: null, accuracy: null }
```

**Expected Backend Console Output:**
```
🚨 SOS ALERT TRIGGERED
📥 Received from user: John Doe (john@example.com)
📍 Location data received: { latitude: null, longitude: null, accuracy: null }
✅ Location will be saved: { latitude: null, longitude: null, accuracy: null }
💾 Alert saved to MongoDB with ID: 64abc123def456789
✅ SOS Alert created successfully
📊 Alert Summary:
   - ID: 64abc123def456789
   - User: John Doe
   - Message: Emergency! Need immediate assistance!
   - Location: Not provided
   - Timestamp: 2024-10-28T10:30:00.000Z
─────────────────────────────────────────
```

---

## 📊 Verify in MongoDB

### Option 1: MongoDB Compass (Recommended)
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Database: `elderly-assistant`
4. Collection: `sosalerts`
5. Find your alert by user ID or timestamp
6. Check the `location` field

**Expected Document (With Location):**
```json
{
  "_id": "64abc123def456789",
  "userId": "64user123",
  "message": "Emergency! Need immediate assistance!",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "accuracy": 10
  },
  "status": "active",
  "timestamp": "2024-10-28T10:30:00.000Z",
  "createdAt": "2024-10-28T10:30:00.000Z",
  "updatedAt": "2024-10-28T10:30:00.000Z"
}
```

**Expected Document (Without Location):**
```json
{
  "_id": "64abc123def456789",
  "userId": "64user123",
  "message": "Emergency! Need immediate assistance!",
  "location": {
    "latitude": null,
    "longitude": null,
    "accuracy": null
  },
  "status": "active",
  "timestamp": "2024-10-28T10:30:00.000Z",
  "createdAt": "2024-10-28T10:30:00.000Z",
  "updatedAt": "2024-10-28T10:30:00.000Z"
}
```

### Option 2: MongoDB Shell
```bash
mongosh
use elderly-assistant
db.sosalerts.find().sort({createdAt: -1}).limit(1).pretty()
```

### Option 3: Using Node Script
Create `server/check-sos-alerts.js`:
```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const SOSAlert = require('./models/SOSAlert');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB\n');
    
    const alerts = await SOSAlert.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email');
    
    console.log(`Found ${alerts.length} recent alerts:\n`);
    
    alerts.forEach((alert, index) => {
      console.log(`${index + 1}. Alert ID: ${alert._id}`);
      console.log(`   User: ${alert.userId.name}`);
      console.log(`   Message: ${alert.message}`);
      console.log(`   Location:`, alert.location ? 
        `${alert.location.latitude}, ${alert.location.longitude}` : 
        'Not provided'
      );
      console.log(`   Time: ${alert.createdAt}`);
      console.log('');
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
```

Run: `node server/check-sos-alerts.js`

---

## 🐛 Troubleshooting

### Issue: Location always null in database
**Check:**
1. Frontend console - does it show coordinates?
2. Backend console - does it log coordinates received?
3. Browser permissions - is location allowed?

**Solution:**
- If frontend shows coordinates but backend doesn't receive them:
  - Check network tab in DevTools
  - Verify payload in request body
- If browser doesn't ask for permission:
  - Clear site settings
  - Try different browser
  - Check browser location settings

### Issue: Location permission denied every time
**Solution:**
1. Chrome: Settings → Privacy → Site Settings → Location
2. Find `localhost:5173`
3. Change to "Allow"
4. Refresh page

### Issue: Coordinates not displayed correctly
**Verify:**
- Latitude: -90 to 90
- Longitude: -180 to 180
- If outside range, check geolocation API

### Issue: Backend doesn't log anything
**Check:**
1. Server is running: `npm run dev`
2. No errors in terminal
3. API URL correct: `http://localhost:5000/api/sos`
4. JWT token in localStorage

---

## ✅ Success Checklist

- [ ] Frontend console shows payload with coordinates
- [ ] Backend console shows received coordinates
- [ ] Backend console shows "Location will be saved"
- [ ] Backend console shows alert summary with location
- [ ] MongoDB document has location field with coordinates
- [ ] Success modal appears on frontend
- [ ] Email/SMS notifications sent (if configured)

---

## 📍 Understanding Coordinates

### Latitude (North/South)
- Range: -90 to 90
- Positive: North of equator
- Negative: South of equator
- Example: 40.7128 (New York)

### Longitude (East/West)
- Range: -180 to 180
- Positive: East of Prime Meridian
- Negative: West of Prime Meridian
- Example: -74.0060 (New York)

### Accuracy
- In meters
- Lower is better
- Typical values:
  - GPS: 5-10 meters
  - WiFi: 20-50 meters
  - Cell tower: 100-1000 meters

---

## 🔗 Google Maps Verification

To verify coordinates are correct:
```
https://www.google.com/maps?q=LATITUDE,LONGITUDE
```

Example:
```
https://www.google.com/maps?q=40.7128,-74.0060
```

Should show your actual location on the map!

---

## 📊 Sample Test Data

For manual testing without GPS:
```javascript
// In Help.jsx, you can temporarily hardcode:
const testLocation = {
  latitude: 40.7128,   // New York
  longitude: -74.0060,
  accuracy: 10
};

await sendSOSAlert(token, testLocation);
```

Other test locations:
- **London:** 51.5074, -0.1278
- **Tokyo:** 35.6762, 139.6503
- **Sydney:** -33.8688, 151.2093
- **Paris:** 48.8566, 2.3522

---

## 🎯 Next Steps

Once location is working:
1. ✅ Verify in MongoDB
2. ✅ Check email/SMS notifications include map links
3. ⏭️ Create SOS Dashboard to view alert history
4. ⏭️ Add map visualization for past alerts

---

## 📞 Common Questions

**Q: Why do I need location permission?**
A: For emergency services to find you quickly.

**Q: Can I send SOS without location?**
A: Yes! Alert still sent, just without coordinates.

**Q: Is my location tracked all the time?**
A: No! Only when you press SOS button.

**Q: Who can see my location?**
A: Only your emergency contacts, via email/SMS.

**Q: What if my phone has no GPS?**
A: It will use WiFi/cell tower location (less accurate).

---

You're all set! The location system is now working and fully logged for debugging. 🎉

