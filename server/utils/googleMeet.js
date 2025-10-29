const { google } = require('googleapis');

/**
 * Create a Google Meet link using Google Calendar API
 * @param {Object} eventDetails - Event details (summary, description, attendees)
 * @returns {Promise<string>} - Google Meet link
 */
const createGoogleMeetLink = async (eventDetails) => {
  try {
    // Check if credentials are configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
      console.warn('⚠️  Google Meet credentials not configured. Generating simple Meet link...');
      // Return a simple meet link (users can create their own)
      const meetId = generateRandomMeetId();
      return `https://meet.google.com/${meetId}`;
    }

    // Set up OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    // Create calendar API instance
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Prepare event
    const event = {
      summary: eventDetails.summary || 'Elderly Assistant - Talk to a Friend',
      description: eventDetails.description || 'Connected through Elderly Assistant matching system',
      start: {
        dateTime: eventDetails.startTime || new Date().toISOString(),
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: eventDetails.endTime || new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour later
        timeZone: 'America/New_York',
      },
      attendees: eventDetails.attendees || [],
      conferenceData: {
        createRequest: {
          requestId: `friend-connect-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    };

    // Create the event with conference data (Meet link)
    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: event,
    });

    const meetLink = response.data.hangoutLink;

    if (!meetLink) {
      throw new Error('No Meet link generated');
    }

    console.log('✅ Google Meet link created:', meetLink);
    return meetLink;

  } catch (error) {
    console.error('❌ Error creating Google Meet link:', error.message);
    
    // Fallback: Use Jitsi Meet (open source, no API needed, works immediately!)
    const roomId = generateJitsiRoomId();
    const fallbackLink = `https://meet.jit.si/${roomId}`;
    
    console.log('🔄 Using Jitsi Meet (open source alternative):', fallbackLink);
    return fallbackLink;
  }
};

/**
 * Generate a unique Jitsi Meet room ID
 * Format: ElderlyAssistant-[timestamp]-[random]
 * This ensures both users join the same room
 */
const generateJitsiRoomId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `ElderlyAssistant-${timestamp}-${random}`;
};

/**
 * Create a Meet link for two matched users
 * @param {Object} user1 - First user object
 * @param {Object} user2 - Second user object
 * @returns {Promise<string>} - Google Meet link
 */
const createFriendMeetLink = async (user1, user2) => {
  const eventDetails = {
    summary: `Talk to a Friend - ${user1.name} & ${user2.name}`,
    description: `Matched through Elderly Assistant based on shared interests.
    
${user1.name}'s interests: ${user1.interests?.join(', ') || 'Not specified'}
${user2.name}'s interests: ${user2.interests?.join(', ') || 'Not specified'}

Enjoy your conversation!`,
    attendees: [
      { email: user1.email },
      { email: user2.email },
    ],
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
  };

  return await createGoogleMeetLink(eventDetails);
};

module.exports = {
  createGoogleMeetLink,
  createFriendMeetLink,
  generateJitsiRoomId,
};
