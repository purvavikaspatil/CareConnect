const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');

// @route   GET /api/reminders
// @desc    Get all reminders
// @access  Public
router.get('/', async (req, res) => {
  try {
    const reminders = await Reminder.find().sort({ time: 1 });
    res.json({
      success: true,
      count: reminders.length,
      data: reminders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to fetch reminders',
    });
  }
});

// @route   GET /api/reminders/:id
// @desc    Get single reminder
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({
        success: false,
        error: 'Reminder not found',
      });
    }

    res.json({
      success: true,
      data: reminder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to fetch reminder',
    });
  }
});

// @route   POST /api/reminders
// @desc    Create a new reminder
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { medicineName, time, note } = req.body;

    // Validation
    if (!medicineName || !time) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both medicine name and time',
      });
    }

    const reminder = await Reminder.create({
      medicineName,
      time,
      note,
    });

    res.status(201).json({
      success: true,
      data: reminder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to create reminder',
    });
  }
});

// @route   PUT /api/reminders/:id
// @desc    Update a reminder
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({
        success: false,
        error: 'Reminder not found',
      });
    }

    const updatedReminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators
      }
    );

    res.json({
      success: true,
      data: updatedReminder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to update reminder',
    });
  }
});

// @route   DELETE /api/reminders/:id
// @desc    Delete a reminder
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({
        success: false,
        error: 'Reminder not found',
      });
    }

    await Reminder.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      data: {},
      message: 'Reminder deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to delete reminder',
    });
  }
});

module.exports = router;

