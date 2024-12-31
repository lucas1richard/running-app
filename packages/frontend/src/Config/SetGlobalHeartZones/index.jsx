import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllHeartZones } from '../../reducers/heartzones';
import ZonesHeader from '../../Activities/ZonesHeader';
import { selectGlobalPrerences } from '../../reducers/preferences';
import { setGlobalPrefsAct } from '../../reducers/preferences-actions';
import { Basic, Button, Flex } from '../../DLS';
import propSelector from '../../utils/propSelector';

const SetGlobalHeartZones = () => {
  const allZones = useSelector(selectAllHeartZones);
  const dispatch = useDispatch();

  const preferences = useSelector(selectGlobalPrerences);

  const selectZone = useCallback((id) => {
    dispatch(setGlobalPrefsAct({ zonesId: id }));
  }, [dispatch])

  return (
    <div>
      <Button onClick={() => selectZone(-1)} disabled={-1 === preferences.zonesId}>
        Set Relative
      </Button>
      {allZones.map((zone) => (
        <Flex key={zone.id} width="100%" border={propSelector({ '1px solid black': zone.id === preferences.zonesId })}>
          <Button onClick={() => selectZone(zone.id)} disabled={zone.id === preferences.zonesId}>
            Select
          </Button>
          <Basic.Div flexGrow="1">
            <ZonesHeader zones={zone} start={zone.start_date} isCompact={true} />
          </Basic.Div>
        </Flex>
      ))}
    </div>
  );
};

export default SetGlobalHeartZones;
