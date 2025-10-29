const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const User = require('../models/User');
const Reminder = require('../models/Reminder');
const Contact = require('../models/Contact');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Call Hugging Face Inference API (FREE - no key needed for small requests)
 * Using Mistral-7B or similar open models
 */
const getHuggingFaceResponse = async (prompt) => {
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 150,
            temperature: 0.7,
            top_p: 0.95,
            return_full_text: false
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data && data[0] && data[0].generated_text) {
      return data[0].generated_text.trim();
    }
    
    throw new Error('No response from HuggingFace');
  } catch (error) {
    console.log('⚠️  HuggingFace API error:', error.message);
    throw error;
  }
};

/**
 * Call local Ollama (if installed)
 */
const getOllamaResponse = async (prompt) => {
  try {
    const { stdout } = await execPromise(`ollama run mistral "${prompt.replace(/"/g, '\\"')}"`);
    return stdout.trim();
  } catch (error) {
    console.log('⚠️  Ollama not available:', error.message);
    throw error;
  }
};

/**
 * Fallback: Rule-based empathetic responses
 */
const getFallbackResponse = (message, emotion, userName, context) => {
  const lowerMessage = message.toLowerCase();

  // Emotional support responses
  if (emotion === 'sad' || lowerMessage.includes('lonely')) {
    const responses = [
      `I'm so sorry you're feeling this way, ${userName}. Remember, you're never truly alone - I'm here with you, and your loved ones care deeply about you. Would you like me to help you connect with someone?`,
      `${userName}, I understand how difficult loneliness can be. You have people who care about you. Would you like to talk about what's on your mind, or shall I help you with your reminders?`,
      `Dear ${userName}, I'm here to listen and support you. Feeling lonely is hard, but remember - this feeling will pass, and you have people in your life who love you. How can I help you feel better today?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  if (lowerMessage.includes('pain') || lowerMessage.includes('hurt') || lowerMessage.includes('sick')) {
    return `I'm concerned about you, ${userName}. If you're in pain or feeling unwell, it's important to take care of yourself. Have you taken your medication? Should I check your reminders, or would you like me to alert your emergency contacts?`;
  }

  if (lowerMessage.includes('reminder') || lowerMessage.includes('medicine') || lowerMessage.includes('medication')) {
    return `Of course, ${userName}! I can help you with your reminders. Let me check what you have scheduled. You can also ask me to add a new reminder if you need.`;
  }

  if (lowerMessage.includes('thank')) {
    return `You're very welcome, ${userName}! I'm always here to help and support you. Your kindness means a lot to me. Is there anything else you'd like to talk about?`;
  }

  if (lowerMessage.includes('how are you')) {
    return `I'm doing wonderfully, ${userName}! Thank you for asking. But more importantly, how are YOU feeling today? I'm here to listen and help with whatever you need.`;
  }

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return `Hello, ${userName}! It's wonderful to hear from you today. I'm your AI Guardian, here to chat, help, and keep you company. How are you feeling?`;
  }

  // General conversation
  const generalResponses = [
    `That's interesting, ${userName}. Tell me more about that. I'm here to listen.`,
    `I hear you, ${userName}. How does that make you feel? Remember, I'm always here if you need to talk.`,
    `Thank you for sharing that with me, ${userName}. You can always talk to me about anything. What else is on your mind?`
  ];

  return generalResponses[Math.floor(Math.random() * generalResponses.length)];
};

