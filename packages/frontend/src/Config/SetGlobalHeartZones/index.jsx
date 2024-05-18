import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllHeartZones } from '../../reducers/heartszones';
import { selectConfigZonesId } from '../../reducers/config';
import ZonesHeader from '../../Activities/ZonesHeader';

const SetGlobalHeartZones = ({}) => {
  const allZones = useSelector(selectAllHeartZones);
  const configHeartZone = useSelector(selectConfigZonesId);
  const dispatch = useDispatch()

  const selectZone = useCallback((id) => {
    dispatch({ type: 'configReducer/SET_ZONES_ID', payload: id });
  }, [])
  
  return (
    <div>
      <button onClick={() => selectZone(-1)} disabled={-1 === configHeartZone}>Set Relative</button>
      {allZones.map((zone) => (
        <div key={zone.id} className="flex full-width" style={{ border: zone.id === configHeartZone ? '1px solid black' : 'none' }}>
          <button onClick={() => selectZone(zone.id)} disabled={zone.id === configHeartZone}>
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
