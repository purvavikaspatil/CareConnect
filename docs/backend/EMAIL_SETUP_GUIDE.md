# Email Alert System Setup Guide

## Overview
The SOS alert system automatically sends email notifications to all emergency contacts when an alert is triggered.

---

## 📧 Email Configuration

### Environment Variables Required

Add these to your `server/.env` file:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
```

---

## 🔧 Gmail Setup (Recommended)

### Step 1: Enable 2-Step Verification
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Find "2-Step Verification"
3. Click "Get Started" and follow instructions

### Step 2: Create App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" as the app
3. Select "Other (Custom name)" as the device
4. Name it "Elderly Assistant"
5. Click "Generate"
6. Copy the 16-character password (spaces will be removed automatically)

### Step 3: Update .env File
```env
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop  # The 16-character app password
```

**Note:** Remove spaces from the app password when pasting into .env

---

## 📨 Email Content

When an SOS alert is triggered, the system sends an email with:

### Subject
```
🚨 Emergency Alert from Elderly Assistant
```

### Plain Text Content
```
EMERGENCY ALERT!

[User Name] has triggered an emergency alert.

Emergency assistance needed immediately!

Latitude: 40.7128, Longitude: -74.0060

View location on map: https://www.google.com/maps?q=40.7128,-74.0060

Time: 10/28/2024, 2:30:00 PM

Please check on them immediately or contact emergency services if needed.
```

### HTML Content
- Professional styled email with red header
- Emergency alert box
- User name and timestamp
- Location information with Google Maps link
- Call-to-action buttons
- Clear instructions for recipients

---

## 🔄 How It Works

### Flow Diagram
```
1. User presses SOS button
2. Frontend sends POST to /api/sos
3. Backend creates SOS alert in MongoDB
4. Backend fetches user's emergency contacts
5. For each contact with email:
   - Send alert email via Nodemailer
   - Log success/failure
6. Return success to frontend
```

### Code Example

**SOS Routes (`server/routes/sosRoutes.js`):**
```javascript
// After saving SOS alert
const contacts = await Contact.find({ userId: req.user.id });

const emailAlertData = {
  userName: req.user.name,
  userEmail: req.user.email,
  location: sosAlert.location,
  message: sosAlert.message,
  timestamp: sosAlert.timestamp
};

sendSOSAlertEmails(contacts, emailAlertData);
```

---

## ⚠️ Error Handling

### Graceful Degradation
- Email failures do **NOT** prevent SOS alert creation
- Alerts are saved to database even if emails fail
- Failed emails are logged to console
- Success is still returned to frontend

### Error Scenarios Handled

1. **No EMAIL_USER or EMAIL_PASS set**
   - Logs error but continues
   - SOS alert still saved

2. **No contacts with email addresses**
   - Logs "No contacts with email"
   - SOS alert still saved

3. **Invalid email address**
   - Skips that contact
   - Continues with other contacts

4. **SMTP connection failure**
   - Logs specific error
   - SOS alert still saved

5. **Gmail authentication error**
   - Check app password is correct
   - Verify 2-step verification enabled

---

## 🧪 Testing

### 1. Test Email Configuration

Create a test script `server/test-email.js`:
```javascript
require('dotenv').config();
const { sendEmail } = require('./utils/sendEmail');

async function testEmail() {
  const result = await sendEmail(
    'test-recipient@example.com',
    'Test Email from Elderly Assistant',
    'This is a test email to verify email configuration.',
    '<h1>Test Email</h1><p>Configuration is working!</p>'
  );
  
  console.log('Result:', result);
}

testEmail();
```

Run test:
```bash
node server/test-email.js
```

### 2. Test SOS Alert with Email

1. Add emergency contacts with email addresses
2. Trigger SOS alert from Help page
3. Check server logs for email status
4. Verify emails received by contacts

### 3. Check Server Logs

After triggering SOS alert, look for:
```
Email sent successfully to contact@example.com: <message-id>
Email alerts sent: 2 successful, 0 failed
```

---

## 🔐 Security Best Practices

### Do NOT
- ❌ Commit `.env` file to git
- ❌ Use your personal email password
- ❌ Share app passwords publicly
- ❌ Hardcode credentials in code

### Do
- ✅ Use app-specific passwords
- ✅ Keep `.env` in `.gitignore`
- ✅ Use environment variables
- ✅ Rotate passwords periodically
- ✅ Use different credentials for production

---

## 🌐 Alternative Email Services

### Outlook/Hotmail

```javascript
// In server/utils/sendEmail.js
const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

### Yahoo Mail

```javascript
const transporter = nodemailer.createTransport({
  service: 'yahoo',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

### Custom SMTP Server

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

---

## 📊 Email Statistics

The email system returns statistics:

```javascript
{
  success: true,
  emailsSent: 3,        // Successfully sent
  emailsFailed: 1,      // Failed to send
  totalContacts: 4,     // Total contacts with email
  results: [            // Detailed results
    {
      success: true,
      messageId: '<abc123@gmail.com>',
      recipient: 'contact1@example.com'
    },
    // ... more results
  ]
}
```

---

## 🐛 Troubleshooting

### "Invalid login" error
**Solution:** 
- Verify 2-step verification is enabled
- Regenerate app password
- Check EMAIL_USER is correct
- Ensure no spaces in EMAIL_PASS

### "Connection timeout"
**Solution:**
- Check internet connection
- Verify firewall settings
- Try different SMTP port (587, 465)

### Emails not received
**Solution:**
- Check spam/junk folder
- Verify recipient email is correct
- Check email service status
- Review server logs for errors

### "No such user" error
**Solution:**
- Verify EMAIL_USER format
- Check typos in email address
- Ensure domain is correct

---

## 📈 Production Considerations

### Rate Limiting
- Gmail: 500 emails per day (free account)
- Consider using SendGrid or AWS SES for higher volume
- Implement queue system for many contacts

### Email Templates
- Store templates in separate files
- Use template engine (Handlebars, EJS)
- Support multiple languages

### Monitoring
- Log all email attempts
- Track delivery rates
- Alert on repeated failures
- Dashboard for email statistics

### Compliance
- Include unsubscribe option
- Add privacy policy link
- Follow GDPR/CAN-SPAM guidelines
- Get consent for emergency alerts

---

## ✅ Verification Checklist

Before going live:
- [ ] `.env` file configured
- [ ] App password generated
- [ ] Test email sent successfully
- [ ] Emergency contacts added
- [ ] SOS alert triggered
- [ ] Email received by contacts
- [ ] Error handling verified
- [ ] Logs reviewed
- [ ] Production credentials set
- [ ] Backup email service configured

---

## 📞 Support

If you encounter issues:
1. Check server logs
2. Verify environment variables
3. Test with simple email first
4. Review Gmail security settings
5. Check spam/blocked senders
6. Try different email service

---

## 🎉 Success!

Once configured, the system will automatically:
- ✅ Send emails when SOS triggered
- ✅ Include location information
- ✅ Provide Google Maps link
- ✅ Handle errors gracefully
- ✅ Log all activity
- ✅ Support multiple contacts

Your elderly users' emergency contacts will be instantly notified when help is needed!

