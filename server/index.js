const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: false
})); // Enable CORS for all routes (handles OPTIONS automatically)

app.use(express.json()); // Parse JSON request bodies

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch((err) => {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/reminders', require('./routes/reminderRoutes'));
app.use('/api/sos', require('./routes/sosRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/friends', require('./routes/friendRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Elderly Assistant API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      reminders: '/api/reminders',
      sos: '/api/sos',
      contacts: '/api/contacts',
      friends: '/api/friends',
    },
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

