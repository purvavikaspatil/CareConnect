# Environment Variables Configuration

## Required Environment Variables for SOS Alert System

Add these variables to your `server/.env` file:

```env
# Email Configuration for SOS Alerts
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password

# SMS Configuration for SOS Alerts (Twilio)
TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH=your_twilio_auth_token
TWILIO_PHONE=+15551234567
```

---

## Gmail Setup Instructions

### 1. Enable 2-Step Verification
- Visit: https://myaccount.google.com/security
- Enable "2-Step Verification"

### 2. Generate App Password
- Visit: https://myaccount.google.com/apppasswords
- Select "Mail" as app
- Select "Other (Custom name)" as device
- Name: "Elderly Assistant"
- Click "Generate"
- Copy the 16-character password

### 3. Update .env
```env
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=abcdefghijklmnop  # Remove spaces from app password
```

---

## Complete .env File Example

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/elderly-assistant

# JWT Secret Key
JWT_SECRET=your-secret-key-here-change-in-production

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here

# SMS Configuration (Twilio)
TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH=your_twilio_auth_token
TWILIO_PHONE=+15551234567

# Server Configuration
PORT=5000
NODE_ENV=development
```

---

## Twilio SMS Setup Instructions

### 1. Create Twilio Account
- Visit: https://www.twilio.com/try-twilio
- Sign up (free trial with $15.50 credit)

### 2. Get Credentials
- Go to [Twilio Console](https://console.twilio.com/)
- Copy **Account SID** (starts with "AC...")
- Copy **Auth Token**

### 3. Get Phone Number
- Go to: Phone Numbers → Buy a number
- Select country and SMS capability
- Copy your number: `+15551234567`

### 4. Verify Test Numbers (Trial Only)
- Go to: Phone Numbers → Verified Caller IDs
- Add and verify recipient numbers

### 5. Update .env
```env
TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH=your_auth_token_here
TWILIO_PHONE=+15551234567
```

---

## Testing Configurations

### Test Email
Create `server/test-email.js`:

```javascript
require('dotenv').config();
const { sendEmail } = require('./utils/sendEmail');

async function test() {
  const result = await sendEmail(
    'test@example.com',
    'Test Email',
    'This is a test email.'
  );
  console.log(result);
}

test();
```

Run: `node server/test-email.js`

### Test SMS
Create `server/test-sms.js`:

```javascript
require('dotenv').config();
const { sendSMS } = require('./utils/sendSMS');

async function test() {
  const result = await sendSMS(
    '+15551234567',  // Your verified number
    'Test SMS from Elderly Assistant!'
  );
  console.log(result);
}

test();
```

Run: `node server/test-sms.js`

---

## Security Notes

⚠️ **Important:**
- Never commit `.env` file to git
- Use app-specific passwords, not your real password
- Keep credentials secure
- Rotate passwords periodically

✅ The `.env` file should already be in `.gitignore`

