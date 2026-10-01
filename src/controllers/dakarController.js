const { DAKAR_ZONES, POPULAR_DAKAR_NEIGHBORHOODS } = require('../data/dakarData');

// @desc Obtenir les zones et quartiers officiels de Dakar
// @route GET /api/dakar/zones
exports.getZonesAndNeighborhoods = (req, res) => {
  res.json({
    success: true,
    countZones: DAKAR_ZONES.length,
    zones: DAKAR_ZONES,
    popularNeighborhoods: POPULAR_DAKAR_NEIGHBORHOODS,
  });
};
