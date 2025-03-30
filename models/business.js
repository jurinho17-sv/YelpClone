/**
 * Business Model
 * 
 * Defines the schema for businesses in the application.
 * Includes fields for basic business information and references to reviews.
 * The averageRating field is calculated when reviews are added or removed.
*/


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
  // Reference to reviews using MongoDB's document references
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }
  ],
  // pre-calculated average rating for efficient sorting and filtering
  averageRating: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Business', BusinessSchema);