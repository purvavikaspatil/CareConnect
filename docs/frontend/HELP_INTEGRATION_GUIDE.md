# Help Page Backend Integration Guide

## Overview
The Help.jsx page has been fully integrated with the backend SOS API (`http://localhost:5000/api/sos`). Users can now send authenticated emergency alerts with optional location data.

---

## ✅ What Was Updated

### 1. **Imports & Dependencies**
```javascript
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
```

- Added `useEffect` and `useNavigate` from React Router
- Imported `axios` for HTTP requests (already installed)

### 2. **New State Variables**
```javascript
const [sendingAlert, setSendingAlert] = useState(false)  // Loading state
const [alertError, setAlertError] = useState('')          // Error messages
const [locationWarning, setLocationWarning] = useState('') // Location warnings
const [sosMessage, setSOSMessage] = useState('')          // Success message
```

### 3. **Authentication Check**
```javascript
useEffect(() => {
  const token = localStorage.getItem('token')
  if (!token) {
    navigate('/login')
  }
}, [navigate])
```

- Redirects unauthenticated users to login page
- Runs on component mount

### 4. **Enhanced SOS Button Handler**

**Flow:**
1. Check authentication
2. Clear previous messages
3. Request location via Geolocation API
4. If location granted → Send alert with coordinates
5. If location denied → Send alert without coordinates (with warning)
6. Display success/error messages

**Key Features:**
- 5-second timeout for location request
- Falls back to no-location alert if denied
- Shows "Location not shared" warning
- Handles authentication errors (401)
- Shows loading spinner during request

### 5. **Backend Integration Function**

```javascript
const sendSOSAlert = async (token, locationData) => {
  const alertPayload = {
    message: 'Emergency! Need immediate assistance!'
  }

  if (locationData) {
    alertPayload.latitude = locationData.latitude
    alertPayload.longitude = locationData.longitude
    alertPayload.accuracy = locationData.accuracy
  }

  const response = await axios.post(API_URL, alertPayload, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}
```

**API Call Details:**
- **Endpoint:** `POST http://localhost:5000/api/sos`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Body:** `{ message, latitude?, longitude?, accuracy? }`
- **Success Response:** Shows success modal
- **Error Handling:** Displays user-friendly error messages

### 6. **UI Enhancements**

#### Error Message Display
```jsx
{alertError && (
  <div className="bg-red-50 border-2 border-red-300...">
    Alert Error: {alertError}
  </div>
)}
```

#### Warning Message Display
```jsx
{locationWarning && (
  <div className="bg-yellow-50 border-2 border-yellow-300...">
    Warning: {locationWarning}
  </div>
)}
```

#### Loading State on Button
```jsx
<button
  onClick={handleSOSClick}
  disabled={sendingAlert}
  className="...disabled:bg-red-400..."
>
  {sendingAlert ? (
    <svg className="animate-spin...">Sending Alert...</svg>
  ) : (
    <>🚨 SOS - EMERGENCY</>
  )}
</button>
```

#### Enhanced Success Modal
- Shows dynamic success message
- Displays location warning if applicable
- Auto-dismisses after 4 seconds

---

## 🔐 Security Features

✅ **JWT Authentication** - Token required for all SOS alerts  
✅ **Session Check** - Redirects to login if token missing  
✅ **Token Validation** - Handles expired/invalid tokens  
✅ **Protected Route** - Page requires authentication  

---

## 📱 User Experience Flow

### Scenario 1: SOS with Location
1. User clicks SOS button
2. Browser requests location permission
3. User grants permission
4. Alert sent with coordinates
5. Success modal displays: "Emergency alert sent successfully!"
6. Modal auto-dismisses after 4 seconds

### Scenario 2: SOS without Location (Permission Denied)
1. User clicks SOS button
2. Browser requests location permission
3. User denies permission
4. Warning shown: "Location not shared - sending alert without coordinates"
5. Alert sent without coordinates
6. Success modal displays with warning message
7. Modal auto-dismisses after 4 seconds

