# 🚨 Test Your SOS Alert System - Quick Guide

## ✅ Setup Complete! Now Let's Test It

---

## 🎯 QUICK TEST (5 Minutes)

### Step 1: Make Sure Server is Running

If your server isn't running, start it:

```bash
cd server
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB Connected Successfully
```

### Step 2: Start Frontend (if not running)

```bash
cd elderly-assistant
npm run dev
```

### Step 3: Update Emergency Contact

1. Open: **http://localhost:5173**
2. Login with your account
3. Click **"Contacts"** in the navigation bar
4. Click **"Edit"** on your emergency contact
5. Update the phone number to one of your verified numbers:
   - `+918529596981`
   - `+919646787567`
   - `+917499461772`
   - `+919145291452`
   - `+918530976939`
6. Click **"Save"**

### Step 4: Trigger SOS Alert

1. Click **"Help"** in the navigation bar
2. Click the big **"🚨 SEND SOS"** button
3. When browser asks for location permission:
   - Click "Allow" (preferred) OR
   - Click "Block" (will still work without location)
4. You should see success message: "SOS alert sent successfully!"

### Step 5: Check for SMS

Within 30-60 seconds:
- ✅ Emergency contact should receive SMS
- ✅ Check server terminal for: "SMS alerts sent: 1 successful, 0 failed"
- ✅ SMS will contain location and Google Maps link

### Step 6: View Alert History

1. Click **"SOS Dashboard"** in navigation
2. You should see your alert with:
   - Timestamp
   - Location (if you allowed it)
   - Status: Active
   - Google Maps link

---

## 📱 What the SMS Looks Like

Your emergency contact will receive:

```
Sent from your Twilio trial account - 🚨 EMERGENCY ALERT!

[Your Name] has triggered an SOS alert.

Emergency assistance needed immediately!

Location: 40.7128, -74.0060
Map: https://maps.google.com/?q=40.7128,-74.0060

Time: 10/28/2025, 3:22:14 PM

Please check on them immediately or contact emergency services if needed.
```

---

## ✅ Success Indicators

**In Server Terminal:**
```
🚨 SOS ALERT TRIGGERED
📥 Received from user: [Your Name]
📍 Location data received: { latitude: ..., longitude: ... }
✅ Location will be saved
💾 Alert saved to MongoDB with ID: ...
SMS alerts sent: 1 successful, 0 failed
✅ SOS Alert created successfully
```

**On Phone:**
- 📱 SMS received within 60 seconds
- Contains emergency alert message
- Has location and map link
- Shows timestamp

**In App:**
- ✅ Success message appears
- ✅ Alert visible in SOS Dashboard
- ✅ Can click map link to see location

---

## 🔧 If Something Goes Wrong

### No SMS Received?

**Check Server Logs:**
- Look for "SMS alerts sent: X successful"
- If it says "0 successful", check errors below

**Common Issues:**

1. **"No contacts with phone numbers found"**
   - Go to Contacts page
   - Make sure phone number is saved
   - Use format: +918529596981

2. **"To number is not verified"**
   - That number must be verified in Twilio Console
   - Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
   - Verify the number

3. **"Invalid phone number format"**
   - Must start with +91
   - No spaces or dashes
   - Example: +918529596981

4. **"Twilio not configured"**
   - Check .env file has TWILIO_SID, TWILIO_AUTH, TWILIO_PHONE
   - Restart server

### Server Not Showing Logs?

Make sure you're watching the server terminal where you ran `npm run dev`

### Contact Not Receiving?

1. Check contact phone format in app (+918529596981)
2. Verify that number in Twilio Console
3. Wait 2-3 minutes (sometimes delayed)
4. Check spam/blocked messages on phone
5. Check Twilio SMS logs: https://console.twilio.com/us1/monitor/logs/sms

---

## 🎯 Test with Multiple Contacts

Want to test with multiple emergency contacts?

1. Go to Contacts page
2. Add more contacts
3. Use your other verified numbers:
   - +919646787567
   - +917499461772
   - +919145291452
   - +918530976939
4. Trigger SOS again
5. All contacts should receive SMS!

---

## 📊 Monitor in Real-Time

### Watch Server Terminal
Keep server terminal visible to see real-time logs when SOS is triggered.

### Check Twilio Console
Open: https://console.twilio.com/us1/monitor/logs/sms
- See all SMS sent
- Check delivery status
- View any errors

### Check SOS Dashboard
Go to: http://localhost:5173/sos-dashboard
- View all past alerts
- See locations on map
- Track alert history

---

## 🎉 Next Steps After Successful Test

### 1. Add More Contacts
Add family members, caregivers, neighbors who should be notified

### 2. Set Up Email Notifications
For redundancy, add email notifications too:
- Read: `SETUP_EMAIL_QUICK.md`
- Takes 5 minutes
- Completely free

### 3. Upgrade Twilio (Optional)
Remove trial restrictions:
- Send to any number
- Remove "trial account" prefix
- Add credit card (pay-as-you-go)

### 4. Deploy the App
Make it available online:
- Deploy backend to Railway/Render
- Deploy frontend to Vercel/Netlify
- Share with family members

---

## ✅ Final Checklist

- [ ] Server is running
- [ ] Frontend is running
- [ ] Updated contact phone number (with +91)
- [ ] Triggered SOS alert
- [ ] Received SMS on phone
- [ ] Saw success logs in server terminal
- [ ] Viewed alert in SOS Dashboard

---

**🎊 Congratulations! Your SOS notification system is working!** 🎊

Now elderly family members can trigger emergency alerts and all contacts will be notified immediately via SMS!

