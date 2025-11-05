import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, 
  Mic, 
  Users, 
  AlertCircle, 
  Heart, 
  Pill,
  Sparkles,
  Sun,
  Moon,
  CloudRain,
  MessageCircle,
  Shield
} from 'lucide-react'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'

function Dashboard() {
  const [user, setUser] = useState({ name: 'Friend' })
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('Hello')
  const [wellbeing, setWellbeing] = useState({ message: '', emoji: '😊', color: 'blue' })
  const navigate = useNavigate()

  // Get time-based greeting
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  // Load user data and reminders
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsed = JSON.parse(userData)
        setUser(parsed)
        generateWellbeingMessage()
      } catch (e) {
        console.error('Error parsing user:', e)
      }
    }

    fetchReminders()
  }, [navigate])

  // Generate wellbeing message
  const generateWellbeingMessage = () => {
    const messages = [
      { message: "You're doing great today!", emoji: '😊', color: 'green' },
      { message: "Hope you're feeling wonderful!", emoji: '🌟', color: 'yellow' },
      { message: "Remember to take care of yourself", emoji: '💝', color: 'pink' },
      { message: "Stay hydrated and smile!", emoji: '💧', color: 'blue' },
    ]
    const random = messages[Math.floor(Math.random() * messages.length)]
    setWellbeing(random)
  }

  // Fetch reminders
  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(API_ENDPOINTS.REMINDERS, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        // Get today's reminders
        const today = new Date().toDateString()
        const todaysReminders = response.data.data.slice(0, 4) // Show max 4
        setReminders(todaysReminders)
      }
    } catch (error) {
      console.error('Error fetching reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  }

  return (
    <main className="flex-grow px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-10 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div 
        className="max-w-7xl mx-auto relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Greeting Section */}
        <motion.div variants={itemVariants} className="mb-10">
          <motion.h1 
            className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight text-gray-900 dark:text-white"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {greeting}, <span className="text-primary-600 dark:text-primary-300">{user.name || 'Friend'}</span>
            <motion.span
              className="inline-block ml-3 text-4xl"
              animate={{ rotate: [0, 14, -8, 14, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
            >
              👋
            </motion.span>
          </motion.h1>
          <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-200">
            Here's what's planned for you today
          </p>
        </motion.div>

        {/* Wellbeing Card */}
        <motion.div 
          variants={itemVariants}
          className="glass-card rounded-3xl p-6 mb-8 shadow-xl border border-white/40"
          whileHover={{ scale: 1.02, y: -4 }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="text-5xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {wellbeing.emoji}
            </motion.div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                {wellbeing.message}
              </h3>
              <p className="text-gray-700 dark:text-gray-200">
                We're here to support you every step of the way
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          {/* AI Guardian Card */}
          <motion.div variants={itemVariants}>
            <Link to="/guardian">
              <motion.div
                className="glass-card rounded-3xl p-8 shadow-xl border border-white/40 cursor-pointer group relative overflow-hidden"
                whileHover={{ scale: 1.05, y: -8 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <div className="relative z-10">
                  <motion.div
                    className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl flex items-center justify-center shadow-lg"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Shield className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white tracking-tight">
                    AI Guardian
                  </h3>
                  <p className="text-center text-gray-700 dark:text-gray-200">
                    Chat with your caring AI companion
                  </p>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          {/* Talk to a Friend Card */}
          <motion.div variants={itemVariants}>
            <Link to="/friends">
              <motion.div
                className="glass-card rounded-3xl p-8 shadow-xl border border-white/40 cursor-pointer group relative overflow-hidden"
                whileHover={{ scale: 1.05, y: -8 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <div className="relative z-10">
                  <motion.div
                    className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-3xl flex items-center justify-center shadow-lg"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                  >
                    <Users className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white tracking-tight">
                    Talk to a Friend
                  </h3>
                  <p className="text-center text-gray-700 dark:text-gray-200">
                    Connect with someone who shares your interests
                  </p>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          {/* Voice Assistant Card */}
          <motion.div variants={itemVariants}>
            <Link to="/voice">
              <motion.div
                className="glass-card rounded-3xl p-8 shadow-xl border border-white/40 cursor-pointer group relative overflow-hidden"
                whileHover={{ scale: 1.05, y: -8 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <div className="relative z-10">
                  <motion.div
                    className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-accent-400 to-accent-600 rounded-3xl flex items-center justify-center shadow-lg"
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Mic className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white tracking-tight">
                    Voice Assistant
                  </h3>
                  <p className="text-center text-gray-700 dark:text-gray-200">
                    Quick voice commands and help
                  </p>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        </div>

        {/* Reminders Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
              <Pill className="text-accent-500 dark:text-accent-400" size={32} />
              <span className="text-gray-900 dark:text-white">
                Today's Reminders
              </span>
            </h2>
            <Link to="/reminders">
              <motion.button
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View All
                <Sparkles size={18} />
              </motion.button>
            </Link>
          </div>

          {loading ? (
            <div className="glass-card rounded-3xl p-12 text-center shadow-xl">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Clock className="mx-auto h-12 w-12 text-accent-500 dark:text-accent-400" />
              </motion.div>
              <p className="text-gray-700 dark:text-gray-200 mt-4">Loading reminders...</p>
            </div>
          ) : reminders.length === 0 ? (
            <motion.div 
              className="glass-card rounded-3xl p-12 text-center shadow-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="mx-auto h-16 w-16 text-primary-300 dark:text-primary-600" />
              </motion.div>
              <p className="text-gray-700 dark:text-gray-200 text-lg mt-4">
                No reminders for today! You're all set 🎉
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {reminders.map((reminder, index) => (
                  <motion.div
                    key={reminder._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card rounded-2xl p-6 shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow"
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="flex items-start gap-4">
                      <motion.div
                        className="text-4xl"
                        whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                      >
                        💊
                      </motion.div>
                      <div className="flex-grow">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
                          {reminder.medicineName}
                        </h4>
                        <div className="flex items-center gap-2 text-accent-600 dark:text-accent-400">
                          <Clock size={16} />
                          <span className="font-semibold">{reminder.time}</span>
                        </div>
                        {reminder.note && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 italic">
                            {reminder.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Emergency SOS Button */}
        <motion.div 
          variants={itemVariants}
          className="fixed bottom-8 right-8 z-50"
        >
          <Link to="/help">
            <motion.button
              className="w-20 h-20 bg-gradient-to-br from-danger to-danger-dark rounded-full shadow-2xl flex items-center justify-center group relative"
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(229, 57, 53, 0.7)",
                  "0 0 0 20px rgba(229, 57, 53, 0)",
                  "0 0 0 0 rgba(229, 57, 53, 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <AlertCircle className="w-10 h-10 text-white" />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-danger"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [1, 0, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.button>
          </Link>
          <p className="text-center text-sm font-bold text-danger dark:text-danger-light mt-2">
            SOS
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Link to="/reminders">
            <motion.div
              className="glass-card rounded-2xl p-6 text-center shadow-lg"
              whileHover={{ scale: 1.05, y: -4 }}
            >
              <Pill className="mx-auto mb-2 text-accent-500 dark:text-accent-400" size={32} />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{reminders.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Reminders</p>
            </motion.div>
          </Link>

          <Link to="/guardian">
            <motion.div
              className="glass-card rounded-2xl p-6 text-center shadow-lg"
              whileHover={{ scale: 1.05, y: -4 }}
            >
              <MessageCircle className="mx-auto mb-2 text-primary-600 dark:text-primary-400" size={32} />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">24/7</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">AI Support</p>
            </motion.div>
          </Link>

          <Link to="/friends">
            <motion.div
              className="glass-card rounded-2xl p-6 text-center shadow-lg"
              whileHover={{ scale: 1.05, y: -4 }}
            >
              <Heart className="mx-auto mb-2 text-secondary-500 dark:text-secondary-400" size={32} />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">∞</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Connections</p>
            </motion.div>
          </Link>

          <Link to="/help">
            <motion.div
              className="glass-card rounded-2xl p-6 text-center shadow-lg"
              whileHover={{ scale: 1.05, y: -4 }}
            >
              <Shield className="mx-auto mb-2 text-success dark:text-success-light" size={32} />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">100%</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Protected</p>
            </motion.div>
          </Link>
        </motion.div>
      </motion.div>
    </main>
  )
}

export default Dashboard