// @route   POST /api/ai/respond
// @desc    Get AI response for user message
// @access  Private
router.post('/respond', authMiddleware, async (req, res) => {
  try {
    const { message, emotion, conversationHistory } = req.body;

    console.log('\n🤖 AI GUARDIAN REQUEST');
    console.log('👤 User:', req.user.name);
    console.log('💬 Message:', message);
    console.log('😊 Emotion:', emotion || 'neutral');

    // Get user context
    const user = await User.findById(req.user.id);
    const reminders = await Reminder.find({ userId: req.user.id }).limit(3);
    const contacts = await Contact.find({ userId: req.user.id }).limit(2);

    // Build context for AI
    const userContext = `
User: ${user.name}
Hobbies: ${user.hobbies?.join(', ') || 'Not specified'}
Interests: ${user.interests?.join(', ') || 'Not specified'}
Current emotion: ${emotion || 'neutral'}
Upcoming reminders: ${reminders.length > 0 ? reminders.map(r => r.title).join(', ') : 'None'}
Emergency contacts: ${contacts.length > 0 ? contacts.map(c => c.name).join(', ') : 'None'}
`.trim();

    // Build conversation context
    const conversationContext = conversationHistory && conversationHistory.length > 0
      ? `Recent conversation:\n${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`
      : '';

    // Create AI prompt
    const prompt = `You are CareGuardian, a warm, empathetic AI companion for elderly users. You provide emotional support, companionship, and helpful assistance.

${userContext}

${conversationContext}

Guidelines:
- Be warm, caring, and grandmotherly/grandfatherly
- Keep responses short (2-3 sentences max for speech)
- Show genuine empathy and concern
- Offer specific help when appropriate
- Never be cold or clinical
- Use the user's name naturally
- If they're sad/lonely, offer comfort and connection
- If they mention health, show concern and suggest checking reminders
- Be conversational and friendly

User message: ${message}

Respond with warmth and care:`;

    let aiReply = '';

    // Try methods in order: HuggingFace → Ollama → Fallback
    try {
      // Try HuggingFace first
      console.log('🔄 Trying Hugging Face API...');
      aiReply = await getHuggingFaceResponse(prompt);
      console.log('✅ Got response from HuggingFace');
    } catch (hfError) {
      try {
        // Try Ollama if installed
        console.log('🔄 Trying Ollama...');
        aiReply = await getOllamaResponse(prompt);
        console.log('✅ Got response from Ollama');
      } catch (ollamaError) {
        // Use fallback rule-based responses
        console.log('🔄 Using fallback responses...');
        aiReply = getFallbackResponse(message, emotion, user.name, userContext);
        console.log('✅ Using rule-based response');
      }
    }

    // Clean up the response
    aiReply = aiReply
      .replace(/^(CareGuardian:|Assistant:|AI:)/i, '')
      .trim();

    // Limit length for speech
    const sentences = aiReply.split(/[.!?]+/);
    if (sentences.length > 3) {
      aiReply = sentences.slice(0, 3).join('. ') + '.';
    }

    console.log('💬 AI Reply:', aiReply.substring(0, 100) + '...');
    console.log('─'.repeat(60) + '\n');

    res.json({
      success: true,
      reply: aiReply,
      emotion: emotion,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('AI Response Error:', error);
    
    // Even on error, provide a compassionate fallback
    const fallbackReply = `I apologize, ${req.user.name}, I'm having a little trouble right now. But I'm still here with you. How can I help you today?`;
    
    res.json({
      success: true,
      reply: fallbackReply,
      emotion: 'neutral',
      timestamp: new Date()
    });
  }
});

// @route   GET /api/ai/status
// @desc    Check which AI services are available
// @access  Private
router.get('/status', authMiddleware, async (req, res) => {
  const status = {
    huggingface: 'unknown',
    ollama: 'unknown',
    fallback: 'available'
  };

  // Test Hugging Face
  try {
    await getHuggingFaceResponse('Test');
    status.huggingface = 'available';
  } catch (e) {
    status.huggingface = 'unavailable';
  }

  // Test Ollama
  try {
    await execPromise('ollama --version');
    status.ollama = 'installed';
  } catch (e) {
    status.ollama = 'not installed';
  }

  res.json({
    success: true,
    services: status,
    activeService: status.huggingface === 'available' ? 'Hugging Face (AI)' : 
                   status.ollama === 'installed' ? 'Ollama (Local AI)' : 
                   'Rule-based Responses'
  });
});

module.exports = router;

