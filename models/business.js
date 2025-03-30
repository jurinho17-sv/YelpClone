// models/business.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Business Schema
const BusinessSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Reference to reviews
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }
  ],
  // Average rating for sorting and filtering
  averageRating: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Business', BusinessSchema);