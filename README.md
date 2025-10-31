# Elderly Assistant - Complete Application

A comprehensive web application designed to assist elderly users with medication reminders, SOS alerts, contacts management, AI-powered assistance, and voice commands.

## 📁 Project Structure

```
Hackathon/
├── elderly-assistant/    # Frontend (React + Vite)
├── server/               # Backend (Node.js + Express)
├── docs/                 # Documentation
│   ├── frontend/        # Frontend documentation
│   ├── backend/         # Backend documentation
│   ├── features/        # Feature documentation
│   └── setup/           # Setup scripts and guides
└── vercel.json          # Deployment configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js (>=18.0.0)
- MongoDB database
- npm or yarn

### Frontend Setup

```bash
cd elderly-assistant
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

```bash
cd server
npm install
npm run dev
```

The backend API will be available at `http://localhost:5000`

**Important:** Create a `.env` file in the `server/` directory with the following variables:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` - Email configuration
- (See `docs/setup/ADD_TO_ENV.txt` for complete environment variables)

## 📚 Documentation

All documentation has been organized in the `docs/` folder:

- **Frontend Docs**: `docs/frontend/` - UI components, styling guides, voice assistant setup
- **Backend Docs**: `docs/backend/` - API documentation, authentication, email setup
- **Features**: `docs/features/` - Feature implementation guides
- **Setup**: `docs/setup/` - Installation and configuration scripts

## 🛠️ Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- React Router
- Axios
- Framer Motion

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Nodemailer
- Twilio
- Google APIs

## 📦 Features

- 🔐 User Authentication & Authorization
- 💊 Medication Reminders
- 🆘 SOS Alert System
- 📞 Emergency Contacts Management
- 🤖 AI-Powered Assistant
- 🎤 Voice Commands & Text-to-Speech
- 👥 Friend Connect
- 🎨 Dark Mode Support
- 📱 Responsive Design

## 🌐 Deployment

- Frontend: Configured for Vercel (see `vercel.json`)
- Backend: Configured for Render (see `server/render.yaml`)

## 📝 License

ISC

## 👥 Contributors

See the repository contributors.

---

For detailed setup instructions, see the documentation in the `docs/` folder.

