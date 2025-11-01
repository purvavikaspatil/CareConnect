const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET /api/reminders
// @desc    Get all reminders for the authenticated user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('📋 Fetching reminders for user:', req.user.name, `(${req.user.id})`);
    const reminders = await Reminder.find({ userId: req.user.id }).sort({ time: 1 });
    console.log(`✅ Found ${reminders.length} reminders for ${req.user.name}`);
    
    if (reminders.length > 0) {
      reminders.forEach((reminder, idx) => {
        console.log(`   ${idx + 1}. ${reminder.medicineName} at ${reminder.time}`);
      });
    }
    
    res.json({
      success: true,
      count: reminders.length,
      data: reminders,
    });
  } catch (error) {
    console.error('❌ Error fetching reminders:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to fetch reminders',
    });
  }
});

// @route   POST /api/reminders
// @desc    Add a new reminder for the authenticated user
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { medicineName, time, note } = req.body;

    console.log('💊 Creating reminder for user:', req.user.name);
    console.log('   Medicine:', medicineName);
    console.log('   Time:', time);
    console.log('   Note:', note || 'None');

    // Validation
    if (!medicineName || !time) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both medicine name and time',
      });
    }

    const reminder = await Reminder.create({
      userId: req.user.id,
      medicineName,
      time,
      note: note || '',
    });

    console.log('✅ Reminder created successfully with ID:', reminder._id);

    res.status(201).json({
      success: true,
      data: reminder,
    });
  } catch (error) {
    console.error('❌ Error creating reminder:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to create reminder',
    });
  }
});

// @route   DELETE /api/reminders/:id
// @desc    Delete a reminder for the authenticated user
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({
        success: false,
        error: 'Reminder not found',
      });
    }

    // Verify the reminder belongs to the authenticated user
    if (reminder.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this reminder',
      });
    }

    await Reminder.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Reminder deleted successfully',
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to delete reminder',
    });
  }
});

module.exports = router;

