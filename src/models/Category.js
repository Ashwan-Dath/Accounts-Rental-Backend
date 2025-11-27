const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: String,
      unique: true,
      required: true,
      immutable: true,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    platform: {
      type: String,
      required: true,
      trim: true
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
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Category', CategorySchema);
