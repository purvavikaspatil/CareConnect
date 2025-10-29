const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    location: {
      latitude: {
        type: Number,
        required: false,
      },
      longitude: {
        type: Number,
        required: false,
      },
      accuracy: {
        type: Number,
        required: false,
      },
    },
    message: {
      type: String,
      default: 'Emergency alert triggered',
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'cancelled'],
      default: 'active',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Index for faster queries
sosAlertSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('SOSAlert', sosAlertSchema);

