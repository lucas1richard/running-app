const { DataTypes, Model } = require('sequelize');
const { sequelizeMysql } = require('../sequelize-mysql');
const { findRelationsBySimilarRoute } = require('../../constants');

// get the same shape as we would get from couchdb
const formatResponse = (route) => {
  return route.map((coords) => [coords.lat, coords.lon, coords.seconds_at_coords]);
};

class RouteCoordinates extends Model {
  static async getRouteCoordinates(activityId, compressionLevel = findRelationsBySimilarRoute.COMPRESSION_LEVEL) {
    const route = await RouteCoordinates.findAll({
      where: {
        activityId,
        compression_level: compressionLevel,
      },
      order: [['position_index', 'ASC']],
    });

    return formatResponse(route);
  }
}

RouteCoordinates.init(
  {
    activityId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    lat: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
      primaryKey: true,
      get() { return Number(this.getDataValue('lat')); },
    },
    lon: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
      primaryKey: true,
      get() { return Number(this.getDataValue('lon')); },
    },
    position_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    seconds_at_coords: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    compression_level: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
      defaultValue: 0,
      get() { return Number(this.getDataValue('compression_level')); },
    },
  },
  {
    sequelize: sequelizeMysql,
    modelName: 'routeCoordinates',
    tableName: 'route_coordinates_n',
  }
);


module.exports = RouteCoordinates;