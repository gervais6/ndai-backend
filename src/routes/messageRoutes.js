const express = require('express');
const router = express.Router();
const {
  getThreads,
  getConversation,
  sendMessage,
  markAsRead,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/threads', getThreads);
router.post('/', sendMessage);
router.get('/:otherUserId', getConversation);
router.put('/read/:otherUserId', markAsRead);

module.exports = router;
