const express = require('express');
const router = express.Router();
const { getZonesAndNeighborhoods } = require('../controllers/dakarController');

router.get('/zones', getZonesAndNeighborhoods);

module.exports = router;
