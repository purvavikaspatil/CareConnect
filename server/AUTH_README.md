# Authentication System Documentation

## Overview
This authentication system uses JWT (JSON Web Tokens) and MongoDB to secure the Elderly Assistant API.

## Setup Instructions

### 1. Environment Variables
Make sure your `.env` file includes the following:

```env
MONGODB_URI=mongodb://localhost:27017/elderly-assistant
JWT_SECRET=your-secret-key-here-change-in-production
PORT=5000
NODE_ENV=development
```

**Important:** Change `JWT_SECRET` to a strong, random string in production.

### 2. Dependencies Installed
- `bcrypt` - For password hashing
- `jsonwebtoken` - For JWT token generation and verification

### 3. New Files Created

#### Models
- **`server/models/User.js`** - User schema with password hashing

#### Routes
- **`server/routes/authRoutes.js`** - Authentication endpoints

#### Middleware
- **`server/middleware/authMiddleware.js`** - JWT verification middleware

#### Updated Files
- **`server/models/Reminder.js`** - Added userId field
- **`server/routes/reminderRoutes.js`** - Protected all routes with authentication
- **`server/index.js`** - Added auth routes

## API Endpoints

### Authentication Endpoints

#### 1. Signup (Register)
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "jwt_token_here"
  }
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "jwt_token_here"
  }
}
```

#### 3. Get Current User (Protected)
```http
GET /api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Reminder Endpoints (All Protected)

All reminder endpoints now require authentication. Include the JWT token in the Authorization header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### 1. Get All Reminders
```http
GET /api/reminders
Authorization: Bearer YOUR_JWT_TOKEN
```

Returns only reminders belonging to the authenticated user.

#### 2. Create Reminder
```http
POST /api/reminders
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "medicineName": "Aspirin",
  "time": "08:00 AM",
  "note": "Take with food"
}
```

The reminder will be automatically associated with the authenticated user.

#### 3. Delete Reminder
```http
DELETE /api/reminders/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

Users can only delete their own reminders.

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt with a salt factor of 10
2. **JWT Tokens**: Tokens expire after 30 days
3. **Protected Routes**: All reminder endpoints require authentication
4. **User Isolation**: Users can only access their own reminders
5. **Ownership Verification**: Delete operations verify reminder ownership

## Error Responses

### Authentication Errors

**No Token Provided:**
```json
{
  "success": false,
  "error": "Not authorized, no token provided"
}
```

**Invalid Token:**
```json
{
  "success": false,
  "error": "Not authorized, invalid token"
}
```

**Token Expired:**
```json
{
  "success": false,
  "error": "Not authorized, token expired"
}
```

### Validation Errors

**Missing Fields:**
```json
{
  "success": false,
  "error": "Please provide email and password"
}
```

**User Already Exists:**
```json
{
  "success": false,
  "error": "User already exists with this email"
}
```

**Invalid Credentials:**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

## Testing the API

Use the `server/test-auth.http` file with the REST Client extension in VS Code, or use tools like Postman or cURL.

### Testing Flow:
1. Register a new user using `/api/auth/signup`
2. Copy the returned JWT token
3. Use the token in the Authorization header for all reminder operations
4. Try to access reminders without a token to verify protection

## Frontend Integration

When integrating with the frontend:

1. Store the JWT token after successful login/signup (localStorage or secure cookie)
2. Include the token in all API requests:
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}`,
     'Content-Type': 'application/json'
   }
   ```
3. Handle 401 responses by redirecting to login
4. Clear token on logout

## Notes

- Tokens expire after 30 days (configurable in `authRoutes.js`)
- Each user can only see and manage their own reminders
- Password minimum length is 6 characters
- Email format is validated using regex
- All passwords are automatically hashed before storage

