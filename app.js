/**
 * SnapReviews - A YelpClone web application for S
 * */

// app.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session'); // Add this line
const connectDB = require('./config/database');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
connectDB();

// Initialize Express
const app = express();

// Body Parser Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Method Override Middleware (for PUT and DELETE requests)
app.use(methodOverride('_method'));

// Session Middleware
app.use(session({
  secret: 'snapreviewssecret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Import routes
const businessRoutes = require('./routes/businesses');

// Use routes
app.use('/business', businessRoutes);

// Updated route for homepage
app.get('/', (req, res) => {
  res.render('home');
});

// Import the Business model
const Business = require('./models/business');

// Sample businesses in Santa Monica
const checkAndSeedDatabase = async () => {
  try {
    const count = await Business.countDocuments();
    if (count === 0) {
      console.log('No businesses found, adding sample businesses');
      
      // Sample cafes
      const cafes = [
        {
          title: 'Snap Cafe',
          location: 'Santa Monica, CA',
          description: 'A trendy cafe specializing in quick bites and colorful drinks. Perfect spot for creative professionals and tech enthusiasts to gather and share ideas.',
          averageRating: 4.5
        },
        {
          title: 'Urth Caffe',
          location: 'Santa Monica, CA',
          description: 'Popular cafe known for organic coffee, fine teas, and health-conscious food options. Great outdoor patio with a relaxed atmosphere.',
          averageRating: 4.2
        },
        {
          title: 'Blue Bottle Coffee',
          location: 'Venice, CA',
          description: 'Craft coffee shop offering specialty single-origin beans and expertly prepared espresso drinks in a minimalist setting.',
          averageRating: 4.3
        },
        {
          title: 'Dogtown Coffee',
          location: 'Santa Monica, CA',
          description: 'Surf-inspired coffee shop with locally roasted beans and hearty breakfast burritos. Captures the local beach culture.',
          averageRating: 4.1
        },
        {
          title: 'Demitasse',
          location: 'Santa Monica, CA',
          description: 'Artisanal coffee shop with handcrafted drinks and house-made syrups. Known for their unique lavender hot chocolate.',
          averageRating: 4.0
        }
      ];
      
      // Sample restaurants
      const restaurants = [
        {
          title: 'Forma Restaurant & Cheese Bar',
          location: 'Santa Monica, CA',
          description: 'Italian restaurant famous for pasta prepared in cheese wheels. Extensive wine list and elegant atmosphere.',
          averageRating: 4.6
        },
        {
          title: 'Cassia',
          location: 'Santa Monica, CA',
          description: 'Southeast Asian brasserie with French influences. Beautiful indoor and outdoor spaces with wood-fired dishes.',
          averageRating: 4.7
        },
        {
          title: 'Elephante',
          location: 'Santa Monica, CA',
          description: 'Rooftop restaurant with Mediterranean cuisine and stunning ocean views. Popular for sunset cocktails and Italian-inspired dishes.',
          averageRating: 4.4
        },
        {
          title: 'Sweetgreen',
          location: 'Santa Monica, CA',
          description: 'Health-focused fast casual chain offering seasonal salads and grain bowls made with locally sourced ingredients.',
          averageRating: 4.1
        },
        {
          title: 'Bay Cities Italian Deli',
          location: 'Santa Monica, CA',
          description: 'Iconic Italian deli famous for the Godmother sandwich. Offers imported specialty foods and homemade dishes.',
          averageRating: 4.8
        }
      ];
      
      // Combine all businesses
      const allBusinesses = [...cafes, ...restaurants];
      
      // Save all businesses to database
      for (const business of allBusinesses) {
        const newBusiness = new Business(business);
        await newBusiness.save();
      }
      
      console.log(`${allBusinesses.length} sample businesses added`);
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};


// Uncomment these lines to delete all businesses and re-seed
/*
async function resetDatabase() {
   await Business.deleteMany({});
   console.log('Database reset, ready for seeding');
 }
 resetDatabase();
*/

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  checkAndSeedDatabase();
});