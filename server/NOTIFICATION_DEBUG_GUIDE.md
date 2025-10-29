# 🔍 Notification System Debugging Guide

This guide will help you identify and fix issues with your SOS notification system (Email and SMS).

---

## 🚀 Quick Start - Run the Diagnostic Tool

I've created an automated diagnostic tool that will check everything for you:

```bash
cd server
node debug-notifications.js
```

This will check:
1. ✅ Environment variables configuration
2. ✅ Email connection (Gmail)
3. ✅ Twilio SMS connection
4. ✅ Emergency contacts in database
5. ✅ Send test notifications (optional)

---

## 🔧 Common Issues and Solutions

### Issue 1: Missing `.env` File

**Symptom:** 
- Diagnostic shows all variables as "❌ Missing"
- No `.env` file in `server/` directory

**Solution:**
1. Create a new file named `.env` in the `server/` folder
2. Add the following content:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/elderly-assistant

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password

# Twilio SMS Configuration
TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH=your_twilio_auth_token
TWILIO_PHONE=+15551234567

# Server Configuration
PORT=5000
NODE_ENV=development
```

---

### Issue 2: Gmail Email Not Working

**Symptom:**
- "Invalid login" or "Authentication failed"
- Emails not being sent

**Solution:**

#### Step 1: Enable 2-Step Verification
1. Go to: https://myaccount.google.com/security
2. Click on "2-Step Verification"
3. Follow the steps to enable it

#### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" as the app
3. Select "Other (Custom name)" as device
4. Name it "Elderly Assistant"
5. Click "Generate"
6. Copy the 16-character password (ignore spaces)

#### Step 3: Update .env
```env
EMAIL_USER=youractual@gmail.com
EMAIL_PASS=abcdefghijklmnop  # Your 16-char password WITHOUT spaces
```

#### Step 4: Test
```bash
node debug-notifications.js
```

**Alternative Email Providers:**

If Gmail doesn't work, you can use other providers:

<details>
<summary>Outlook/Hotmail</summary>

```javascript
// In utils/sendEmail.js, change the transporter to:
const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```
</details>

<details>
<summary>Yahoo Mail</summary>

```javascript
// In utils/sendEmail.js, change the transporter to:
const transporter = nodemailer.createTransporter({
  service: 'yahoo',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```
</details>

---

### Issue 3: Twilio SMS Not Working

**Symptom:**
- "Authentication failed" or "Invalid credentials"
- SMS not being sent

**Solution:**

#### Step 1: Create Twilio Account
1. Go to: https://www.twilio.com/try-twilio
2. Sign up (you get $15.50 free credit)
3. Verify your email and phone

#### Step 2: Get Account Credentials
1. Go to: https://console.twilio.com/
2. Find your **Account SID** (starts with "AC...")
3. Find your **Auth Token** (click "Show" to reveal)
4. Copy both

#### Step 3: Get a Phone Number
1. In Twilio Console, go to: **Phone Numbers** → **Buy a number**
2. Select your country
3. Make sure it has **SMS** capability
4. Buy the number (free on trial)
5. Copy your number in format: `+15551234567`

#### Step 4: Verify Test Numbers (Trial Accounts Only)
If you're on a free trial, you must verify recipient numbers:

1. Go to: **Phone Numbers** → **Verified Caller IDs**
2. Click "Add a new number"
3. Enter the phone number of your emergency contact
4. Verify it with the code sent via SMS

#### Step 5: Update .env
```env
TWILIO_SID=ACa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5
TWILIO_AUTH=1234567890abcdef1234567890abcdef
TWILIO_PHONE=+15551234567
```

⚠️ **Important:** 
- Phone numbers MUST be in E.164 format: `+[country code][number]`
- Example: `+15551234567` (US), `+447911123456` (UK), `+919876543210` (India)

#### Step 6: Test
```bash
node debug-notifications.js
```

---

### Issue 4: No Emergency Contacts

**Symptom:**
- "No contacts found" or "No contacts with email/phone"
- Diagnostic shows 0 contacts

**Solution:**

#### Add Contacts Through the App:
1. Start the frontend and backend:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   
   # Terminal 2 - Frontend
   cd elderly-assistant
   npm run dev
   ```

2. Open: http://localhost:5173
3. Login or Sign up
4. Go to **Contacts** page
5. Add at least one contact with:
   - Name
   - Relation (optional)
   - **Email** (for email notifications)
   - **Phone** (for SMS notifications, must include country code like +1234567890)

#### Verify Contacts in Database:
```bash
node debug-notifications.js
```

The tool will show all contacts and their notification methods.

---

### Issue 5: Contacts Missing Email or Phone

**Symptom:**
- Contacts exist but "0 with email" or "0 with phone"

**Solution:**

1. Go to Contacts page in the app
2. Edit each contact
3. Add valid email addresses (format: `user@example.com`)
4. Add valid phone numbers with country code (format: `+15551234567`)
5. Save changes

**Phone Number Format Examples:**
- USA: `+15551234567`
- UK: `+447911123456`
- India: `+919876543210`
- Canada: `+15551234567`

---

### Issue 6: Notifications Not Triggering During SOS

**Symptom:**
- SOS alert is created successfully
- But no emails or SMS received
- No errors shown

**Solution:**

#### Check Server Logs:
When you trigger an SOS alert, you should see logs like:

```
🚨 SOS ALERT TRIGGERED
📥 Received from user: John Doe (john@example.com)
📍 Location data received: { latitude: 40.7128, longitude: -74.0060 }
✅ Location will be saved
💾 Alert saved to MongoDB with ID: 64abc123...
Email alerts sent: 2 successful, 0 failed
SMS alerts sent: 2 successful, 0 failed
✅ SOS Alert created successfully
```

If you see errors in logs, they will tell you what's wrong.

#### Common Log Errors:

**"Twilio not configured. Skipping SMS."**
→ Add Twilio credentials to .env

**"No contacts with email addresses found"**
→ Add email addresses to your contacts

**"No contacts with phone numbers found"**
→ Add phone numbers to your contacts

**"Failed to send email to x@example.com: Invalid login"**
→ Check Gmail app password setup

**"Failed to send SMS to +15551234567: [20003] Authenticate"**
→ Check Twilio credentials

---

## 📊 Step-by-Step Debugging Process

### 1. Run Diagnostic
```bash
cd server
node debug-notifications.js
```

### 2. Check Each Component

| Component | Status | Action |
|-----------|--------|--------|
| EMAIL_USER | ❌ Missing | Add to .env |
| EMAIL_PASS | ❌ Missing | Generate Gmail App Password |
| TWILIO_SID | ❌ Missing | Get from Twilio Console |
| TWILIO_AUTH | ❌ Missing | Get from Twilio Console |
| TWILIO_PHONE | ❌ Missing | Buy Twilio number |
| Email Connection | ❌ Failed | Check Gmail setup |
| SMS Connection | ❌ Failed | Check Twilio setup |
| Contacts | ❌ None | Add via app |

### 3. Fix Issues One by One

Start with email OR SMS (you don't need both):

**Option A: Email Only**
1. Set up Gmail app password
2. Add EMAIL_USER and EMAIL_PASS to .env
3. Restart server
4. Run diagnostic
5. Send test

**Option B: SMS Only**
1. Create Twilio account
2. Get credentials and phone number
3. Add TWILIO_* variables to .env
4. Verify recipient numbers (trial accounts)
5. Restart server
6. Run diagnostic
7. Send test

**Option C: Both**
Do both Option A and Option B

### 4. Test with Real SOS Alert

1. Start both frontend and backend
2. Login to the app
3. Go to **Help** page
4. Click "🚨 SEND SOS"
5. Check your email inbox
6. Check your phone for SMS
7. Check server logs for confirmation

---

## 🧪 Manual Testing

### Test Email Only:
```bash
cd server
node -e "
require('dotenv').config();
const { sendEmail } = require('./utils/sendEmail');
sendEmail(
  'your-test-email@gmail.com',
  'Test from Elderly Assistant',
  'This is a test email'
).then(result => console.log(result));
"
```

### Test SMS Only:
```bash
cd server
node -e "
require('dotenv').config();
const { sendSMS } = require('./utils/sendSMS');
sendSMS(
  '+15551234567',  // Your verified phone number
  'Test SMS from Elderly Assistant'
).then(result => console.log(result));
"
```

---

## 📱 Testing SOS Flow

### Complete Test Procedure:

1. **Start Backend:**
   ```bash
   cd server
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd elderly-assistant
   npm run dev
   ```

3. **Prepare:**
   - Login to app
   - Add at least 1 contact with email AND/OR phone
   - Keep server terminal visible to see logs

4. **Trigger SOS:**
   - Go to Help page
   - Click "🚨 SEND SOS"
   - Allow location when prompted (or deny - both work)

5. **Verify:**
   - Check server logs for "Email alerts sent: X successful"
   - Check server logs for "SMS alerts sent: X successful"
   - Check your email inbox
   - Check your phone for SMS
   - Go to SOS Dashboard to see the alert

---

## ❓ FAQ

<details>
<summary><strong>Q: Do I need both email AND SMS?</strong></summary>

No! You can use just one:
- Email only: Set up EMAIL_USER and EMAIL_PASS
- SMS only: Set up TWILIO credentials
- Both: Set up both (recommended)

The system will use whatever is available.
</details>

<details>
<summary><strong>Q: Can I use a free Twilio account?</strong></summary>

Yes! The free trial includes:
- $15.50 credit
- 1 free phone number
- Can send SMS to verified numbers only
- Must verify recipient numbers first

To send to ANY number without verification, upgrade to paid account.
</details>

<details>
<summary><strong>Q: Why aren't my contacts receiving notifications?</strong></summary>

Check:
1. Contacts have valid email/phone in database
2. Email/SMS credentials are correct in .env
3. Server is running and showing logs
4. Gmail app password is generated (not regular password)
5. Twilio recipient numbers are verified (free trial)
6. Server logs don't show errors
</details>

<details>
<summary><strong>Q: How do I know if notifications were sent?</strong></summary>

Check the server terminal logs:
```
Email alerts sent: 2 successful, 0 failed
SMS alerts sent: 2 successful, 0 failed
```

Or run the diagnostic tool with test mode:
```bash
node debug-notifications.js
# Answer "yes" when asked to send test notifications
```
</details>

<details>
<summary><strong>Q: Can I use my own SMTP server instead of Gmail?</strong></summary>

Yes! Edit `server/utils/sendEmail.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.yourdomain.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```
</details>

---

## 🆘 Still Having Issues?

If nothing works:

1. **Check server is actually running:**
   ```bash
   curl http://localhost:5000
   ```

2. **Check MongoDB is connected:**
   - Server logs should show "MongoDB Connected Successfully"

3. **Check .env file exists and is in the right place:**
   ```bash
   ls -la server/.env
   ```

4. **Restart everything:**
   ```bash
   # Stop all terminals (Ctrl+C)
   # Then restart:
   cd server
   npm run dev
   ```

5. **Check for typos in .env:**
   - No quotes around values
   - No spaces around = sign
   - Correct variable names (case-sensitive)

6. **Run diagnostic with verbose output:**
   ```bash
   node debug-notifications.js 2>&1 | tee debug-output.txt
   ```
   This saves all output to a file you can review.

---

## ✅ Success Checklist

When everything works, you should have:

- [x] .env file exists in server/ directory
- [x] EMAIL_USER and EMAIL_PASS configured (if using email)
- [x] TWILIO_SID, TWILIO_AUTH, TWILIO_PHONE configured (if using SMS)
- [x] At least 1 contact added with email/phone
- [x] Diagnostic tool shows all green checkmarks
- [x] Test notifications received successfully
- [x] Real SOS alert sends notifications
- [x] Server logs show "X successful, 0 failed"

---

## 📚 Related Documentation

- `ENV_CONFIGURATION.md` - Environment setup
- `EMAIL_SETUP_GUIDE.md` - Gmail configuration
- `TWILIO_SETUP_INSTRUCTIONS.md` - Twilio setup
- `SOS_API_DOCUMENTATION.md` - API reference

---

**Happy Debugging! 🎉**

If you need help, run the diagnostic tool first - it will tell you exactly what's wrong and how to fix it.

