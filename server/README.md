# Elderly Assistant - Backend API

Backend API server for the Elderly Assistant application built with Express.js and MongoDB.

## Technologies Used

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment variables management

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your MongoDB connection string:
```env
MONGODB_URI=mongodb://localhost:27017/elderly-assistant
PORT=5000
NODE_ENV=development
```

### Running the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Reminders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reminders` | Get all reminders |
| GET | `/api/reminders/:id` | Get a single reminder |
| POST | `/api/reminders` | Create a new reminder |
| PUT | `/api/reminders/:id` | Update a reminder |
| DELETE | `/api/reminders/:id` | Delete a reminder |

### Example Requests

**Create a Reminder:**
```json
POST /api/reminders
{
  "medicineName": "Aspirin",
  "time": "08:00",
  "note": "Take with food"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "medicineName": "Aspirin",
    "time": "08:00",
    "note": "Take with food",
    "createdAt": "2025-01-01T08:00:00.000Z",
    "updatedAt": "2025-01-01T08:00:00.000Z"
  }
}
```

## Project Structure

```
server/
├── config/
│   └── db.js           # MongoDB connection
├── models/
│   └── Reminder.js     # Reminder schema
├── routes/
│   └── reminders.js    # Reminder routes
├── .env.example        # Environment variables template
├── .gitignore         # Git ignore rules
├── package.json       # Dependencies
├── README.md          # This file
└── server.js          # Main entry point
```

## MongoDB Setup

### Option 1: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/elderly-assistant`

### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `.env` with your connection string

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

## License

ISC

