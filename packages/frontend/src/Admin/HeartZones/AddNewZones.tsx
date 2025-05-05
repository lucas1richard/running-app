import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addHeartZonesAct } from '../../reducers/heartzones-actions';
import { Button, Flex } from '../../DLS';
import Surface from '../../DLS/Surface';

const AddNewHRZones = ({ latestZone }) => {
  const dispatch = useDispatch();
  const [z1, setZ1] = useState(latestZone?.z1);
  const [z2, setZ2] = useState(latestZone?.z2);
  const [z3, setZ3] = useState(latestZone?.z3);
  const [z4, setZ4] = useState(latestZone?.z4);
  const [z5, setZ5] = useState(latestZone?.z5);
  const [startDate, setStartDate] = useState(new Date());

  const onFormSubmit = useCallback((ev) => {
    ev.preventDefault();
    dispatch(addHeartZonesAct({ z1, z2, z3, z4, z5, starting: startDate }));
  }, [z1, z2, z3, z4, z5, startDate, dispatch]);

  return (
    <Surface className="card pad">
      <form onSubmit={onFormSubmit}>
        <Flex $gap={1} $directionSmDown="column">
          <Flex $alignItems="center">
            <label htmlFor="z1-input">Zone 1 Min HR:</label>&nbsp;
            <input
              id="z1-input"
              type="number"
              min={0}
              max={300}
              step={1}
              value={z1}
              onChange={(ev) => setZ1(ev.target.value)}
            />
          </Flex>
          <Flex $alignItems="center">
            <label htmlFor="z2-input">Zone 2 Min HR:</label>&nbsp;
            <input
              id="z2-input"
              type="number"
              min={0}
              max={300}
              step={1}
              value={z2}
              onChange={(ev) => setZ2(ev.target.value)}
            />
          </Flex>
          <Flex $alignItems="center">
            <label htmlFor="z3-input">Zone 3 Min HR:</label>&nbsp;
            <input
              id="z3-input"
              type="number"
              min={0}
              max={300}
              step={1}
              value={z3}
              onChange={(ev) => setZ3(ev.target.value)}
            />
          </Flex>
          <Flex $alignItems="center">
            <label htmlFor="z4-input">Zone 4 Min HR:</label>&nbsp;
            <input
              id="z4-input"
              type="number"
              min={0}
              max={400}
              step={1}
              value={z4}
              onChange={(ev) => setZ4(ev.target.value)}
            />
          </Flex>
          <Flex $alignItems="center">
            <label htmlFor="z5-input">Zone 5 Min HR:</label>&nbsp;
            <input
              id="z5-input"
              type="number"
              min={0}
              max={300}
              step={1}
              value={z5}
              onChange={(ev) => setZ5(ev.target.value)}
            />
          </Flex>
        </Flex>
        <Flex $alignItems="center">
          <label htmlFor="start-date-input">Start Date:</label>&nbsp;
          <input
            id="start-date-input"
            type="date"
            onChange={(ev) => setStartDate(new Date(ev.target.value))}
          />
        </Flex>
        <Button>
          Add
        </Button>
      </form>
    </Surface>
  );
};

export default AddNewHRZones;
