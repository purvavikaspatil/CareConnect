# Elderly Assistant - Backend API

Node.js/Express backend with MongoDB database.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 📦 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## 📁 Structure

```
server/
├── routes/         # API route handlers
├── models/         # MongoDB models
├── middleware/     # Express middleware
├── config/         # Configuration files
└── utils/          # Utility functions
```

## 🔌 API Endpoints

- `/api/auth` - Authentication routes
- `/api/reminders` - Medication reminders
- `/api/sos` - SOS alert system
- `/api/contacts` - Emergency contacts
- `/api/friends` - Friend connect
- `/api/ai` - AI assistant

## 🔐 Environment Variables

Create a `.env` file with:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `EMAIL_*` - Email configuration
- (See `docs/setup/ADD_TO_ENV.txt` for complete list)

## 📚 Documentation

See `../docs/backend/` for detailed guides on:
- API documentation
- Authentication setup
- Email configuration
- Database models

