const { Model, DataTypes } = require('sequelize');
const { sequelizeMysql } = require('../sequelize-mysql');

class StreamPin extends Model {}

StreamPin.init(
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    stream_key: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    index: { // index of the stream data
      type: DataTypes.BIGINT,
      allowNull: false
    },
    label: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    latlng: {
      type: DataTypes.GEOMETRY('POINT'),
      get() {
        return this.getDataValue('latlng')?.coordinates;
      }
    },
  },
  {
    sequelize: sequelizeMysql,
    modelName: 'stream_pins',
    tableName: 'stream_pins',
    timestamps: false
  }
);

module.exports = StreamPin;
