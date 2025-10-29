const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const { createFriendMeetLink } = require('../utils/googleMeet');

/**
 * Find users with matching interests/hobbies
 * @param {Object} currentUser - The user looking for a friend
 * @param {Array} allUsers - All available users
 * @returns {Object|null} - Matched user or null
 */
const findMatchingUser = (currentUser, allUsers) => {
  const currentInterests = [
    ...(currentUser.hobbies || []),
    ...(currentUser.interests || [])
  ].map(i => i.toLowerCase().trim());

  if (currentInterests.length === 0) {
    // No interests specified, return any available user
    return allUsers[0] || null;
  }

  // Score each user based on matching interests
  const scoredUsers = allUsers.map(user => {
    const userInterests = [
      ...(user.hobbies || []),
      ...(user.interests || [])
    ].map(i => i.toLowerCase().trim());

    // Calculate match score
    const matchCount = currentInterests.filter(interest =>
      userInterests.some(ui => ui.includes(interest) || interest.includes(ui))
    ).length;

    return {
      user,
      score: matchCount,
      matchedInterests: currentInterests.filter(interest =>
        userInterests.some(ui => ui.includes(interest) || interest.includes(ui))
      )
    };
  });

  // Sort by score (highest first)
  scoredUsers.sort((a, b) => b.score - a.score);

  // Return best match (or first user if no interests match)
  return scoredUsers[0]?.user || null;
};

// @route   POST /api/friends/connect
// @desc    Connect with a friend based on similar interests
// @access  Private
router.post('/connect', authMiddleware, async (req, res) => {
  try {
    console.log('\n🤝 FRIEND CONNECT REQUEST');
    console.log('👤 Requested by:', req.user.name, `(${req.user.email})`);

    // Get current user with full details
    const currentUser = await User.findById(req.user.id);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log('🎨 User interests:', currentUser.interests || 'None specified');
    console.log('🎯 User hobbies:', currentUser.hobbies || 'None specified');

    // Find other users who are available
    // For demo: Find any other user (in production, would check online status)
    const otherUsers = await User.find({
      _id: { $ne: req.user.id } // Exclude current user
    }).limit(10);

    console.log(`📊 Found ${otherUsers.length} other user(s) in database`);

    if (otherUsers.length === 0) {
      console.log('❌ No other users available');
      return res.json({
        success: false,
        message: 'No friends available right now. Please try again later or invite someone to join!',
        noUsersAvailable: true
      });
    }

    // Find best match
    const matchedUser = findMatchingUser(currentUser, otherUsers);

    if (!matchedUser) {
      return res.json({
        success: false,
        message: 'No matching friends found. Please try again later.',
        noUsersAvailable: true
      });
    }

    console.log('✅ Match found:', matchedUser.name, `(${matchedUser.email})`);

    // Calculate shared interests
    const currentInterests = [
      ...(currentUser.hobbies || []),
      ...(currentUser.interests || [])
    ].map(i => i.toLowerCase());

    const matchedInterests = [
      ...(matchedUser.hobbies || []),
      ...(matchedUser.interests || [])
    ].map(i => i.toLowerCase());

    const sharedInterests = currentInterests.filter(interest =>
      matchedInterests.some(mi => mi.includes(interest) || interest.includes(mi))
    );

    console.log('🎨 Shared interests:', sharedInterests.length > 0 ? sharedInterests : 'Different interests - diverse conversation!');

    // Create Google Meet link
    try {
      const meetLink = await createFriendMeetLink(currentUser, matchedUser);

      console.log('🎥 Meet link created:', meetLink);
      console.log('✅ Friend connection successful\n');

      res.json({
        success: true,
        message: `Matched with ${matchedUser.name}!`,
        data: {
          friend: {
            name: matchedUser.name,
            interests: matchedUser.interests || [],
            hobbies: matchedUser.hobbies || [],
            sharedInterests: sharedInterests
          },
          meetLink: meetLink,
          expiresIn: '1 hour'
        }
      });

    } catch (meetError) {
      console.error('❌ Error creating Meet link:', meetError);
      
      // Return match info without Meet link
      res.json({
        success: true,
        message: `Matched with ${matchedUser.name}! (Meet link generation failed)`,
        data: {
          friend: {
            name: matchedUser.name,
            email: matchedUser.email,
            interests: matchedUser.interests || [],
            hobbies: matchedUser.hobbies || [],
            sharedInterests: sharedInterests
          },
          meetLink: null,
          fallbackMessage: 'Please create a manual Google Meet and share the link via email.'
        }
      });
    }

  } catch (error) {
    console.error('Friend Connect Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to connect with a friend'
    });
  }
});

// @route   GET /api/friends/available
// @desc    Get count of available users
// @access  Private
router.get('/available', authMiddleware, async (req, res) => {
  try {
    const count = await User.countDocuments({
      _id: { $ne: req.user.id }
    });

    res.json({
      success: true,
      availableUsers: count
    });
  } catch (error) {
    console.error('Get Available Users Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to get available users'
    });
  }
});

// @route   PUT /api/friends/interests
// @desc    Update user interests/hobbies
// @access  Private
router.put('/interests', authMiddleware, async (req, res) => {
  try {
    const { hobbies, interests } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update interests and hobbies
    if (hobbies !== undefined) {
      user.hobbies = Array.isArray(hobbies) ? hobbies : [hobbies];
    }
    if (interests !== undefined) {
      user.interests = Array.isArray(interests) ? interests : [interests];
    }

    await user.save();

    console.log(`✅ Updated interests for ${user.name}`);

    res.json({
      success: true,
      message: 'Interests updated successfully',
      data: {
        hobbies: user.hobbies,
        interests: user.interests
      }
    });

  } catch (error) {
    console.error('Update Interests Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to update interests'
    });
  }
});

module.exports = router;
