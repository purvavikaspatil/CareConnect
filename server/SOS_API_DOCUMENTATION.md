# SOS Alert API Documentation

## Overview
The SOS Alert API allows authenticated users to create, retrieve, update, and delete emergency SOS alerts. All endpoints require JWT authentication.

## Base URL
```
http://localhost:5000/api/sos
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Endpoints

### 1. Create SOS Alert
**POST** `/api/sos`

Creates a new SOS alert for the authenticated user.

#### Request Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Request Body
```json
{
  "latitude": 40.7128,          // Optional: User's latitude
  "longitude": -74.0060,         // Optional: User's longitude
  "accuracy": 10,                // Optional: GPS accuracy in meters
  "message": "Emergency alert"   // Optional: Custom message (default: "Emergency alert triggered")
}
```

#### Success Response (201 Created)
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
    "message": "Emergency alert",
    "status": "active",
    "createdAt": "2024-10-28T10:30:00.000Z",
    "updatedAt": "2024-10-28T10:30:00.000Z"
  }
}
```

#### Error Response (500)
```json
{
  "success": false,
  "error": "Server Error: Unable to create SOS alert"
}
```

---

### 2. Get All SOS Alerts
**GET** `/api/sos`

Retrieves all SOS alerts for the authenticated user (last 50 alerts, sorted by most recent).

#### Request Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "64abc123def456789",
      "userId": "64user123",
      "timestamp": "2024-10-28T10:30:00.000Z",
      "location": {
        "latitude": 40.7128,
        "longitude": -74.0060,
        "accuracy": 10
      },
      "message": "Emergency alert triggered",
      "status": "active",
      "createdAt": "2024-10-28T10:30:00.000Z",
      "updatedAt": "2024-10-28T10:30:00.000Z"
    }
    // ... more alerts
  ]
}
```

---

### 3. Get Specific SOS Alert
**GET** `/api/sos/:id`

Retrieves a specific SOS alert by ID. Only the owner can view their alerts.

#### Request Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### URL Parameters
- `id` (string, required): The SOS alert ID

#### Success Response (200 OK)
```json
{
  "success": true,
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
    "message": "Emergency alert triggered",
    "status": "active",
    "createdAt": "2024-10-28T10:30:00.000Z",
    "updatedAt": "2024-10-28T10:30:00.000Z"
  }
}
```

#### Error Response (404)
```json
{
  "success": false,
  "error": "SOS alert not found"
}
```

#### Error Response (403)
```json
{
  "success": false,
  "error": "Not authorized to view this alert"
}
```

---

### 4. Update SOS Alert Status
**PUT** `/api/sos/:id`

Updates the status of an SOS alert (e.g., mark as resolved).

#### Request Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

#### URL Parameters
- `id` (string, required): The SOS alert ID

#### Request Body
```json
{
  "status": "resolved"  // Options: "active", "resolved", "cancelled"
}
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "SOS alert updated successfully",
  "data": {
    "_id": "64abc123def456789",
    "userId": "64user123",
    "timestamp": "2024-10-28T10:30:00.000Z",
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "accuracy": 10
    },
    "message": "Emergency alert triggered",
    "status": "resolved",
    "createdAt": "2024-10-28T10:30:00.000Z",
    "updatedAt": "2024-10-28T10:35:00.000Z"
  }
}
```

#### Error Response (400)
```json
{
  "success": false,
  "error": "Invalid status. Must be: active, resolved, or cancelled"
}
```

---

### 5. Delete SOS Alert
**DELETE** `/api/sos/:id`

Deletes a specific SOS alert. Only the owner can delete their alerts.

#### Request Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### URL Parameters
- `id` (string, required): The SOS alert ID

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "SOS alert deleted successfully",
  "data": {}
}
```

#### Error Response (404)
```json
{
  "success": false,
  "error": "SOS alert not found"
}
```

#### Error Response (403)
```json
{
  "success": false,
  "error": "Not authorized to delete this alert"
}
```

---

## Data Model

### SOSAlert Schema
```javascript
{
  userId: ObjectId,           // Reference to User model (required)
  timestamp: Date,            // Alert creation time (default: Date.now)
  location: {
    latitude: Number,         // GPS latitude (optional)
    longitude: Number,        // GPS longitude (optional)
    accuracy: Number          // GPS accuracy in meters (optional)
  },
  message: String,            // Alert message (default: "Emergency alert triggered")
  status: String,             // Status: "active", "resolved", or "cancelled" (default: "active")
  createdAt: Date,            // Auto-generated
  updatedAt: Date             // Auto-generated
}
```

---

## Frontend Integration Example

### React Hook for SOS Alert
```javascript
import axios from 'axios'

const API_URL = 'http://localhost:5000/api/sos'

const sendSOSAlert = async (location) => {
  try {
    const token = localStorage.getItem('token')
    
    const response = await axios.post(
      API_URL,
      {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        message: 'Emergency! Need immediate assistance!'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    
    if (response.data.success) {
      console.log('SOS alert sent:', response.data.data)
      return response.data.data
    }
  } catch (error) {
    console.error('Error sending SOS alert:', error)
    throw error
  }
}
```

---

## Security Features

✅ **JWT Authentication**: All endpoints require valid JWT token  
✅ **User Isolation**: Users can only access their own alerts  
✅ **Ownership Verification**: Update and delete operations verify ownership  
✅ **Input Validation**: Status values are validated  
✅ **Error Handling**: Comprehensive error messages for all failure cases

---

## Testing

Use the `test-sos.http` file with REST Client extension in VS Code, or use tools like Postman or cURL.

### Testing Steps:
1. Login or signup to get a JWT token
2. Replace `YOUR_JWT_TOKEN_HERE` with your actual token
3. Create an SOS alert with location data
4. Retrieve all alerts to verify creation
5. Update alert status to "resolved"
6. Delete the alert (optional)

---

## Notes

- Location data is optional - alerts can be created without GPS coordinates
- Alerts are automatically timestamped when created
- The API limits the GET endpoint to return the last 50 alerts
- All timestamps are in ISO 8601 format (UTC)
- The `status` field can be used to track alert lifecycle

