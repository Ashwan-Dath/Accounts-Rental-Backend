const mongoose = require('mongoose');

const DurationSchema = new mongoose.Schema(
  {
    value: {
      type: Number,
      required: true,
      min: [1, 'Duration value must be at least 1']
    },
    unit: {
      type: String,
      required: true,
      trim: true,
      enum: ['hour', 'day', 'week', 'month', 'year']
    }
  },
  { _id: false }
);

const AdSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    platform: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    duration: {
      type: DurationSchema,
      required: true
    },
    contactEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid contact email'
      ]
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Ad', AdSchema);
