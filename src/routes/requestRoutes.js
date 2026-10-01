const express = require('express');
const router = express.Router();
const {
  getRequests,
  getRequestById,
  createRequest,
  unlockRequest,
  getMyRequests,
} = require('../controllers/requestController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.route('/')
  .get(optionalAuth, getRequests)
  .post(protect, createRequest);

router.get('/my', protect, getMyRequests);
router.get('/:id', optionalAuth, getRequestById);
router.post('/:id/unlock', protect, unlockRequest);

module.exports = router;
