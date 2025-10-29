import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const UnifiedAssistant = () => {
  const [messages, setMessages] = useState([])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [textInput, setTextInput] = useState('')
  const [userName, setUserName] = useState('Friend')
  const [currentEmotion, setCurrentEmotion] = useState('neutral')
  const [lastTopic, setLastTopic] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  
  const recognitionRef = useRef(null)
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize
  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      try {
        const userData = JSON.parse(user)
        setUserName(userData.name || 'Friend')
      } catch (e) {
        setUserName('Friend')
      }
    }

    // Welcome message
    const welcomeMsg = {
      role: 'assistant',
      content: `Hello ${userName}! I'm your caring AI companion. I can help you with tasks, listen to your feelings, or just chat. How are you feeling today?`,
      timestamp: new Date(),
      emotion: 'happy'
    }
    setMessages([welcomeMsg])

    // Initialize speech recognition
    initializeSpeechRecognition()
  }, [])

  // Initialize speech recognition
  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      const current = event.resultIndex
      const transcriptResult = event.results[current][0].transcript
      setTranscript(transcriptResult)

      if (event.results[current].isFinal) {
        handleUserInput(transcriptResult, true)
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

  // Check if message is a command (task to perform)
  const isCommand = (text) => {
    const lowerText = text.toLowerCase()
    return (
      lowerText.includes('show') ||
      lowerText.includes('open') ||
      lowerText.includes('add') ||
      lowerText.includes('help me') ||
      lowerText.includes('emergency') ||
      lowerText.includes('sos') ||
      lowerText.includes('remind') ||
      lowerText.includes('contact') ||
      lowerText.includes('logout') ||
      lowerText.includes('go to')
    )
  }

  // Execute command and return response
  const executeCommand = async (text, emotion) => {
    const lowerText = text.toLowerCase()

    // Emergency/SOS
    if (lowerText.includes('help me') || lowerText.includes('emergency') || lowerText.includes('sos')) {
      const response = `${userName}, I'm immediately sending an emergency alert to your contacts! Help is on the way. Stay calm, you're not alone.`
      addMessage('assistant', response, 'urgent')
      await speak(response, 'urgent')
      setTimeout(() => {
        navigate('/help')
        setTimeout(() => triggerSOS(), 500)
      }, 2000)
      return true
    }

    // Show reminders
    if (lowerText.includes('reminder') || lowerText.includes('medicine') || lowerText.includes('medication')) {
      const response = `Opening your reminders now, ${userName}. Let me show you what you have scheduled.`
      addMessage('assistant', response, 'neutral')
      await speak(response, 'neutral')
      setTimeout(() => navigate('/reminders'), 1500)
      return true
    }

    // Show contacts
    if (lowerText.includes('contact') || lowerText.includes('family')) {
      const response = `Opening your emergency contacts, ${userName}. These are the people who care about you.`
      addMessage('assistant', response, 'neutral')
      await speak(response, 'neutral')
      setTimeout(() => navigate('/contacts'), 1500)
      return true
    }

    // Talk to a friend
    if (lowerText.includes('friend') || lowerText.includes('talk to someone')) {
      const response = `Let me help you connect with a friend, ${userName}. Opening the friend connection page now.`
      addMessage('assistant', response, 'happy')
      await speak(response, 'happy')
      setTimeout(() => navigate('/friends'), 1500)
      return true
    }

    // Logout
    if (lowerText.includes('logout') || lowerText.includes('sign out')) {
      const response = `Logging you out, ${userName}. Take care, and I'll be here whenever you need me!`
      addMessage('assistant', response, 'neutral')
      await speak(response, 'neutral')
      setTimeout(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      }, 2000)
      return true
    }

    return false
  }

  // Trigger SOS
  const triggerSOS = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            await axios.post('http://localhost:5000/api/sos', {
              message: 'Emergency! Voice-activated SOS alert!',
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            }, {
              headers: { Authorization: `Bearer ${token}` }
            })
          },
          async () => {
            await axios.post('http://localhost:5000/api/sos', {
              message: 'Emergency! Voice-activated SOS alert!',
              latitude: null,
              longitude: null
            }, {
              headers: { Authorization: `Bearer ${token}` }
            })
          }
        )
      }
    } catch (error) {
      console.error('Error triggering SOS:', error)
    }
  }

  // Speak with emotion
  const speak = (text, emotion = 'neutral') => {
    if (!('speechSynthesis' in window)) {
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      
      const voices = window.speechSynthesis.getVoices()
      const voice = voices.find(v => 
        v.lang.startsWith('en') && 
        (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Natural'))
      ) || voices.find(v => v.lang.startsWith('en-US'))
      
      if (voice) utterance.voice = voice

      switch (emotion) {
        case 'sad':
        case 'unwell':
          utterance.pitch = 0.8
          utterance.rate = 0.85
          break
        case 'happy':
          utterance.pitch = 1.05
          utterance.rate = 0.95
          break
        case 'urgent':
          utterance.pitch = 1.0
          utterance.rate = 1.05
          break
        default:
          utterance.pitch = 0.92
          utterance.rate = 0.90
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

  // Add message to chat
  const addMessage = (role, content, emotion = 'neutral') => {
    const msg = {
      role,
      content,
      timestamp: new Date(),
      emotion
    }
    setMessages(prev => [...prev, msg])
  }

  // Handle user input (voice or text)
  const handleUserInput = async (message, isVoice = false) => {
    if (!message.trim()) return

    const emotion = detectEmotion(message)
    setCurrentEmotion(emotion)

    // Add user message
    addMessage('user', message, emotion)
    setTranscript('')
    setTextInput('')

    // Check if it's a command
    const wasCommand = await executeCommand(message, emotion)
    
    if (!wasCommand) {
      // Get AI response for conversation
      setIsThinking(true)

      try {
        const token = localStorage.getItem('token')
        const recentHistory = messages.slice(-5).map(msg => ({
          role: msg.role,
          content: msg.content
        }))

        const response = await axios.post(
          'http://localhost:5000/api/ai/respond',
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
          addMessage('assistant', aiReply, emotion)
          setIsThinking(false)
          await speak(aiReply, emotion)
        }
      } catch (error) {
        console.error('Error getting AI response:', error)
        
        const fallbackMsg = `I'm here with you, ${userName}. How can I help you today?`
        addMessage('assistant', fallbackMsg, 'neutral')
        setIsThinking(false)
        await speak(fallbackMsg, 'neutral')
      }
    }
  }

  // Toggle listening
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      recognitionRef.current?.start()
      setIsListening(true)
    }
  }

  // Handle text submit
  const handleTextSubmit = (e) => {
    e.preventDefault()
    if (textInput.trim()) {
      handleUserInput(textInput, false)
    }
  }

  // Get emotion icon
  const getEmotionIcon = (emotion) => {
    const icons = {
      sad: '😢',
      happy: '😊',
      tired: '😴',
      unwell: '🤒',
      urgent: '🚨',
      neutral: '💭'
    }
    return icons[emotion] || '💭'
  }

  return (
    <div className={`transition-all duration-300 ${isExpanded ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <div className={`${isExpanded ? 'h-full flex flex-col' : ''}`}>
        {/* Compact Mode (on Home Page) */}
        {!isExpanded && (
          <div className="bg-gradient-to-r from-purple-100 via-blue-100 to-pink-100 rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-purple-200">
            <div className="text-center mb-6">
              <div className="text-5xl sm:text-6xl mb-3 animate-bounce">🤖💝</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Your AI Companion
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                I can help with tasks, listen to your feelings, and keep you company
              </p>
            </div>

            {/* Microphone Button */}
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={toggleListening}
                disabled={isSpeaking || isThinking}
                className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 border-4 border-white shadow-2xl ${
                  isListening
                    ? 'bg-red-500 animate-pulse shadow-red-500/50 scale-110'
                    : 'bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:scale-105'
                } ${(isSpeaking || isThinking) ? 'opacity-50 cursor-not-allowed' : ''} text-white`}
              >
                <div className="text-center">
                  <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm sm:text-base font-semibold mt-2">
                    {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : isThinking ? 'Thinking...' : 'Tap to Talk'}
                  </p>
                </div>
              </button>

              {/* Live Transcript */}
              {transcript && (
                <div className="bg-white rounded-xl p-3 sm:p-4 shadow-lg border-2 border-purple-300 max-w-md">
                  <p className="text-purple-900 text-sm sm:text-base text-center">
                    "{transcript}"
                  </p>
                </div>
              )}

              {/* Expand Button */}
              <button
                onClick={() => setIsExpanded(true)}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm sm:text-base flex items-center gap-2"
              >
                <span>Open Full Chat</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>

            {/* Quick Suggestions */}
            <div className="mt-6 grid grid-cols-2 gap-2 sm:gap-3">
              <button
                onClick={() => handleUserInput("I'm feeling lonely", false)}
                className="bg-white hover:bg-purple-50 text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-purple-200 transition-colors text-xs sm:text-sm"
              >
                😢 "I'm feeling lonely"
              </button>
              <button
                onClick={() => handleUserInput("Show my reminders", false)}
                className="bg-white hover:bg-purple-50 text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-purple-200 transition-colors text-xs sm:text-sm"
              >
                📋 "Show reminders"
              </button>
              <button
                onClick={() => handleUserInput("Talk to a friend", false)}
                className="bg-white hover:bg-purple-50 text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-purple-200 transition-colors text-xs sm:text-sm"
              >
                💬 "Talk to a friend"
              </button>
              <button
                onClick={() => handleUserInput("How are you?", false)}
                className="bg-white hover:bg-purple-50 text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-purple-200 transition-colors text-xs sm:text-sm"
              >
                👋 "How are you?"
              </button>
            </div>
          </div>
        )}

        {/* Expanded Mode (Full Screen Chat) */}
        {isExpanded && (
          <div className="flex-grow flex flex-col h-full bg-gradient-to-b from-purple-50 to-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 sm:p-6 shadow-lg">
              <div className="flex items-center justify-between max-w-4xl mx-auto">
                <div className="flex items-center gap-3">
                  <div className="text-3xl sm:text-4xl">🤖💝</div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">AI Companion</h2>
                    <p className="text-xs sm:text-sm opacity-90">Always here for you, {userName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4 max-w-4xl mx-auto w-full">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-2 sm:gap-3`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-lg sm:text-xl">
                      🤖
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 sm:px-5 py-3 sm:py-4 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none shadow-md border border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-1">
                      <span className="text-sm sm:text-base">{getEmotionIcon(msg.emotion)}</span>
                      <p className="text-sm sm:text-base leading-relaxed flex-1">{msg.content}</p>
                    </div>
                    <p className={`text-xs mt-1 ${msg.role === 'user' ? 'opacity-70' : 'text-gray-500'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {msg.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg sm:text-xl">
                      👤
                    </div>
                  )}
                </div>
              ))}

              {isThinking && (
                <div className="flex justify-start items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xl">
                    🤖
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-none px-5 py-4 shadow-md">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t-2 border-gray-200 bg-white p-4 sm:p-6">
              <div className="max-w-4xl mx-auto">
                {transcript && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-2 mb-3">
                    <p className="text-sm text-purple-800">🎤 "{transcript}"</p>
                  </div>
                )}

                <form onSubmit={handleTextSubmit} className="flex gap-2 sm:gap-3 items-center">
                  <button
                    type="button"
                    onClick={toggleListening}
                    disabled={isSpeaking || isThinking}
                    className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isListening
                        ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50'
                        : 'bg-purple-600 hover:bg-purple-700'
                    } ${(isSpeaking || isThinking) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} text-white`}
                  >
                    <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                  </button>

                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={isListening ? 'Listening...' : 'Type or speak your message...'}
                    disabled={isListening || isSpeaking || isThinking}
                    className="flex-1 px-4 sm:px-6 py-3 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-base disabled:bg-gray-100"
                  />

                  <button
                    type="submit"
                    disabled={!textInput.trim() || isSpeaking || isThinking}
                    className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 sm:px-6 py-3 rounded-full font-semibold transition-colors"
                  >
                    Send
                  </button>
                </form>

                <p className="text-xs text-center text-gray-500 mt-3">
                  {isListening && '🔴 Listening...'}
                  {isSpeaking && '💬 Speaking...'}
                  {isThinking && '🤔 Thinking...'}
                  {!isListening && !isSpeaking && !isThinking && 'Tap mic to speak or type your message'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UnifiedAssistant

