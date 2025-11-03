import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { speak as googleSpeak, isGoogleTTSAvailable } from '../services/tts'

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [lastCommand, setLastCommand] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isSupported, setIsSupported] = useState(true)
  
  // Context and emotional intelligence
  const [userName, setUserName] = useState('')
  const [lastTopic, setLastTopic] = useState('')
  const [lastEmotion, setLastEmotion] = useState('neutral')
  const [conversationHistory, setConversationHistory] = useState([])
  const [textInput, setTextInput] = useState('')
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [availableVoices, setAvailableVoices] = useState([])
  
  const recognitionRef = useRef(null)
  const navigate = useNavigate()

  // Load user info and initialize voices
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

    // Load available voices with better selection for warmth
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      setAvailableVoices(voices)
      
      // Prioritize warm, natural voices for empathy
      // Priority order: Google US Female > Microsoft Natural > Enhanced > Female > Any English
      const warmVoicePatterns = [
        // Google voices are generally more natural
        (v) => v.lang.startsWith('en-US') && v.name.includes('Google') && v.name.includes('Female'),
        (v) => v.lang.startsWith('en') && v.name.includes('Google') && v.name.includes('US'),
        (v) => v.lang.startsWith('en') && v.name.includes('Google'),
        // Microsoft natural voices
        (v) => v.name.includes('Natural') && v.name.includes('Female'),
        (v) => v.name.includes('Natural'),
        // Enhanced or premium voices
        (v) => v.name.includes('Enhanced') || v.name.includes('Premium'),
        // Female voices tend to sound warmer for care
        (v) => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Woman')),
        (v) => v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Victoria')),
        // Any English voice as fallback
        (v) => v.lang.startsWith('en-US'),
        (v) => v.lang.startsWith('en'),
      ]
      
      let selectedVoice = null
      for (const pattern of warmVoicePatterns) {
        selectedVoice = voices.find(pattern)
        if (selectedVoice) break
      }
      
      setSelectedVoice(selectedVoice || voices[0])
      
      // Log selected voice for debugging
      if (selectedVoice) {
        console.log('🎤 Selected voice:', selectedVoice.name, '(', selectedVoice.lang, ')')
      }
    }

    loadVoices()
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  // Check browser support and initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setIsSupported(false)
      setFeedback('Voice recognition is not supported in this browser. Please use Chrome or Edge, or try the text input below.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setFeedback("I'm listening... Please speak to me.")
    }

    recognition.onresult = (event) => {
      const current = event.resultIndex
      const transcriptResult = event.results[current][0].transcript
      setTranscript(transcriptResult)

      if (event.results[current].isFinal) {
        setIsListening(false)
        setIsThinking(true)
        processConversation(transcriptResult)
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      setIsThinking(false)
      
      if (event.error === 'no-speech') {
        setFeedback("I didn't hear anything. Please try again or use text input below.")
      } else if (event.error === 'not-allowed') {
        setFeedback('Microphone access denied. Please allow microphone access or use text input.')
      } else {
        setFeedback(`Error: ${event.error}. Please try again or use text input.`)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  // Emotion detection from text
  const detectEmotion = (text) => {
    const lowerText = text.toLowerCase()
    
    // Sad/Lonely emotions
    if (lowerText.match(/\b(sad|lonely|alone|depressed|down|blue|upset|unhappy|worried|anxious|scared|afraid)\b/)) {
      return 'sad'
    }
    // Happy emotions
    if (lowerText.match(/\b(happy|great|wonderful|excited|joyful|good|fantastic|amazing|love|loved)\b/)) {
      return 'happy'
    }
    // Bored/Neutral
    if (lowerText.match(/\b(bored|nothing|tired|okay|fine|alright)\b/)) {
      return 'bored'
    }
    // Pain/Sick
    if (lowerText.match(/\b(pain|hurt|sick|ill|unwell|ache|hurts)\b/)) {
      return 'unwell'
    }
    
    return 'neutral'
  }

  // Enhanced text-to-speech using Google Cloud TTS (falls back to browser TTS)
  const speak = async (text, emotion = 'neutral') => {
    setIsSpeaking(true)
    setIsThinking(false)
    
    try {
      await googleSpeak(text, emotion)
    } catch (error) {
      console.error('Speech error:', error)
    } finally {
      setIsSpeaking(false)
    }
  }

  // Get empathetic response based on emotion
  const getEmpatheticResponse = (emotion, topic = '') => {
    const responses = {
      sad: [
        `I'm so sorry you're feeling this way, ${userName}. Remember, I'm here with you. Would you like me to check your reminders to help keep your mind occupied?`,
        `${userName}, it's okay to feel sad sometimes. Would you like to talk about it, or shall I help you with something to brighten your day?`,
        `I understand, ${userName}. You're not alone. I'm here to help. Would you like me to show you your contacts so you can reach out to someone?`,
      ],
      lonely: [
        `I'm here with you, ${userName}. You're never truly alone. Would you like me to help you call one of your contacts, or check your reminders?`,
        `${userName}, feeling lonely is difficult. Remember, your loved ones care about you. Shall I show you your contacts?`,
      ],
      happy: [
        `That's wonderful to hear, ${userName}! I'm so glad you're feeling good today! What would you like to do?`,
        `${userName}, your happiness makes me happy too! How can I help you today?`,
      ],
      bored: [
        `${userName}, let's find something interesting to do! Would you like to check your reminders, or maybe I can help you with something else?`,
        `I understand, ${userName}. Sometimes we all need a little something to do. How about checking what's on your schedule today?`,
      ],
      unwell: [
        `I'm sorry you're not feeling well, ${userName}. Have you taken your medication today? Shall I check your reminders?`,
        `${userName}, it's important to take care of yourself. Would you like me to alert your emergency contacts, or check your medicine reminders?`,
      ],
    }
    
    const emotionResponses = responses[emotion] || [
      `I hear you, ${userName}. How can I help you today?`,
    ]
    
    return emotionResponses[Math.floor(Math.random() * emotionResponses.length)]
  }

  // Process conversation with context and empathy
  const processConversation = (text) => {
    const lowerText = text.toLowerCase().trim()
    setLastCommand(text)
    setTranscript('')
    
    // Detect emotion
    const emotion = detectEmotion(text)
    setLastEmotion(emotion)
    
    // Add to conversation history
    setConversationHistory(prev => [...prev, { user: text, emotion, timestamp: new Date() }])
    
    // Emotional responses
    if (emotion === 'sad' || lowerText.includes('lonely') || lowerText.includes('alone')) {
      const response = getEmpatheticResponse(emotion === 'sad' ? 'sad' : 'lonely')
      setFeedback(response)
      speak(response, 'empathetic')
      setLastTopic('emotional_support')
      return
    }
    
    if (emotion === 'happy') {
      const response = getEmpatheticResponse('happy')
      setFeedback(response)
      speak(response, 'happy')
      setLastTopic('positive_mood')
      return
    }
    
    if (emotion === 'bored') {
      const response = getEmpatheticResponse('bored')
      setFeedback(response)
      speak(response, 'neutral')
      setLastTopic('boredom')
      return
    }
    
    if (emotion === 'unwell') {
      const response = getEmpatheticResponse('unwell')
      setFeedback(response)
      speak(response, 'empathetic')
      setLastTopic('health_concern')
      return
    }
    
    // Conversational context - follow-ups
    if (lowerText.match(/\b(yes|yeah|sure|okay|yep|please)\b/) && lastTopic) {
      handleFollowUpResponse(lastTopic)
      return
    }
    
    // Greeting with context
    if (lowerText.match(/\b(hi|hello|hey|good morning|good afternoon|good evening)\b/)) {
      const greeting = `Hello ${userName}! It's wonderful to hear from you. How are you feeling today?`
      setFeedback(greeting)
      speak(greeting, 'happy')
      setLastTopic('greeting')
      return
    }
    
    // How are you?
    if (lowerText.match(/\b(how are you|how're you|what's up|wassup)\b/)) {
      const response = `I'm doing great, ${userName}! Thank you for asking. More importantly, how are YOU feeling today?`
      setFeedback(response)
      speak(response, 'happy')
      setLastTopic('check_in')
      return
    }
    
    // Thank you
    if (lowerText.match(/\b(thank you|thanks|thank|appreciate)\b/)) {
      const response = `You're very welcome, ${userName}! I'm always here to help you. Is there anything else you need?`
      setFeedback(response)
      speak(response, 'happy')
      return
    }
    
    // Show reminders / medication
    if (lowerText.includes('reminder') || lowerText.includes('medicine') || lowerText.includes('medication') || lowerText.includes('med') || lowerText.includes('pills')) {
      setFeedback(`Opening your reminders, ${userName}...`)
      speak(`Let me show you your reminders, ${userName}. I'll read them out for you when the page loads.`, 'neutral')
      setLastTopic('reminders')
      setTimeout(() => navigate('/reminders'), 1500)
      return
    }
    
    // Add reminder
    if (lowerText.includes('add') && (lowerText.includes('reminder') || lowerText.includes('medicine'))) {
      const response = `Okay ${userName}, I'm opening the reminder form. You can add a new reminder for your medication or appointment.`
      setFeedback(response)
      speak(response, 'neutral')
      setLastTopic('add_reminder')
      setTimeout(() => navigate('/reminders'), 1500)
      return
    }
    
    // Show contacts
    if (lowerText.includes('contact') || lowerText.includes('family') || lowerText.includes('call someone')) {
      const response = `Opening your emergency contacts, ${userName}. These are the people who care about you.`
      setFeedback(response)
      speak(response, 'neutral')
      setLastTopic('contacts')
      setTimeout(() => navigate('/contacts'), 1500)
      return
    }
    
    // Help/Emergency/SOS
    if (lowerText.includes('help') || lowerText.includes('emergency') || lowerText.includes('sos') || lowerText.includes('danger')) {
      const response = `${userName}, I'm sending an emergency alert to your contacts right now! Help is on the way. Stay calm, you're not alone.`
      setFeedback('⚠️ EMERGENCY ALERT ACTIVATED!')
      speak(response, 'urgent')
      setLastTopic('emergency')
      setTimeout(() => {
        navigate('/help')
        setTimeout(() => triggerSOS(), 500)
      }, 2000)
      return
    }
    
    // Go home
    if (lowerText.includes('home') || lowerText.includes('main page')) {
      const response = `Taking you to the home page, ${userName}.`
      setFeedback(response)
      speak(response, 'neutral')
      setTimeout(() => navigate('/'), 1000)
      return
    }
    
    // Profile
    if (lowerText.includes('profile') || lowerText.includes('account') || lowerText.includes('my information')) {
      const response = `Opening your profile, ${userName}.`
      setFeedback(response)
      speak(response, 'neutral')
      setTimeout(() => navigate('/profile'), 1000)
      return
    }
    
    // Logout
    if (lowerText.includes('logout') || lowerText.includes('log out') || lowerText.includes('sign out')) {
      const response = `Logging you out, ${userName}. Take care, and I'll see you soon!`
      setFeedback(response)
      speak(response, 'neutral')
      setTimeout(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      }, 2000)
      return
    }
    
    // Weather (placeholder for future)
    if (lowerText.includes('weather')) {
      const response = `I'm sorry ${userName}, I can't check the weather yet, but I'm learning! For now, you can check your phone's weather app.`
      setFeedback(response)
      speak(response, 'neutral')
      return
    }
    
    // Tell a story (placeholder)
    if (lowerText.includes('story') || lowerText.includes('tell me')) {
      const response = `${userName}, I'd love to tell you a story! Once upon a time, there was a wise and kind person just like you. They were loved by everyone around them. Remember, you are special and cared for!`
      setFeedback(response)
      speak(response, 'neutral')
      setLastTopic('story')
      return
    }
    
    // Unknown command - empathetic fallback
    const fallbackResponses = [
      `I'm not sure I understood that, ${userName}. Could you try saying it differently? Or you can ask me to show reminders, contacts, or get help.`,
      `${userName}, I want to help but I didn't quite catch that. You can say things like "show my reminders" or "I need help".`,
      `I'm still learning, ${userName}. Try asking about your reminders, contacts, or say "help me" if you need emergency assistance.`,
    ]
    const fallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
    setFeedback(fallback)
    speak(fallback, 'neutral')
  }

  // Handle follow-up responses based on context
  const handleFollowUpResponse = (topic) => {
    switch (topic) {
      case 'emotional_support':
      case 'boredom':
        navigate('/reminders')
        speak(`Okay, let me show you your reminders, ${userName}.`, 'neutral')
        break
      case 'health_concern':
        navigate('/reminders')
        speak(`Let's check your medication reminders, ${userName}.`, 'empathetic')
        break
      default:
        speak(`Okay, ${userName}! How else can I help you?`, 'happy')
    }
    setLastTopic('')
  }

  // Trigger SOS alert programmatically
  const triggerSOS = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            await sendSOSAlert(token, {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            })
          },
          async () => {
            await sendSOSAlert(token, null)
          }
        )
      } else {
        await sendSOSAlert(token, null)
      }
    } catch (error) {
      console.error('Error triggering SOS:', error)
    }
  }

  const sendSOSAlert = async (token, locationData) => {
    try {
      const alertPayload = {
        message: 'Emergency! Voice-activated SOS alert!',
        latitude: locationData ? locationData.latitude : null,
        longitude: locationData ? locationData.longitude : null,
        accuracy: locationData ? locationData.accuracy : null
      }

      await axios.post('http://localhost:5000/api/sos', alertPayload, {
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch (error) {
      console.error('Error sending SOS:', error)
    }
  }

  // Toggle listening
  const toggleListening = () => {
    if (!isSupported) return

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      setFeedback('Stopped listening')
    } else {
      setTranscript('')
      setFeedback('')
      recognitionRef.current?.start()
    }
  }

  // Handle text input submission
  const handleTextSubmit = (e) => {
    e.preventDefault()
    if (textInput.trim()) {
      setIsThinking(true)
      processConversation(textInput)
      setTextInput('')
    }
  }

  // Get current state label
  const getStateLabel = () => {
    if (isListening) return 'Listening...'
    if (isThinking) return 'Thinking...'
    if (isSpeaking) return 'Talking...'
    return 'Tap to Speak'
  }

  // Get state color
  const getStateColor = () => {
    if (isListening) return 'bg-red-500 animate-pulse shadow-2xl shadow-red-500/50'
    if (isThinking) return 'bg-yellow-500 animate-pulse shadow-xl shadow-yellow-500/30'
    if (isSpeaking) return 'bg-green-500 animate-pulse shadow-xl shadow-green-500/30'
    return 'bg-blue-600 hover:bg-blue-700 shadow-xl'
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8">
      {/* Companion Icon */}
      <div className="text-6xl sm:text-7xl mb-4">
        {isListening && '👂'}
        {isThinking && '🤔'}
        {isSpeaking && '💬'}
        {!isListening && !isThinking && !isSpeaking && '🤗'}
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
        {userName && `Hello, ${userName}!`}
      </h2>

      {/* Main Microphone Button */}
      <button
        onClick={toggleListening}
        disabled={!isSupported || isSpeaking || isThinking}
        className={`
          relative w-40 h-40 sm:w-48 sm:h-48 rounded-full 
          ${getStateColor()}
          ${!isSupported || isSpeaking || isThinking ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
          transition-all duration-300 ease-in-out
          flex items-center justify-center
          focus:outline-none focus:ring-4 focus:ring-blue-300
          border-4 border-white
        `}
      >
        <div className="text-white text-center">
          <svg
            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm sm:text-base font-semibold mt-2">{getStateLabel()}</p>
        </div>
      </button>

      {/* Live Transcript */}
      {transcript && (
        <div className="mt-8 bg-blue-50 border-2 border-blue-300 rounded-lg p-4 sm:p-6 max-w-md w-full animate-fade-in">
          <p className="text-blue-900 text-center text-base sm:text-lg">
            "{transcript}"
          </p>
        </div>
      )}

      {/* Feedback Message */}
      {feedback && (
        <div className={`mt-6 rounded-lg p-4 sm:p-5 max-w-md w-full ${
          feedback.includes('⚠️') || feedback.includes('EMERGENCY')
            ? 'bg-red-50 border-2 border-red-300 text-red-700'
            : feedback.includes('Error') || feedback.includes('not understood')
            ? 'bg-yellow-50 border-2 border-yellow-300 text-yellow-800'
            : 'bg-green-50 border-2 border-green-300 text-green-700'
        }`}>
          <p className="text-sm sm:text-base">{feedback}</p>
        </div>
      )}

      {/* Last Emotion Badge */}
      {lastEmotion !== 'neutral' && (
        <div className="mt-4 flex items-center gap-2 text-gray-600">
          <span className="text-xs sm:text-sm">
            Detected mood: <span className="font-semibold capitalize">{lastEmotion}</span>
          </span>
        </div>
      )}

      {/* TTS Status Indicator */}
      <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-500">
        {isGoogleTTSAvailable() ? (
          <>
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Premium Voice (Google Cloud TTS)</span>
          </>
        ) : (
          <>
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>Browser Voice</span>
          </>
        )}
      </div>

      {/* Text Input Fallback */}
      <div className="mt-8 w-full max-w-md">
        <form onSubmit={handleTextSubmit} className="flex gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Or type your message here..."
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base text-gray-900 placeholder:text-gray-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Send
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">
          You can also type if voice isn't working
        </p>
      </div>

      {/* Conversation Examples */}
      <div className="mt-10 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-5 sm:p-6 max-w-2xl w-full">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 text-center">
          💬 Talk to me naturally!
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-sm sm:text-base text-gray-700">"I'm feeling lonely today"</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-sm sm:text-base text-gray-700">"Show me my reminders"</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-sm sm:text-base text-gray-700">"I need help!"</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-sm sm:text-base text-gray-700">"How are you doing?"</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-sm sm:text-base text-gray-700">"I'm not feeling well"</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-sm sm:text-base text-gray-700">"Add a reminder"</p>
          </div>
        </div>
      </div>

      {/* Browser Support Warning */}
      {!isSupported && (
        <div className="mt-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 max-w-md w-full">
          <p className="text-yellow-800 text-center text-sm sm:text-base">
            ⚠️ Voice recognition is not supported. Please use the text input above.
          </p>
        </div>
      )}
    </div>
  )
}

export default VoiceAssistant
