const RouteCoordinates = require('./model-route-coordinates');

const getRouteCoordinates = async (activityId, compressionLevel) => {
  return RouteCoordinates.getRouteCoordinates(activityId, compressionLevel);
}

const bulkCreateRouteCoordinates = async (activityId, compressedRoute, compressionLevel) => {
  return RouteCoordinates.bulkCreate(
    compressedRoute.map(([lat, lon, seconds_at_coords = 1], index) => ({
      lat,
      lon,
      position_index: index,
      seconds_at_coords,
      activityId,
      compression_level: compressionLevel,
    })),
    {
      updateOnDuplicate: ['seconds_at_coords', 'compression_level'],
    }
  );
};

module.exports = {
  getRouteCoordinates,
  bulkCreateRouteCoordinates,
};