const express = require('express');
const router = express.Router();
const {
  getProperties,
  getFeaturedProperties,
  getMyProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} = require('../controllers/propertyController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.route('/')
  .get(getProperties)
  .post(protect, createProperty);

router.get('/featured', getFeaturedProperties);
router.get('/my', protect, getMyProperties);

router.route('/:id')
  .get(getPropertyById)
  .put(protect, updateProperty)
  .delete(protect, deleteProperty);

module.exports = router;
