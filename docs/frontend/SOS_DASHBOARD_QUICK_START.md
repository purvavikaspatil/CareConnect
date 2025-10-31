# SOS Dashboard - Quick Start

## 🚀 Getting Started (2 minutes)

### 1. Start the Application

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

### 2. Access the Dashboard

1. Open browser → `http://localhost:5173`
2. Login to your account
3. Click **"SOS Dashboard"** in the navigation bar

---

## 📱 What You'll See

### First Time (No Alerts Yet)
```
┌─────────────────────────────────┐
│  🚨 SOS Alert History           │
│  View all your emergency alerts │
├─────────────────────────────────┤
│                                 │
│           📭                    │
│     No SOS Alerts Yet           │
│                                 │
│  [Go to Help Page]              │
│                                 │
└─────────────────────────────────┘
```

### With Alerts
```
┌─────────────────────────────────────────────┐
│  🚨 SOS Alert History                       │
│  5 alerts found                             │
├─────────────────────────────────────────────┤
│  ┌───────────────────────────────────────┐ │
│  │ 🚨                    [active]        │ │
│  ├───────────────────────────────────────┤ │
│  │ 📅 Oct 28, 2024, 10:30 AM            │ │
│  │ 💬 Emergency! Need assistance         │ │
│  │ 📍 40.7128, -74.0060                  │ │
│  │    [View on Google Maps] 🗺️          │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │ 🚨                    [resolved]      │ │
│  │ ...                                   │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## 🧪 Quick Test

### Create a Test Alert

1. Click **"Help"** in navigation
2. Press **"SOS - EMERGENCY"** button
3. Click **"Allow"** for location
4. Wait for success message
5. Click **"SOS Dashboard"** in navigation
6. You should see your new alert!

### Test Google Maps Link

1. Find an alert with location
2. Click **"View on Google Maps"** button
3. New tab opens showing the location

---

## 📊 Features at a Glance

| Feature | Description |
|---------|-------------|
| **Alert History** | View all past SOS alerts |
| **Location Links** | Click to see location on Google Maps |
| **Status Badges** | Active (red), Resolved (green), Cancelled (gray) |
| **Date/Time** | Human-readable timestamps |
| **Mobile-First** | Works great on phones and tablets |
| **Empty State** | Helpful message when no alerts |
| **Error Handling** | Graceful failures with retry |

---

## 🎨 Mobile vs Desktop

### Mobile (< 1024px)
- **Stacked cards** for easy scrolling
- **Large touch targets** (44x44px minimum)
- **Full-width layout**
- **Vertical spacing** for readability

### Desktop (≥ 1024px)
- **Table layout** for quick scanning
- **Multiple alerts** visible at once
- **Hover effects** on rows
- **Compact display**

---

## 🔗 Navigation

The "SOS Dashboard" link appears in:
- ✅ Desktop navigation bar (top)
- ✅ Mobile hamburger menu
- ✅ Only when logged in

---

## 💡 Tips

1. **Refresh to see new alerts** after creating them on Help page
2. **Allow location** when triggering SOS for map links to work
3. **Use desktop view** to see multiple alerts at once
4. **Click anywhere on table row** to focus (hover effect)

---

## 🐛 Common Issues

### "No alerts found" but I just created one
**Solution:** Refresh the page or navigate away and back

### Location shows "Not available"
**Solution:** You denied location permission. Create a new alert and allow it.

### Dashboard won't load
**Solution:** Make sure backend is running: `cd server && npm run dev`

### Not logged in error
**Solution:** Login first, then access dashboard

---

## 📱 Mobile Preview

To test mobile view:
1. Open browser DevTools (F12)
2. Click device toolbar icon (or Ctrl+Shift+M)
3. Select a mobile device (e.g., iPhone 12)
4. Navigate to dashboard

---

## ✅ Success Checklist

After setup, verify:
- [ ] Dashboard loads without errors
- [ ] Navigation link is visible (when logged in)
- [ ] Empty state shows if no alerts
- [ ] Alerts display when available
- [ ] Dates are formatted correctly
- [ ] Google Maps links work
- [ ] Mobile view looks good (cards)
- [ ] Desktop view looks good (table)
- [ ] Loading spinner appears briefly
- [ ] Status badges show correct colors

---

## 🎉 You're All Set!

The SOS Dashboard is ready to use. Create some test alerts and explore the features!

**Next Steps:**
- Configure emergency contacts (for notifications)
- Set up email alerts (see `ENV_CONFIGURATION.md`)
- Set up SMS alerts (see `TWILIO_SMS_SETUP_GUIDE.md`)

---

Need detailed documentation? See **`SOS_DASHBOARD_GUIDE.md`** for complete reference.

