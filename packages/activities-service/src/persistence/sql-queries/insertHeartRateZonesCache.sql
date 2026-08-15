insert into
  zones_cache (
    seconds_z1,
    seconds_z2,
    seconds_z3,
    seconds_z4,
    seconds_z5,
    activityId,
    heartZoneId,
    createdAt,
    updatedAt
  )
values
  (
    ?, -- seconds_z1: { type: DataTypes.INTEGER },
    ?, -- seconds_z2: { type: DataTypes.INTEGER },
    ?, -- seconds_z3: { type: DataTypes.INTEGER },
    ?, -- seconds_z4: { type: DataTypes.INTEGER },
    ?, -- seconds_z5: { type: DataTypes.INTEGER },
    ?, -- activityId: { type: DataTypes.BIGINT, primaryKey: true },
    ?, -- heartZoneId: { type: DataTypes.MEDIUMINT, primaryKey: true },
    ?, -- createdAt: { type: DataTypes.DATE },
    ? -- updatedAt: { type: DataTypes.DATE },
  )