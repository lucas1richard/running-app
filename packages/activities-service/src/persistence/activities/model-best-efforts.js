import { DataTypes, Model } from 'sequelize';
import { sequelizeMysql } from '../sequelize-mysql.js';

class BestEfforts extends Model { }

BestEfforts.init(
  {
    effort_id: { type: DataTypes.BIGINT, primaryKey: true },
    start_date_local: { type: DataTypes.DATE },
    distance: { type: DataTypes.FLOAT },
    elapsed_time: { type: DataTypes.INTEGER },
    moving_time: { type: DataTypes.INTEGER },
    pr_rank: { type: DataTypes.INTEGER },
    name: { type: DataTypes.STRING },
    start_index: { type: DataTypes.INTEGER },
    end_index: { type: DataTypes.INTEGER },
  },
  {
    sequelize: sequelizeMysql,
    modelName: 'bestEfforts',
    tableName: 'best_efforts',
  }
);

export default BestEfforts;
