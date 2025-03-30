/**
 * Business Routes
 * 
 * This file contains all routes related to business management:
 * - listing all businesses
 * - creating new businesses
 * - viewing individual businesses
 * - updating existing busineses
 * - deleting businesses
 * - managing reviews
 * 
 * The routes implement role-based access control for business owners and consumers.
 */

const express = require('express');
const router = express.Router();
const Business = require('../models/business');
const Review = require('../models/review');

/**
 * Role Checking Middleware
 * 
 * Determines the user's role (owner or consumer) from query parameters
 * or session data and makes it available to route handlers and templates.
 */

const checkRole = (req, res, next) => {
  // Get role from query parameter or session
  const role = req.query.role || req.session?.role || 'consumer';
  
  // Store role in res.locals to use in templates
  res.locals.userRole = role;
  
  // If role parameter was provided, store it in session for future requests
  if (req.query.role) {
    req.session.role = role;
  }
  
  next();
};

// Apply middleware to all routes
router.use(checkRole);

/**
 * GET /business
 * lists all businesses with optional sorting and filtering
 */
router.get('/', async (req, res) => {
  try {
    const businesses = await Business.find({}).sort({ createdAt: 'desc' });
    res.render('businesses/index', { 
      businesses,
      userRole: res.locals.userRole 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

/**
 * GET /business/new
 * displays form to create a new business
 * restricted to owner role
 */
router.get('/new', (req, res) => {
  if (res.locals.userRole !== 'owner') {
    return res.redirect('/business?role=owner');
  }
  res.render('businesses/new');
});

// POST - Create new business
router.post('/', async (req, res) => {
  if (res.locals.userRole !== 'owner') {
    return res.status(403).send('Only business owners can add businesses');
  }
  
  try {
    const business = new Business({
      title: req.body.title,
      location: req.body.location,
      description: req.body.description
    });
    
    await business.save();
    res.redirect(`/business/${business._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET - Show specific business
router.get('/:id', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id).populate('reviews');
    if (!business) {
      return res.status(404).send('Business not found');
    }
    res.render('businesses/show', { 
      business,
      userRole: res.locals.userRole 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET - Display form to update business
router.get('/:id/update', async (req, res) => {
  if (res.locals.userRole !== 'owner') {
    return res.redirect(`/business/${req.params.id}?role=owner`);
  }
  
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).send('Business not found');
    }
    res.render('businesses/update', { business });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// PUT - Update business
router.put('/:id', async (req, res) => {
  if (res.locals.userRole !== 'owner') {
    return res.status(403).send('Only business owners can update businesses');
  }
  
  try {
    const business = await Business.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        location: req.body.location,
        description: req.body.description
      },
      { new: true }
    );
    res.redirect(`/business/${business._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// DELETE - Delete business
router.delete('/:id', async (req, res) => {
  if (res.locals.userRole !== 'owner') {
    return res.status(403).send('Only business owners can delete businesses');
  }
  
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).send('Business not found');
    }
    
    await Business.findByIdAndDelete(req.params.id);
    
    // Also delete all associated reviews
    await Review.deleteMany({ _id: { $in: business.reviews } });
    
    res.redirect('/business');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST - Add review to business
router.post('/:id/reviews', async (req, res) => {
  if (res.locals.userRole !== 'consumer') {
    return res.status(403).send('Only consumers can add reviews');
  }
  
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).send('Business not found');
    }
    
    // Create a new review
    const review = new Review({
      rating: req.body.rating,
      body: req.body.body
    });
    
    // Save the review
    await review.save();
    
    // Add review to business and save
    business.reviews.push(review._id);
    
    // Update average rating
    const reviews = await Review.find({ _id: { $in: business.reviews } });
    const totalRating = reviews.reduce((sum, item) => sum + item.rating, 0);
    business.averageRating = (totalRating / reviews.length).toFixed(2);
    
    await business.save();
    
    res.redirect(`/business/${business._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// DELETE - Delete review
router.delete('/:id/reviews/:reviewId', async (req, res) => {
  if (res.locals.userRole !== 'owner' && res.locals.userRole !== 'consumer') {
    return res.status(403).send('Unauthorized');
  }
  
  try {
    const { id, reviewId } = req.params;
    
    // Remove review from business
    await Business.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId }
    });
    
    // Delete the review
    await Review.findByIdAndDelete(reviewId);
    
    // Update average rating
    const business = await Business.findById(id).populate('reviews');
    if (business.reviews.length > 0) {
      const totalRating = business.reviews.reduce((sum, item) => sum + item.rating, 0);
      business.averageRating = (totalRating / business.reviews.length).toFixed(2);
    } else {
      business.averageRating = 0;
    }
    
    await business.save();
    
    res.redirect(`/business/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;