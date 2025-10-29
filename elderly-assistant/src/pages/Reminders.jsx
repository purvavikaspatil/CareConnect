import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Pill, Clock, Plus, Trash2, AlertCircle } from 'lucide-react'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'

function Reminders() {
  const [reminders, setReminders] = useState([])
  const [medicineName, setMedicineName] = useState('')
  const [time, setTime] = useState('')
  const [note, setNote] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState('')
  const navigate = useNavigate()

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -30, scale: 0.95 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 100 } }
  }

  // Check authentication and fetch reminders on component mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      // Redirect to login if not authenticated
      navigate('/login')
      return
    }
    
    fetchReminders()
  }, [navigate])

  const fetchReminders = async () => {
    try {
      setLoading(true)
      setApiError('')
      
      const token = localStorage.getItem('token')
      const response = await axios.get(API_ENDPOINTS.REMINDERS, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (response.data.success) {
        setReminders(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching reminders:', error)
      
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
        return
      }
      
      setApiError('Unable to load reminders. Please make sure the server is running on port 5000.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddReminder = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!medicineName.trim() || !time) {
      setErrorMessage('Please enter both medicine name and time')
      return
    }

    try {
      setErrorMessage('')
      
      // Create new reminder object
      const newReminder = {
        medicineName: medicineName.trim(),
        time,
        note: note.trim()
      }

      const token = localStorage.getItem('token')
      
      // Send POST request to backend
      const response = await axios.post(API_ENDPOINTS.REMINDERS, newReminder, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data.success) {
        // Add to local state
        setReminders([...reminders, response.data.data])
        
        // Clear form
        setMedicineName('')
        setTime('')
        setNote('')
      }
    } catch (error) {
      console.error('Error adding reminder:', error)
      
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
        return
      }
      
      setErrorMessage('Failed to add reminder. Please try again.')
    }
  }

  const handleDeleteReminder = async (id) => {
    try {
      const token = localStorage.getItem('token')
      
      // Send DELETE request to backend
      const response = await axios.delete(`${API_ENDPOINTS.REMINDERS}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data.success) {
        // Remove from local state
        setReminders(reminders.filter(reminder => reminder._id !== id))
      }
    } catch (error) {
      console.error('Error deleting reminder:', error)
      
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
        return
      }
      
      setErrorMessage('Failed to delete reminder. Please try again.')
    }
  }

  return (
    <main className="flex-grow px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 right-20 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <motion.div 
        className="max-w-4xl mx-auto relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Page Header */}
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div 
            className="inline-block text-5xl sm:text-6xl mb-3"
            animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            💊
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">
            <span className="bg-gradient-to-r from-accent-500 via-primary-600 to-secondary-500 bg-clip-text text-transparent">
              Your Reminders
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-200">
            Never miss your medication schedule
          </p>
        </motion.div>

        {/* API Error Message */}
        {apiError && (
          <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 text-base">
            <p className="font-semibold mb-1">⚠️ Connection Error</p>
            <p>{apiError}</p>
          </div>
        )}

        {/* Add Reminder Form */}
        <div className="bg-white rounded-lg shadow-md p-5 sm:p-6 mb-5">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
            Add New Reminder
          </h2>
          
          <form onSubmit={handleAddReminder} className="space-y-4">
            {/* Medicine Name */}
            <div>
              <label 
                htmlFor="medicineName" 
                className="block text-base sm:text-lg font-medium text-gray-700 mb-2"
              >
                Medicine Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="medicineName"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                placeholder="e.g., Aspirin"
                className="w-full px-4 sm:px-5 py-3 text-base sm:text-lg text-gray-900 placeholder-gray-500 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
              />
            </div>

            {/* Time */}
            <div>
              <label 
                htmlFor="time" 
                className="block text-base sm:text-lg font-medium text-gray-700 mb-2"
              >
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 sm:px-5 py-3 text-base sm:text-lg text-gray-900 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
              />
            </div>

            {/* Optional Note */}
            <div>
              <label 
                htmlFor="note" 
                className="block text-base sm:text-lg font-medium text-gray-700 mb-2"
              >
                Note (Optional)
              </label>
              <input
                type="text"
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g., Take with food"
                className="w-full px-4 sm:px-5 py-3 text-base sm:text-lg text-gray-900 placeholder-gray-500 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
              />
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg text-base">
                {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg sm:text-xl px-6 py-3.5 rounded-full shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Add Reminder
            </button>
          </form>
        </div>

        {/* Reminders List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3 tracking-tight">
            <Pill className="text-accent-500 dark:text-accent-400" size={28} />
            Active Reminders ({reminders.length})
          </h2>

          {loading ? (
            <motion.div 
              className="glass-card rounded-3xl p-12 text-center shadow-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.div 
                className="text-accent-500 dark:text-accent-400 mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Clock className="mx-auto h-12 w-12" />
              </motion.div>
              <p className="text-gray-700 dark:text-gray-200 text-lg">
                Loading your reminders...
              </p>
            </motion.div>
          ) : reminders.length === 0 ? (
            <motion.div 
              className="glass-card rounded-3xl p-12 text-center shadow-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.div 
                className="text-warm-400 dark:text-warm-600 mb-4"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <AlertCircle className="mx-auto h-20 w-20" />
              </motion.div>
              <p className="text-gray-700 dark:text-gray-200 text-lg">
                No reminders yet. Add your first reminder above!
              </p>
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="popLayout">
                {reminders.map((reminder, index) => (
                  <motion.div
                    key={reminder._id}
                    variants={itemVariants}
                    exit={{ opacity: 0, x: -50, scale: 0.9 }}
                    className="glass-card rounded-3xl p-6 sm:p-8 border-l-4 border-accent-500 shadow-lg hover:shadow-2xl transition-shadow group"
                    whileHover={{ scale: 1.02, y: -4 }}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-3">
                          <motion.span 
                            className="text-3xl"
                            whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                          >
                            💊
                          </motion.span>
                          <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-accent-500 to-primary-600 bg-clip-text text-transparent tracking-tight">
                            {reminder.medicineName}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-2 text-accent-600 dark:text-accent-400 mb-3">
                          <Clock size={20} />
                          <span className="text-lg font-semibold">
                            {reminder.time}
                          </span>
                        </div>
                        
                        {reminder.note && (
                          <motion.p 
                            className="text-gray-600 dark:text-gray-300 text-base mt-3 italic glass-strong rounded-2xl p-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            📝 {reminder.note}
                          </motion.p>
                        )}
                      </div>
                      
                      {/* Delete Button */}
                      <motion.button
                        onClick={() => handleDeleteReminder(reminder._id)}
                        className="flex-shrink-0 bg-gradient-to-br from-danger to-secondary-500 text-white p-4 rounded-2xl shadow-md"
                        whileHover={{ scale: 1.1, boxShadow: "0px 0px 15px rgba(229, 57, 53, 0.6)" }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Delete reminder"
                      >
                        <Trash2 size={20} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </main>
  )
}

export default Reminders

