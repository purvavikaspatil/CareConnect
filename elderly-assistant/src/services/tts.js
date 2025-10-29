/**
 * Google Cloud Text-to-Speech Service
 * Provides natural, human-like voice output with emotional modulation
 */

const GOOGLE_TTS_API_KEY = import.meta.env.VITE_GOOGLE_TTS_API_KEY
const GOOGLE_TTS_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize'

/**
 * Voice configurations for different emotions
 * Using Neural2 voices for maximum naturalness
 */
const VOICE_CONFIGS = {
  sad: {
    voice: 'en-US-Neural2-C',      // Warm female voice
    pitch: -3.5,                    // Lower, more soothing
    speakingRate: 0.80,             // Very slow, comforting
    gender: 'FEMALE'
  },
  lonely: {
    voice: 'en-US-Neural2-C',
    pitch: -3.0,
    speakingRate: 0.82,
    gender: 'FEMALE'
  },
  empathetic: {
    voice: 'en-US-Neural2-C',      // Caring female voice
    pitch: -2.5,                    // Gentle pitch
    speakingRate: 0.85,             // Slow, thoughtful
    gender: 'FEMALE'
  },
  happy: {
    voice: 'en-US-Neural2-F',      // Bright female voice
    pitch: 1.0,                     // Natural, pleasant
    speakingRate: 0.95,             // Normal pace
    gender: 'FEMALE'
  },
  urgent: {
    voice: 'en-US-Neural2-G',      // Clear, authoritative
    pitch: 0.0,                     // Normal, clear
    speakingRate: 1.05,             // Slightly faster
    gender: 'FEMALE'
  },
  neutral: {
    voice: 'en-US-Neural2-C',      // Warm, friendly
    pitch: -1.5,                    // Slightly lower, warm
    speakingRate: 0.88,             // Clear, comfortable
    gender: 'FEMALE'
  }
}

/**
 * Browser TTS fallback (improved from before)
 */
const fallbackSpeak = (text, emotion = 'neutral') => {
  if (!('speechSynthesis' in window)) {
    console.error('Speech synthesis not supported')
    return Promise.reject(new Error('Speech synthesis not supported'))
  }

  return new Promise((resolve, reject) => {
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Try to select best available voice
    const voices = window.speechSynthesis.getVoices()
    const warmVoice = voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Natural'))
    ) || voices.find(v => v.lang.startsWith('en-US'))
    
    if (warmVoice) {
      utterance.voice = warmVoice
    }

    // Emotion-based modulation
    const modulation = {
      sad: { pitch: 0.85, rate: 0.80 },
      lonely: { pitch: 0.85, rate: 0.82 },
      empathetic: { pitch: 0.88, rate: 0.85 },
      happy: { pitch: 1.05, rate: 0.95 },
      urgent: { pitch: 1.0, rate: 1.05 },
      neutral: { pitch: 0.92, rate: 0.88 }
    }

    const settings = modulation[emotion] || modulation.neutral
    utterance.pitch = settings.pitch
    utterance.rate = settings.rate
    utterance.volume = 0.98

    utterance.onend = resolve
    utterance.onerror = reject

    window.speechSynthesis.speak(utterance)
  })
}

/**
 * Speak text using Google Cloud TTS
 * Falls back to browser TTS if API key not configured or request fails
 * 
 * @param {string} text - Text to speak
 * @param {string} emotion - Emotion for voice modulation (sad, happy, empathetic, urgent, neutral)
 * @returns {Promise} - Resolves when speech is complete
 */
export const speak = async (text, emotion = 'neutral') => {
  // Check if API key is configured
  if (!GOOGLE_TTS_API_KEY || GOOGLE_TTS_API_KEY === 'your_api_key_here') {
    console.log('📢 Using browser TTS (Google Cloud TTS not configured)')
    return fallbackSpeak(text, emotion)
  }

  try {
    const config = VOICE_CONFIGS[emotion] || VOICE_CONFIGS.neutral

    // Call Google Cloud TTS API
    const response = await fetch(`${GOOGLE_TTS_URL}?key=${GOOGLE_TTS_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: 'en-US',
          name: config.voice,
          ssmlGender: config.gender
        },
        audioConfig: {
          audioEncoding: 'MP3',
          pitch: config.pitch,
          speakingRate: config.speakingRate,
          volumeGainDb: 0.0,
          effectsProfileId: ['headphone-class-device'] // Optimize for headphones
        }
      })
    })

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.audioContent) {
      throw new Error('No audio content received')
    }

    // Play the audio
    const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`)
    
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        console.log('🎤 Google TTS playback complete')
        resolve()
      }
      audio.onerror = (error) => {
        console.error('Audio playback error:', error)
        reject(error)
      }
      
      audio.play().catch(error => {
        console.error('Audio play error:', error)
        reject(error)
      })
    })

  } catch (error) {
    console.error('Google Cloud TTS error, falling back to browser TTS:', error)
    // Fallback to browser TTS
    return fallbackSpeak(text, emotion)
  }
}

/**
 * Check if Google Cloud TTS is available
 */
export const isGoogleTTSAvailable = () => {
  return GOOGLE_TTS_API_KEY && GOOGLE_TTS_API_KEY !== 'your_api_key_here'
}

/**
 * Get available voice names for debugging
 */
export const getAvailableVoices = () => {
  return Object.keys(VOICE_CONFIGS).map(emotion => ({
    emotion,
    voice: VOICE_CONFIGS[emotion].voice
  }))
}

export default speak

