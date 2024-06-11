import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addHeartZonesAct } from '../reducers/heartzones-actions';

const AddZonesForm = () => {
  const [z1, setZ1] = useState();
  const [z2, setZ2] = useState();
  const [z3, setZ3] = useState();
  const [z4, setZ4] = useState();
  const [z5, setZ5] = useState();
  const [starting, setStarting] = useState();
  const dispatch = useDispatch();
  
  const onFormSubmit = useCallback((ev) => {
    ev.preventDefault();
    dispatch(addHeartZonesAct({ z1, z2, z3, z4, z5, starting }));
  }, [z1, z2, z3, z4, z5, starting, dispatch]);

  const z1Change = useCallback((ev) => setZ1(ev.target.value), []);
  const z2Change = useCallback((ev) => setZ2(ev.target.value), []);
  const z3Change = useCallback((ev) => setZ3(ev.target.value), []);
  const z4Change = useCallback((ev) => setZ4(ev.target.value), []);
  const z5Change = useCallback((ev) => setZ5(ev.target.value), []);
  const startingChange = useCallback((ev) => setStarting(ev.target.value), []);

  return (
    <form onSubmit={onFormSubmit} style={{ display: 'flex', gap: '2rem', textAlign: 'center' }}>
      <div>
        <label htmlFor="z1">Min Zone 1 Heart Rate:</label>
        <div>
          <input id="z1" type="number" value={z1} onChange={z1Change} />
        </div>
      </div>
      <div>
        <label htmlFor="z2">Min Zone 2 Heart Rate:</label>
        <div>
          <input id="z2" type="number" value={z2} onChange={z2Change} />
        </div>
      </div>
      <div>
        <label htmlFor="z3">Min Zone 3 Heart Rate:</label>
        <div>
          <input id="z3" type="number" value={z3} onChange={z3Change} />
        </div>
      </div>
      <div>
        <label htmlFor="z4">Min Zone 4 Heart Rate:</label>
        <div>
          <input id="z4" type="number" value={z4} onChange={z4Change} />
        </div>
      </div>
      <div>
        <label htmlFor="z5">Min Zone 5 Heart Rate:</label>
        <div>
          <input id="z5" type="number" value={z5} onChange={z5Change} />
        </div>
      </div>
      <div>
        <label htmlFor="starting">Starting Date:</label>
        <div>
          <input id="starting" type="date" value={starting} onChange={startingChange} />
        </div>
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}

AddZonesForm.propTypes = {
};

export default AddZonesForm;
