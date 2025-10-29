import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import VoiceAssistant from '../components/VoiceAssistant'

function VoiceAssistantPage() {
  const navigate = useNavigate()

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  return (
    <main className="flex-grow px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-gradient-to-b from-purple-50 via-blue-50 to-white">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="text-4xl sm:text-5xl mb-3">🤗</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Your Caring Companion
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            I'm here to listen, understand, and help. Talk to me naturally about anything - 
            your feelings, your needs, or just to chat. I remember our conversations and care about you.
          </p>
        </div>

        {/* Voice Assistant Component */}
        <VoiceAssistant />

        {/* Emotional Intelligence Info */}
        <div className="mt-12 bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-purple-200 rounded-lg p-6 sm:p-8">
          <h3 className="text-lg sm:text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">💝</span>
            <span>I Understand Your Feelings</span>
          </h3>
          <div className="space-y-3 text-sm sm:text-base text-purple-800">
            <p className="flex items-start gap-2">
              <span className="text-purple-600 font-bold flex-shrink-0">•</span>
              <span><strong>Feeling lonely?</strong> Tell me, and I'll keep you company or help you connect with loved ones.</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-purple-600 font-bold flex-shrink-0">•</span>
              <span><strong>Not feeling well?</strong> I'll check your medication reminders and can alert your contacts.</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-purple-600 font-bold flex-shrink-0">•</span>
              <span><strong>Feeling happy?</strong> Share your joy with me! I love hearing about your good days.</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-purple-600 font-bold flex-shrink-0">•</span>
              <span><strong>Bored or restless?</strong> I'll suggest activities or help you organize your day.</span>
            </p>
          </div>
        </div>

        {/* Conversation Tips */}
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-6 sm:p-8">
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
            <span>How to Talk with Me</span>
          </h3>
          <ul className="space-y-3 text-sm sm:text-base text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold flex-shrink-0">💬</span>
              <span><strong>Speak naturally</strong> - Just talk like you're talking to a friend. I understand context and emotions.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold flex-shrink-0">🎭</span>
              <span><strong>Express your feelings</strong> - If you're sad, lonely, happy, or worried, tell me. I'll respond with care.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold flex-shrink-0">📝</span>
              <span><strong>I remember our chats</strong> - I keep track of what we talked about to give you better help.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold flex-shrink-0">🎤</span>
              <span><strong>Clear voice</strong> - Speak at normal pace in a quiet place for best results.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold flex-shrink-0">⌨️</span>
              <span><strong>Type if needed</strong> - Can't use voice? Just type your message in the text box.</span>
            </li>
          </ul>
        </div>

        {/* What I Can Do */}
        <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-lg p-6 sm:p-8">
          <h3 className="text-lg sm:text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">🌟</span>
            <span>What I Can Help With</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="font-semibold text-green-700 mb-1">📋 Reminders & Medications</p>
              <p className="text-sm text-gray-600">"Show my reminders" or "Add a medicine reminder"</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="font-semibold text-green-700 mb-1">👨‍👩‍👧‍👦 Contacts & Family</p>
              <p className="text-sm text-gray-600">"Show my contacts" or "Help me call someone"</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="font-semibold text-green-700 mb-1">🚨 Emergency Help</p>
              <p className="text-sm text-gray-600">"Help me!" or "I need emergency help"</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="font-semibold text-green-700 mb-1">💭 Emotional Support</p>
              <p className="text-sm text-gray-600">"I'm feeling lonely" or "I'm not feeling well"</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="font-semibold text-green-700 mb-1">👤 Account & Profile</p>
              <p className="text-sm text-gray-600">"Show my profile" or "Logout"</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="font-semibold text-green-700 mb-1">🏠 Navigation</p>
              <p className="text-sm text-gray-600">"Go home" or "Take me to..."</p>
            </div>
          </div>
        </div>

        {/* Emergency Note */}
        <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-lg p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl sm:text-3xl">🚨</div>
            <div>
              <h4 className="font-bold text-red-900 text-base sm:text-lg mb-2">
                Emergency Voice Activation
              </h4>
              <p className="text-red-800 text-sm sm:text-base">
                In an emergency, just say <strong>"Help me"</strong> or <strong>"Emergency"</strong> 
                and I'll immediately alert your emergency contacts with your location. Your safety is my priority.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            🔒 <strong>Privacy:</strong> Your voice is processed locally in your browser. 
            Conversations are stored only in memory and never sent to external servers 
            (except when you explicitly trigger actions like SOS alerts).
          </p>
        </div>
      </div>
    </main>
  )
}

export default VoiceAssistantPage
