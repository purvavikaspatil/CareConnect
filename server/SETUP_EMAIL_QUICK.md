# 📧 Quick Email Setup Guide (5 Minutes)

## Step 1: Enable 2-Step Verification

1. Go to: https://myaccount.google.com/security
2. Scroll down to "2-Step Verification"
3. Click and follow steps to enable it

## Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
2. In "Select app" → choose "Mail"
3. In "Select device" → choose "Other (Custom name)"
4. Type: "Elderly Assistant"
5. Click "Generate"
6. **Copy the 16-character password** (ignore spaces)

## Step 3: Update Your .env File

Open `server/.env` and add these lines:

```env
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASS=abcdefghijklmnop
```

Replace:
- `your-actual-email@gmail.com` with your Gmail address
- `abcdefghijklmnop` with your 16-character app password (NO SPACES)

## Step 4: Restart Server

```bash
# Stop server (Ctrl+C)
# Then restart:
cd server
npm run dev
```

## Step 5: Test It

```bash
# In a new terminal:
cd server
node debug-notifications.js
# Type "yes" when asked to send test
```

✅ You should receive a test email!

---

## Troubleshooting

**If "Invalid login" error:**
- Make sure 2-Step Verification is ON
- Generate a NEW app password
- Copy without spaces
- Use the app password, not your regular Gmail password

**If "Authentication failed":**
- Check EMAIL_USER has your correct Gmail address
- Check EMAIL_PASS has the 16-char app password
- No quotes around values in .env
- Restart the server after changing .env

