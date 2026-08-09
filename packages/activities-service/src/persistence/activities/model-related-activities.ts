import { DataTypes, Model } from 'sequelize';
import { sequelizeMysql } from '../sequelize-mysql.ts';
import type { PersistenceRelatedActivity } from './acitivities.types.ts';

class RelatedActivities extends Model<PersistenceRelatedActivity, PersistenceRelatedActivity> { }

RelatedActivities.init(
  {
    baseActivity: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },

    relatedActivity: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },

    // longest common segment subsequence divided by number of segments in base activity
    segmentScoreFromBase: {
      type: DataTypes.DECIMAL(5, 4),
      get() {
        if (this.getDataValue('segmentScoreFromBase') === null) {
          return undefined;
        }
        return Number(this.getDataValue('segmentScoreFromBase'));
      },
      allowNull: true,
    },

    // longest common segment subsequence divided by number of segments in related activity
    segmentScoreFromRelated: {
      type: DataTypes.DECIMAL(5, 4),
      get() {
        if (this.getDataValue('segmentScoreFromRelated') === null) {
          return undefined;
        }
        return Number(this.getDataValue('segmentScoreFromRelated'));
      },
      allowNull: true,
    },

    longestCommonSegmentSubsequence: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    numberBaseSegments: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    numberRelatedSegments: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    routeScoreFromBase: {
      type: DataTypes.DECIMAL(5, 4),
      get() {
        if (this.getDataValue('routeScoreFromBase') === null) {
          return undefined;
        }
        return Number(this.getDataValue('routeScoreFromBase'));
      },
      allowNull: true,
    },

    routeScoreFromRelated: {
      type: DataTypes.DECIMAL(5, 4),
      get() {
        if (this.getDataValue('routeScoreFromRelated') === null) {
          return undefined;
        }
        return Number(this.getDataValue('routeScoreFromRelated'));
      },
      allowNull: true,
    },
  },
  {
    sequelize: sequelizeMysql,
    modelName: 'relatedActivities',
    tableName: 'related_activities_n',
  }
);

export default RelatedActivities;
