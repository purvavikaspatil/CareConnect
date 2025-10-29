import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Send, Sparkles } from 'lucide-react'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api/ai'

function AIGuardian() {
  const [messages, setMessages] = useState([])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [textInput, setTextInput] = useState('')
  const [userName, setUserName] = useState('Friend')
  const [currentEmotion, setCurrentEmotion] = useState('neutral')
  const [aiService, setAiService] = useState('Loading...')
  
  const recognitionRef = useRef(null)
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()

  // Animation variants
  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: 'spring', stiffness: 200, damping: 20 }
    },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load user info and check AI status
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    const user = localStorage.getItem('user')
    if (user) {
      try {
        const userData = JSON.parse(user)
        setUserName(userData.name || 'Friend')
      } catch (e) {
        console.error('Error parsing user:', e)
      }
    }

    // Check AI service status
    checkAIStatus()

    // Add welcome message
    const welcomeMsg = {
      role: 'assistant',
      content: `Hello ${userName}! I'm your AI Guardian, here to listen, support, and keep you company. How are you feeling today?`,
      timestamp: new Date(),
      emotion: 'happy'
    }
    setMessages([welcomeMsg])

    // Initialize speech recognition
    initializeSpeechRecognition()
  }, [navigate])

  // Check which AI service is available
  const checkAIStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/status`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        setAiService(response.data.activeService)
      }
    } catch (error) {
      setAiService('Rule-based')
    }
  }

  // Initialize speech recognition
  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      const current = event.resultIndex
      const transcriptResult = event.results[current][0].transcript
      setTranscript(transcriptResult)

      if (event.results[current].isFinal) {
        handleUserMessage(transcriptResult, true)
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      setTranscript('')
    }

    recognitionRef.current = recognition
  }

  // Detect emotion from text
  const detectEmotion = (text) => {
    const lowerText = text.toLowerCase()
    
    if (lowerText.match(/\b(sad|lonely|alone|depressed|down|upset|cry|miss|worried|anxious)\b/)) {
      return 'sad'
    }
    if (lowerText.match(/\b(happy|great|wonderful|good|fantastic|love|joy|excited)\b/)) {
      return 'happy'
    }
    if (lowerText.match(/\b(tired|sleepy|exhausted|weak)\b/)) {
      return 'tired'
    }
    if (lowerText.match(/\b(pain|hurt|sick|ill|ache|unwell)\b/)) {
      return 'unwell'
    }
    
    return 'neutral'
  }

  // Speak with emotion-based modulation
  const speak = (text, emotion = 'neutral') => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported')
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      
      // Select best voice
      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find(v => 
        v.lang.startsWith('en') && 
        (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Natural'))
      ) || voices.find(v => v.lang.startsWith('en-US'))
      
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      // Emotion-based modulation
      switch (emotion) {
        case 'sad':
        case 'unwell':
          utterance.pitch = 0.8  // Lower, soothing
          utterance.rate = 0.85  // Slower, comforting
          break
        case 'happy':
          utterance.pitch = 1.05 // Brighter
          utterance.rate = 0.95  // Natural
          break
        case 'tired':
          utterance.pitch = 0.9
          utterance.rate = 0.88
          break
        default:
          utterance.pitch = 0.92 // Warm
          utterance.rate = 0.90  // Clear
      }

      utterance.volume = 0.98

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => {
        setIsSpeaking(false)
        resolve()
      }
      utterance.onerror = () => {
        setIsSpeaking(false)
        resolve()
      }

      window.speechSynthesis.speak(utterance)
    })
  }

  // Handle user message (voice or text)
  const handleUserMessage = async (message, isVoice = false) => {
    if (!message.trim()) return

    // Detect emotion
    const emotion = detectEmotion(message)
    setCurrentEmotion(emotion)

    // Add user message to chat
    const userMsg = {
      role: 'user',
      content: message,
      timestamp: new Date(),
      emotion,
      isVoice
    }
    
    setMessages(prev => [...prev, userMsg])
    setTranscript('')
    setTextInput('')
    setIsThinking(true)

    try {
      const token = localStorage.getItem('token')
      
      // Get last 5 messages for context
      const recentHistory = messages.slice(-5).map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      const response = await axios.post(
        `${API_URL}/respond`,
        {
          message,
          emotion,
          conversationHistory: recentHistory
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (response.data.success) {
        const aiReply = response.data.reply

        // Add AI response to chat
        const aiMsg = {
          role: 'assistant',
          content: aiReply,
          timestamp: new Date(),
          emotion: response.data.emotion || 'neutral'
        }
        
        setMessages(prev => [...prev, aiMsg])
        setIsThinking(false)

        // Speak the response
        await speak(aiReply, emotion)
      }

    } catch (error) {
      console.error('Error getting AI response:', error)
      
      // Fallback response
      const fallbackMsg = {
        role: 'assistant',
        content: `I'm here with you, ${userName}. How can I help you today?`,
        timestamp: new Date(),
        emotion: 'neutral'
      }
      
      setMessages(prev => [...prev, fallbackMsg])
      setIsThinking(false)
      await speak(fallbackMsg.content, 'neutral')
    }
  }

  // Toggle voice listening
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      recognitionRef.current?.start()
      setIsListening(true)
    }
  }

  // Handle text input
  const handleTextSubmit = (e) => {
    e.preventDefault()
    if (textInput.trim()) {
      handleUserMessage(textInput, false)
    }
  }

  // Get emotion icon
  const getEmotionIcon = (emotion) => {
    const icons = {
      sad: '😢',
      happy: '😊',
      tired: '😴',
      unwell: '🤒',
      neutral: '💭'
    }
    return icons[emotion] || '💭'
  }

  return (
    <main className="flex-grow px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div 
        className="max-w-5xl mx-auto relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div 
            className="inline-block text-6xl sm:text-7xl mb-4 breathe-animation"
            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
          >
            🤖💝
          </motion.div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-3 tracking-tight">
            <span className="bg-gradient-to-r from-primary-500 via-accent-400 to-secondary-400 bg-clip-text text-transparent">
              AI Guardian
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-200 mb-2">
            Your caring AI companion, always here to listen and support you
          </p>
          <motion.div 
            className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles size={14} className="text-primary-600 dark:text-primary-400" />
            <span className="text-sm text-gray-700 dark:text-gray-200">
              Powered by: <strong className="text-primary-600 dark:text-primary-400">{aiService}</strong>
            </span>
          </motion.div>
        </motion.div>

        {/* Chat Container */}
        <motion.div 
          className="glass-strong rounded-3xl shadow-2xl mb-6 overflow-hidden border border-white/40"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Messages */}
          <div className="h-[400px] sm:h-[500px] overflow-y-auto p-4 sm:p-6 space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-3`}
                >
                  {msg.role === 'assistant' && (
                    <motion.div 
                      className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl shadow-lg breathe-animation"
                      whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                    >
                      🤖
                    </motion.div>
                  )}
                  
                  <motion.div
                    className={`max-w-[75%] sm:max-w-[70%] rounded-2xl px-5 py-4 shadow-md ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-primary-500 to-accent-500 text-white rounded-br-md'
                        : 'glass-strong text-gray-900 dark:text-white rounded-bl-md'
                    }`}
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <div className="flex items-start gap-2 mb-1">
                      <motion.span 
                        className="text-lg"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5 }}
                      >
                        {getEmotionIcon(msg.emotion)}
                      </motion.span>
                      <p className="text-sm sm:text-base leading-relaxed flex-1">{msg.content}</p>
                    </div>
                    <p className={`text-xs mt-2 ${msg.role === 'user' ? 'opacity-80' : 'opacity-60'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </motion.div>

                  {msg.role === 'user' && (
                    <motion.div 
                      className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-500 to-primary-600 flex items-center justify-center text-white text-2xl shadow-lg"
                      whileHover={{ scale: 1.1 }}
                    >
                      👤
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Thinking indicator */}
            <AnimatePresence>
              {isThinking && (
                <motion.div 
                  className="flex justify-start items-start gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <motion.div 
                    className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl shadow-lg"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    🤖
                  </motion.div>
                  <div className="glass-strong rounded-2xl rounded-bl-md px-6 py-4 shadow-md">
                    <div className="flex gap-2">
                      <motion.div 
                        className="w-3 h-3 bg-primary-500 rounded-full"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div 
                        className="w-3 h-3 bg-accent-500 rounded-full"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div 
                        className="w-3 h-3 bg-secondary-400 rounded-full"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Live Transcript */}
          <AnimatePresence>
            {transcript && (
              <motion.div 
                className="glass bg-blue-50/50 border-t border-white/30 px-5 py-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <p className="text-sm text-blue-800 flex items-center gap-2">
                  <Mic size={16} className="animate-pulse" />
                  "{transcript}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Area */}
          <div className="border-t border-white/30 p-4 glass">
            <form onSubmit={handleTextSubmit} className="flex gap-3 items-center">
              {/* Mic Button */}
              <motion.button
                type="button"
                onClick={toggleListening}
                disabled={isSpeaking || isThinking}
                className={`relative flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl ${
                  isListening
                    ? 'bg-gradient-to-br from-danger to-secondary-500'
                    : 'bg-gradient-to-br from-primary-600 to-accent-600'
                } ${(isSpeaking || isThinking) ? 'opacity-50 cursor-not-allowed' : ''} text-white`}
                whileHover={!(isSpeaking || isThinking) ? { 
                  scale: 1.1, 
                  boxShadow: isListening 
                    ? "0px 0px 25px rgba(229, 57, 53, 0.8)" 
                    : "0px 0px 25px rgba(90, 96, 248, 0.8)" 
                } : {}}
                whileTap={!(isSpeaking || isThinking) ? { scale: 0.95 } : {}}
                animate={isListening ? { scale: [1, 1.05, 1] } : {}}
                transition={isListening ? { duration: 0.8, repeat: Infinity } : { type: 'spring', stiffness: 400 }}
              >
                <Mic className="w-7 h-7" />
                {isListening && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-danger"
                    animate={{ scale: [1, 1.3], opacity: [0.8, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </motion.button>

              {/* Text Input */}
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Type or speak your message...'}
                disabled={isListening || isSpeaking || isThinking}
                className="flex-1 px-5 py-4 glass-strong rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-base text-gray-900 dark:text-white disabled:opacity-50 placeholder-gray-500 dark:placeholder-gray-400 bg-white/80 dark:bg-gray-800/80"
              />

              {/* Send Button */}
              <motion.button
                type="submit"
                disabled={!textInput.trim() || isSpeaking || isThinking}
                className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-br from-accent-500 to-primary-600 disabled:from-warm-400 disabled:to-warm-500 disabled:cursor-not-allowed text-white px-6 py-4 rounded-2xl font-semibold shadow-lg"
                whileHover={textInput.trim() && !isSpeaking && !isThinking ? { 
                  scale: 1.05, 
                  boxShadow: "0px 0px 20px rgba(90, 96, 248, 0.6)" 
                } : {}}
                whileTap={textInput.trim() && !isSpeaking && !isThinking ? { scale: 0.95 } : {}}
              >
                <Send size={18} />
                <span>Send</span>
              </motion.button>
            </form>

            {/* Status Indicator */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={isListening ? 'listening' : isSpeaking ? 'speaking' : 'idle'}
                className="mt-4 flex justify-center items-center gap-2 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                {isListening && (
                  <span className="flex items-center gap-2 text-danger dark:text-danger-light font-medium">
                    <motion.span 
                      className="w-2 h-2 bg-danger rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    Listening...
                  </span>
                )}
                {isSpeaking && (
                  <span className="flex items-center gap-2 text-success dark:text-success-light font-medium">
                    <motion.span 
                      className="w-2 h-2 bg-success rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    Speaking...
                  </span>
                )}
                {!isListening && !isSpeaking && !isThinking && (
                  <span className="text-gray-600 dark:text-gray-300">Tap mic to speak or type below</span>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="glass-card rounded-3xl p-6 sm:p-8 mb-6 shadow-xl border border-white/40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-5 flex items-center gap-2 tracking-tight">
            <Sparkles size={22} />
            <span>Try Asking Me About:</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { emoji: '💬', text: "How are you today?" },
              { emoji: '😢', text: "I'm feeling lonely" },
              { emoji: '✨', text: "Tell me something positive" },
              { emoji: '📋', text: "What are my reminders?" }
            ].map((prompt, index) => (
              <motion.button
                key={index}
                onClick={() => handleUserMessage(prompt.text, false)}
                className="glass-strong text-left px-5 py-4 rounded-2xl border border-white/30 text-sm sm:text-base font-medium text-gray-800 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400"
                whileHover={{ scale: 1.03, y: -2, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
              >
                <span className="text-xl mr-2">{prompt.emoji}</span>
                "{prompt.text}"
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Info Section */}
        <motion.div 
          className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl border border-white/40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2 tracking-tight">
            <motion.svg 
              className="h-6 w-6 text-accent-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </motion.svg>
            <span>About Your AI Guardian</span>
          </h3>
          <ul className="space-y-4 text-base text-gray-700 dark:text-gray-200">
            {[
              { emoji: '💝', title: 'Emotional Support', desc: 'I detect your emotions and respond with empathy and care.' },
              { emoji: '🧠', title: 'Context Memory', desc: 'I remember our recent conversations for better continuity.' },
              { emoji: '🎤', title: 'Voice & Text', desc: 'Speak naturally or type - I respond both ways!' },
              { emoji: '🔒', title: 'Private & Safe', desc: 'Our conversations stay between us - no data is sold or shared.' },
              { emoji: '🆓', title: 'Completely Free', desc: 'Powered by open-source AI - no subscriptions ever!' }
            ].map((feature, index) => (
              <motion.li 
                key={index}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
              >
                <span className="text-2xl flex-shrink-0">{feature.emoji}</span>
                <span>
                  <strong className="text-primary-600 dark:text-primary-400">{feature.title}:</strong> {feature.desc}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </main>
  )
}

export default AIGuardian

