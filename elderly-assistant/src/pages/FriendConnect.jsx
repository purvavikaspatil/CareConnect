import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Video, Heart, Sparkles, Edit, Check } from 'lucide-react'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api/friends'

function FriendConnect() {
  const [loading, setLoading] = useState(false)
  const [availableUsers, setAvailableUsers] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [matchedFriend, setMatchedFriend] = useState(null)
  const [hobbies, setHobbies] = useState('')
  const [interests, setInterests] = useState('')
  const [showInterestsForm, setShowInterestsForm] = useState(false)
  const navigate = useNavigate()

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
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  }

  // Check authentication and load available users
  useEffect(() => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      navigate('/login')
      return
    }
    
    loadAvailableUsers()
    loadUserInterests()
  }, [navigate])

  // Load available users count
  const loadAvailableUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/available`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setAvailableUsers(response.data.availableUsers)
      }
    } catch (error) {
      console.error('Error loading available users:', error)
    }
  }

  // Load user's current interests
  const loadUserInterests = () => {
    const user = localStorage.getItem('user')
    if (user) {
      try {
        const userData = JSON.parse(user)
        setHobbies((userData.hobbies || []).join(', '))
        setInterests((userData.interests || []).join(', '))
      } catch (e) {
        console.error('Error loading user interests:', e)
      }
    }
  }

  // Update interests
  const handleUpdateInterests = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const token = localStorage.getItem('token')
      
      const hobbiesArray = hobbies.split(',').map(h => h.trim()).filter(h => h)
      const interestsArray = interests.split(',').map(i => i.trim()).filter(i => i)

      const response = await axios.put(
        `${API_URL}/interests`,
        { hobbies: hobbiesArray, interests: interestsArray },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        // Update localStorage
        const user = JSON.parse(localStorage.getItem('user'))
        user.hobbies = response.data.data.hobbies
        user.interests = response.data.data.interests
        localStorage.setItem('user', JSON.stringify(user))

        setSuccessMessage('Your interests have been updated! This helps us match you with similar friends.')
        setShowInterestsForm(false)
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error updating interests:', error)
      setErrorMessage('Failed to update interests. Please try again.')
    }
  }

  // Connect with a friend
  const handleConnectFriend = async () => {
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')
    setMatchedFriend(null)

    try {
      const token = localStorage.getItem('token')
      
      const response = await axios.post(
        `${API_URL}/connect`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success && response.data.data) {
        const { friend, meetLink, expiresIn } = response.data.data

        setMatchedFriend(friend)
        setSuccessMessage(`Great! We found ${friend.name} who shares your interests!`)

        // Auto-open Meet link after showing match
        if (meetLink) {
          setTimeout(() => {
            window.open(meetLink, '_blank')
            setSuccessMessage(`Opening Google Meet with ${friend.name}... Link expires in ${expiresIn}`)
          }, 2000)
        }

      } else if (response.data.noUsersAvailable) {
        setErrorMessage(response.data.message)
      }

    } catch (error) {
      console.error('Error connecting with friend:', error)
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
        return
      }
      
      setErrorMessage(
        error.response?.data?.error || 
        'Failed to connect. Please try again or check back later.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex-grow px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div 
        className="max-w-4xl mx-auto relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Page Header */}
        <motion.div className="text-center mb-6" variants={itemVariants}>
          <motion.div 
            className="inline-block text-6xl sm:text-7xl mb-5"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            💬
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-secondary-500 via-primary-500 to-accent-500 bg-clip-text text-transparent">
              Talk to a Friend
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-200 max-w-2xl mx-auto">
            Connect with someone who shares your interests for a friendly video chat!
          </p>
        </motion.div>

        {/* Available Users Count */}
        <AnimatePresence>
          {availableUsers > 0 && (
            <motion.div 
              className="glass-card rounded-3xl p-5 mb-6 text-center shadow-lg border border-white/40"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <p className="text-blue-800 text-lg sm:text-xl flex items-center justify-center gap-2">
                <motion.span 
                  animate={{ rotate: [0, 20, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  🎉
                </motion.span>
                <strong className="text-purple-600">{availableUsers}</strong> friend{availableUsers !== 1 ? 's' : ''} available to chat right now!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div 
              className="glass-card bg-green-50/50 border-2 border-green-300/50 text-green-700 px-6 py-4 rounded-3xl mb-6 shadow-lg"
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <p className="flex items-center gap-2 text-base sm:text-lg">
                <Check size={24} className="text-green-600" />
                {successMessage}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div 
              className="glass-card bg-red-50/50 border-2 border-red-300/50 text-red-700 px-6 py-4 rounded-3xl mb-6 shadow-lg"
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <p className="flex items-center gap-2 text-base sm:text-lg">
                <motion.span
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                >
                  ⚠️
                </motion.span>
                {errorMessage}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Matched Friend Info */}
        <AnimatePresence>
          {matchedFriend && (
            <motion.div 
              className="glass-card rounded-3xl p-8 mb-8 shadow-2xl border border-white/40 relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -30 }}
              transition={{ type: 'spring', stiffness: 150 }}
            >
              {/* Confetti effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-200/20 to-pink-200/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              <div className="text-center mb-6 relative z-10">
                <motion.div 
                  className="text-6xl mb-4"
                  animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8 }}
                >
                  🤝
                </motion.div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Matched with {matchedFriend.name}!
                </h2>
              </div>

              {matchedFriend.sharedInterests && matchedFriend.sharedInterests.length > 0 && (
                <motion.div 
                  className="glass-strong rounded-2xl p-5 mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <Sparkles size={20} /> Shared Interests:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {matchedFriend.sharedInterests.map((interest, index) => (
                      <motion.span
                        key={index}
                        className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        whileHover={{ scale: 1.1, boxShadow: "0 4px 12px rgba(147, 51, 234, 0.3)" }}
                      >
                        {interest}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.div 
                className="glass-strong rounded-2xl p-5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <p className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                  <Heart size={20} /> {matchedFriend.name}'s Interests:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[...(matchedFriend.interests || []), ...(matchedFriend.hobbies || [])].map((interest, index) => (
                    <motion.span
                      key={index}
                      className="bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      whileHover={{ scale: 1.1, boxShadow: "0 4px 12px rgba(236, 72, 153, 0.3)" }}
                    >
                      {interest}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              <motion.p 
                className="text-center text-sm text-purple-700 mt-5 flex items-center justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Video size={16} />
                Google Meet will open in a new tab...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Connect Button */}
        <motion.div className="mb-10" variants={itemVariants}>
          <motion.button
            onClick={handleConnectFriend}
            disabled={loading || availableUsers === 0}
            className="w-full bg-gradient-to-r from-secondary-400 to-secondary-600 disabled:from-warm-400 disabled:to-warm-500 disabled:cursor-not-allowed text-white font-bold text-2xl sm:text-3xl px-8 py-12 rounded-3xl shadow-2xl relative overflow-hidden group"
            whileHover={!loading && availableUsers > 0 ? { 
              scale: 1.02, 
              boxShadow: "0px 0px 40px rgba(255, 128, 171, 0.8)" 
            } : {}}
            whileTap={!loading && availableUsers > 0 ? { scale: 0.98 } : {}}
            animate={!loading && availableUsers > 0 ? { 
              boxShadow: [
                "0 20px 60px rgba(255, 128, 171, 0.3)",
                "0 20px 80px rgba(255, 128, 171, 0.5)",
                "0 20px 60px rgba(255, 128, 171, 0.3)"
              ]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="flex flex-col items-center space-y-4 relative z-10">
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Users size={48} />
                  </motion.div>
                  <span>Finding a friend for you...</span>
                </>
              ) : (
                <>
                  <motion.div 
                    className="text-6xl"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  >
                    💬
                  </motion.div>
                  <span>Talk to a Friend</span>
                  <span className="text-lg font-normal opacity-90">
                    {availableUsers > 0 
                      ? `${availableUsers} friend${availableUsers !== 1 ? 's' : ''} available`
                      : 'No friends available right now'
                    }
                  </span>
                </>
              )}
            </div>
            {!loading && availableUsers > 0 && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-secondary-500 via-secondary-600 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </motion.button>
        </motion.div>

        {/* Interests Section */}
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Your Interests
            </h2>
            <button
              onClick={() => setShowInterestsForm(!showInterestsForm)}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
            >
              {showInterestsForm ? 'Cancel' : '✏️ Edit'}
            </button>
          </div>

          {showInterestsForm ? (
            <form onSubmit={handleUpdateInterests} className="space-y-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Hobbies (comma-separated)
                </label>
                <input
                  type="text"
                  value={hobbies}
                  onChange={(e) => setHobbies(e.target.value)}
                  placeholder="e.g., Reading, Gardening, Cooking"
                  className="w-full px-4 sm:px-5 py-3 text-base sm:text-lg text-gray-900 placeholder-gray-500 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Interests (comma-separated)
                </label>
                <input
                  type="text"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g., Music, Movies, Travel"
                  className="w-full px-4 sm:px-5 py-3 text-base sm:text-lg text-gray-900 placeholder-gray-500 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3.5 rounded-full transition-colors shadow-lg hover:shadow-xl"
              >
                Save Interests
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              {hobbies && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Hobbies:</p>
                  <div className="flex flex-wrap gap-2">
                    {hobbies.split(',').map((hobby, index) => (
                      <span
                        key={index}
                        className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                      >
                        {hobby.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {interests && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Interests:</p>
                  <div className="flex flex-wrap gap-2">
                    {interests.split(',').map((interest, index) => (
                      <span
                        key={index}
                        className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm"
                      >
                        {interest.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {!hobbies && !interests && (
                <p className="text-gray-500 text-sm sm:text-base italic">
                  No interests added yet. Click "Edit" to add your interests and find better matches!
                </p>
              )}
            </div>
          )}
        </div>

        {/* How it Works */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 sm:p-8">
          <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>How It Works</span>
          </h3>
          <ul className="space-y-3 text-sm sm:text-base text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold flex-shrink-0">1.</span>
              <span>Add your <strong>hobbies and interests</strong> to help us match you with similar friends.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold flex-shrink-0">2.</span>
              <span>Click <strong>"Talk to a Friend"</strong> and we'll find someone with shared interests.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold flex-shrink-0">3.</span>
              <span>A <strong>secure video call</strong> will open automatically - just join and chat!</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold flex-shrink-0">4.</span>
              <span>Enjoy meaningful conversations with people who share your passions!</span>
            </li>
          </ul>
        </div>

        {/* Benefits Section */}
        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-6 sm:p-8">
          <h3 className="text-lg sm:text-xl font-bold text-orange-900 mb-4">
            ❤️ Why Connect with Friends?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl mb-2">😊</div>
              <p className="text-sm font-semibold text-gray-800">Combat Loneliness</p>
              <p className="text-xs text-gray-600 mt-1">Regular social interaction improves mental health</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl mb-2">🧠</div>
              <p className="text-sm font-semibold text-gray-800">Stay Sharp</p>
              <p className="text-xs text-gray-600 mt-1">Conversations keep your mind active and engaged</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl mb-2">🌟</div>
              <p className="text-sm font-semibold text-gray-800">Share Stories</p>
              <p className="text-xs text-gray-600 mt-1">Exchange experiences and wisdom with peers</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl mb-2">💕</div>
              <p className="text-sm font-semibold text-gray-800">Make Friends</p>
              <p className="text-xs text-gray-600 mt-1">Build new friendships with similar interests</p>
            </div>
          </div>
        </div>

        {/* Safety Notice */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-xs sm:text-sm text-green-800 text-center">
            🔒 <strong>Safe & Secure:</strong> All matches are verified users. You can end the call anytime. 
            Video calls use secure platforms (Google Meet or Jitsi Meet - encrypted & private).
          </p>
        </div>
      </motion.div>
    </main>
  )
}

export default FriendConnect
