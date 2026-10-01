const express = require('express');
const router = express.Router();
const {
  requestVisit,
  getMyVisits,
  getOwnerVisits,
  updateVisitStatus,
} = require('../controllers/visitController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, requestVisit);
router.get('/my', protect, getMyVisits);
router.get('/owner', protect, getOwnerVisits);
router.put('/:id/status', protect, updateVisitStatus);

module.exports = router;