### Scenario 3: Error Handling
1. User clicks SOS button
2. Network error or server error occurs
3. Red error message displays
4. User can retry or call emergency services directly

### Scenario 4: Unauthenticated User
1. Unauthenticated user tries to access Help page
2. Automatically redirected to login page
3. After login, can return to Help page

---

## 🧪 Testing Instructions

### 1. Start Both Servers

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd elderly-assistant
npm run dev
```

### 2. Login/Signup
1. Navigate to `http://localhost:5173`
2. Click "Sign Up" or "Login"
3. Create/login to your account

### 3. Test SOS Alert with Location

**Allow Location:**
1. Navigate to Help page
2. Click the large SOS button
3. When browser prompts for location → Click "Allow"
4. Wait for success message
5. Check browser console for alert data
6. Success modal should appear

**Verify in Backend:**
```bash
# In a new terminal
curl -X GET http://localhost:5000/api/sos \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Test SOS Alert without Location

**Deny Location:**
1. Navigate to Help page
2. Click the large SOS button
3. When browser prompts for location → Click "Block"
4. Yellow warning should appear: "Location not shared"
5. Alert still sends successfully
6. Success modal appears with warning

### 5. Test Error Scenarios

**Test Expired Token:**
1. Clear localStorage or logout
2. Try to access Help page
3. Should redirect to login

**Test Network Error:**
1. Stop the backend server
2. Click SOS button
3. Should show error: "Failed to send SOS alert..."

---

## 📊 API Request Example

### Request
```http
POST http://localhost:5000/api/sos
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "message": "Emergency! Need immediate assistance!",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "accuracy": 10
}
```

### Success Response
```json
{
  "success": true,
  "message": "SOS alert created successfully",
  "data": {
    "_id": "64abc123def456789",
    "userId": {
      "_id": "64user123",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "timestamp": "2024-10-28T10:30:00.000Z",
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "accuracy": 10
    },
    "message": "Emergency! Need immediate assistance!",
    "status": "active",
    "createdAt": "2024-10-28T10:30:00.000Z",
    "updatedAt": "2024-10-28T10:30:00.000Z"
  }
}
```

---

## 🎨 Design Features

✅ **Mobile-First** - Large touch targets (py-8 to py-12)  
✅ **Accessibility** - Clear labels, ARIA attributes, keyboard nav  
✅ **Loading States** - Spinner animation during request  
✅ **Disabled State** - Button disabled while sending  
✅ **Error Messages** - Red alerts with icons  
✅ **Warning Messages** - Yellow alerts for location issues  
✅ **Success Modal** - Green checkmark with auto-dismiss  

---

## 🔧 Future Enhancements

1. **Store Location in State** - Display last captured location
2. **Emergency Contact Integration** - Actually call stored contacts
3. **Alert History** - View past SOS alerts
4. **Notification System** - Push notifications to family members
5. **Real-time Updates** - WebSocket for live alert tracking
6. **Geofencing** - Trigger alerts based on location zones
7. **Voice Activation** - "Hey Assistant, send SOS"

---

## 📝 Notes

- Location permission must be granted in browser settings
- HTTPS required for geolocation in production
- 5-second timeout for location requests
- Alerts saved to MongoDB with user association
- All alerts require authentication
- Modal auto-dismisses after 4 seconds

---

## 🐛 Troubleshooting

### Issue: "Session expired" error
**Solution:** Login again to get a fresh token

### Issue: Location not working
**Solution:** 
- Check browser permissions
- Ensure HTTPS in production
- Clear browser cache

### Issue: Button stays disabled
**Solution:** Refresh page or check console for errors

### Issue: "Not authorized" error
**Solution:** Ensure JWT_SECRET matches between signup and login

---

## ✅ Integration Complete!

The Help page is now fully integrated with the backend SOS API, providing a complete emergency alert system with location tracking, authentication, and comprehensive error handling.

