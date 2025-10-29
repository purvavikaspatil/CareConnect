const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET /api/contacts
// @desc    Get all contacts for the logged-in user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const contacts = await Contact.find({ userId: req.user.id }).sort({ name: 1 });
    res.json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    console.error('Fetch Contacts Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to fetch contacts',
    });
  }
});

// @route   POST /api/contacts
// @desc    Add a new contact
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, relation, phone, email } = req.body;

    // Validation
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Please provide contact name and phone number',
      });
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid phone number',
      });
    }

    // Create contact
    const contact = await Contact.create({
      userId: req.user.id,
      name: name.trim(),
      relation: relation?.trim() || '',
      phone: phone.trim(),
      email: email?.trim() || '',
    });

    res.status(201).json({
      success: true,
      message: 'Contact added successfully',
      data: contact,
    });
  } catch (error) {
    console.error('Add Contact Error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: Object.values(error.errors).map(err => err.message).join(', '),
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to add contact',
    });
  }
});

// @route   PUT /api/contacts/:id
// @desc    Update a contact
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, relation, phone, email } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found',
      });
    }

    // Verify the contact belongs to the authenticated user
    if (contact.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this contact',
      });
    }

    // Update fields
    if (name) contact.name = name.trim();
    if (relation !== undefined) contact.relation = relation.trim();
    if (phone) contact.phone = phone.trim();
    if (email !== undefined) contact.email = email.trim();

    await contact.save();

    res.json({
      success: true,
      message: 'Contact updated successfully',
      data: contact,
    });
  } catch (error) {
    console.error('Update Contact Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to update contact',
    });
  }
});

// @route   DELETE /api/contacts/:id
// @desc    Delete a contact
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found',
      });
    }

    // Verify the contact belongs to the authenticated user
    if (contact.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this contact',
      });
    }

    await Contact.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Contact deleted successfully',
      data: {},
    });
  } catch (error) {
    console.error('Delete Contact Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to delete contact',
    });
  }
});

module.exports = router;

