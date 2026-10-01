const express = require('express');
const router = express.Router();
const { getBalance, getPacks, recharge } = require('../controllers/creditController');
const { protect } = require('../middleware/authMiddleware');

router.get('/packs', getPacks);
router.get('/balance', protect, getBalance);
router.post('/recharge', protect, recharge);

module.exports = router;
