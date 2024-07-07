import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllHeartZones } from '../../reducers/heartzones';
import ZonesHeader from '../../Activities/ZonesHeader';
import { selectGlobalPrerences } from '../../reducers/preferences';
import { setGlobalPrefsAct } from '../../reducers/preferences-actions';

const SetGlobalHeartZones = () => {
  const allZones = useSelector(selectAllHeartZones);
  const dispatch = useDispatch();

  const preferences = useSelector(selectGlobalPrerences);

  const selectZone = useCallback((id) => {
    dispatch(setGlobalPrefsAct({ zonesId: id }));
  }, [dispatch])

  return (
    <div>
      <button onClick={() => selectZone(-1)} disabled={-1 === preferences.zonesId}>
        Set Relative
      </button>
      {allZones.map((zone) => (
        <div key={zone.id} className="flex full-width" style={{ border: zone.id === preferences.zonesId ? '1px solid black' : 'none' }}>
          <button onClick={() => selectZone(zone.id)} disabled={zone.id === preferences.zonesId}>
            Select
          </button>
          <div className="flex-item-grow">
            <ZonesHeader zones={zone} start={zone.start_date} isCompact={true} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SetGlobalHeartZones;
