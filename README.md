# CareConnect - AI-Powered Elderly Assistant

![CareConnect Logo](https://img.shields.io/badge/CareConnect-AI%20Assistant-blue?style=for-the-badge&logo=heart)

A comprehensive AI-powered elderly care application designed to provide safety, assistance, and peace of mind for seniors and their families.

## 🌟 Features

### 🚨 Emergency SOS System
- **Instant Emergency Alerts**: One-click SOS button for immediate help
- **Location Sharing**: Automatic GPS location sharing with emergency contacts
- **Email Notifications**: Real-time alerts sent to family members and caregivers
- **Google Meet Integration**: Video calls for emergency situations

### 🤖 AI Guardian
- **Intelligent Monitoring**: AI-powered safety monitoring and assistance
- **Smart Alerts**: Proactive notifications for potential health or safety issues
- **Voice Commands**: Hands-free operation for accessibility

### 🎤 Voice Assistant
- **Natural Language Processing**: Conversational AI for daily assistance
- **Text-to-Speech**: High-quality voice responses
- **Voice Commands**: Control the application using voice
- **Accessibility Features**: Designed for users with mobility limitations

### 📞 Contact Management
- **Emergency Contacts**: Quick access to family, friends, and healthcare providers
- **Friend Connect**: Social features to stay connected with loved ones
- **Call Integration**: Direct calling capabilities

### 📅 Smart Reminders
- **Medication Reminders**: Never miss important medications
- **Appointment Scheduling**: Healthcare and social event reminders
- **Custom Alerts**: Personalized reminder system

### 🎨 Modern UI/UX
- **Dark Mode Support**: Easy on the eyes for all users
- **Large Text Options**: Improved readability for seniors
- **Intuitive Design**: Simple, clean interface
- **Responsive Layout**: Works on all devices

## 🛠️ Technology Stack

### Frontend
- **React.js**: Modern, responsive user interface
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and development server
- **Context API**: State management for theme and user data

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database for data storage
- **Mongoose**: MongoDB object modeling

### AI & Voice
- **Google Text-to-Speech**: High-quality voice synthesis
- **Web Speech API**: Voice recognition capabilities
- **AI Integration**: Smart assistance and monitoring

### Communication
- **Email Service**: Automated notifications and alerts
- **Google Meet API**: Video calling integration
- **SMS Integration**: Text message alerts

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/purvavikaspatil/CareConnect.git
   cd CareConnect
   ```

2. **Install frontend dependencies**
   ```bash
   cd elderly-assistant
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../server
   npm install
   ```

4. **Environment Setup**
   - Copy `server/ADD_TO_ENV.txt` to `server/.env`
   - Configure your environment variables (database, email, etc.)

5. **Start the application**
   ```bash
   # Start backend server
   cd server
   npm start
   
   # Start frontend (in new terminal)
   cd elderly-assistant
   npm run dev
   ```

## 📱 Usage

1. **Sign Up/Login**: Create an account or sign in
2. **Add Emergency Contacts**: Set up your emergency contact list
3. **Configure Voice Assistant**: Set up voice commands and preferences
4. **Set Up Reminders**: Add medication and appointment reminders
5. **Test SOS System**: Familiarize yourself with emergency features

## 🔧 Configuration

### Email Setup
- Configure SMTP settings in `server/.env`
- Set up email templates for notifications
- Test email delivery

### Voice Assistant
- Configure Google TTS API
- Set up voice recognition
- Customize voice commands

### Database
- MongoDB connection string
- User authentication setup
- Data models configuration

## 📊 Project Structure

```
CareConnect/
├── elderly-assistant/          # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Application pages
│   │   ├── context/          # React context providers
│   │   ├── services/         # API services
│   │   └── utils/            # Utility functions
│   └── public/               # Static assets
├── server/                   # Node.js backend
│   ├── routes/              # API routes
│   ├── models/              # Database models
│   ├── middleware/          # Express middleware
│   └── utils/               # Server utilities
└── docs/                    # Documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Purva Vikas Patil** - Project Lead & Full-Stack Developer

## 🙏 Acknowledgments

- React.js community for excellent documentation
- Tailwind CSS for beautiful styling
- MongoDB for reliable data storage
- Google APIs for voice and communication features

## 📞 Support

For support, email purva@example.com or create an issue in this repository.

---

**CareConnect** - Empowering seniors with AI technology for safer, more connected living. 💙
