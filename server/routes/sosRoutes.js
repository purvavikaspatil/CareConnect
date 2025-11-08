const express = require('express');
const router = express.Router();
const SOSAlert = require('../models/SOSAlert');
const Contact = require('../models/Contact');
const authMiddleware = require('../middleware/authMiddleware');
const { sendSOSAlertEmails } = require('../utils/sendEmail');

// @route   POST /api/sos
// @desc    Create a new SOS alert
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude, accuracy, message } = req.body;

    // Log incoming SOS alert request
    console.log('\n🚨 SOS ALERT TRIGGERED');
    console.log('📥 Received from user:', req.user.name, `(${req.user.email})`);
    console.log('📍 Location data received:', {
      latitude,
      longitude,
      accuracy
    });

    // Create SOS alert object
    const alertData = {
      userId: req.user.id,
      message: message || 'Emergency alert triggered',
    };

    // Add location if provided (even if null)
    if (latitude !== undefined && longitude !== undefined) {
      alertData.location = {
        latitude: latitude !== null ? latitude : null,
        longitude: longitude !== null ? longitude : null,
        accuracy: accuracy || null,
      };
      console.log('✅ Location will be saved:', alertData.location);
    } else {
      console.log('⚠️  No location data provided in request');
    }

    // Create and save the alert
    const sosAlert = await SOSAlert.create(alertData);
    console.log('💾 Alert saved to MongoDB with ID:', sosAlert._id);

    // Populate user information
    await sosAlert.populate('userId', 'name email');

    // Send email and SMS alerts to emergency contacts (non-blocking)
    // Fetch user's contacts
    try {
      const contacts = await Contact.find({ userId: req.user.id });
      console.log(`📋 Found ${contacts.length} contacts for user ${req.user.name}`);
      
      if (contacts.length > 0) {
        // Log contact details (for debugging)
        contacts.forEach((contact, index) => {
          console.log(`   Contact ${index + 1}: ${contact.name} - Email: ${contact.email || 'NO EMAIL'} - Phone: ${contact.phone || 'NO PHONE'}`);
        });

        // Prepare alert data for notifications
        const alertNotificationData = {
          userName: req.user.name,
          userEmail: req.user.email,
          location: sosAlert.location,
          message: sosAlert.message,
          timestamp: sosAlert.timestamp || new Date().toLocaleString(),
        };

        console.log('📤 Attempting to send email alerts...');
        console.log('   User:', req.user.name, `<${req.user.email}>`);
        console.log('   User ID:', req.user.id);
        console.log('   EMAIL_USER configured:', process.env.EMAIL_USER ? 'YES' : 'NO');
        console.log('   EMAIL_PASS configured:', process.env.EMAIL_PASS ? 'YES' : 'NO');
        console.log('   Sending through SMTP account:', process.env.EMAIL_USER);
        console.log('   Reply-To will be set to user email:', req.user.email);

        // Send email alerts asynchronously (don't wait for completion)
        sendSOSAlertEmails(contacts, alertNotificationData)
          .then((emailResult) => {
            console.log(
              `✅ Email alerts sent: ${emailResult.emailsSent} successful, ${emailResult.emailsFailed} failed`
            );
            if (emailResult.results) {
              emailResult.results.forEach((result, idx) => {
                if (!result.success) {
                  console.error(`   ❌ Failed to send to ${result.recipient}: ${result.error}`);
                }
              });
            }
          })
          .catch((emailError) => {
            console.error('❌ Error sending email alerts:', emailError);
            console.error('   Error details:', emailError.message);
          });
      } else {
        console.log('⚠️  No emergency contacts found for this user');
      }
    } catch (contactError) {
      // Log error but don't fail the SOS alert creation
      console.error('❌ Error fetching contacts for notifications:', contactError);
      console.error('   Error details:', contactError.message);
    }

    // Log success summary
    console.log('✅ SOS Alert created successfully');
    console.log('📊 Alert Summary:');
    console.log('   - ID:', sosAlert._id);
    console.log('   - User:', sosAlert.userId.name);
    console.log('   - Message:', sosAlert.message);
    console.log('   - Location:', sosAlert.location ? 
      `${sosAlert.location.latitude}, ${sosAlert.location.longitude}` : 
      'Not provided'
    );
    console.log('   - Timestamp:', sosAlert.timestamp || sosAlert.createdAt);
    console.log('─────────────────────────────────────────\n');

    res.status(201).json({
      success: true,
      message: 'SOS alert created successfully',
      data: sosAlert,
    });
  } catch (error) {
    console.error('SOS Alert Creation Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to create SOS alert',
    });
  }
});

// @route   GET /api/sos
// @desc    Get all SOS alerts for the logged-in user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const alerts = await SOSAlert.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(50); // Limit to last 50 alerts

    res.json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    console.error('Fetch SOS Alerts Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to fetch SOS alerts',
    });
  }
});

// @route   GET /api/sos/:id
// @desc    Get a specific SOS alert by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const alert = await SOSAlert.findById(req.params.id).populate(
      'userId',
      'name email'
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'SOS alert not found',
      });
    }

    // Verify the alert belongs to the authenticated user
    if (alert.userId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this alert',
      });
    }

    res.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    console.error('Fetch SOS Alert Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to fetch SOS alert',
    });
  }
});

// @route   PUT /api/sos/:id
// @desc    Update SOS alert status (e.g., mark as resolved)
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status
    if (status && !['active', 'resolved', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be: active, resolved, or cancelled',
      });
    }

    const alert = await SOSAlert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'SOS alert not found',
      });
    }

    // Verify the alert belongs to the authenticated user
    if (alert.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this alert',
      });
    }

    // Update the alert
    if (status) {
      alert.status = status;
    }

    await alert.save();

    res.json({
      success: true,
      message: 'SOS alert updated successfully',
      data: alert,
    });
  } catch (error) {
    console.error('Update SOS Alert Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to update SOS alert',
    });
  }
});

// @route   DELETE /api/sos/:id
// @desc    Delete a specific SOS alert
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const alert = await SOSAlert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'SOS alert not found',
      });
    }

    // Verify the alert belongs to the authenticated user
    if (alert.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this alert',
      });
    }

    await SOSAlert.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'SOS alert deleted successfully',
      data: {},
    });
  } catch (error) {
    console.error('Delete SOS Alert Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to delete SOS alert',
    });
  }
});

module.exports = router;

