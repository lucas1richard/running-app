import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateStreamPin } from '../../reducers/activities-actions';

type StreamPinFormProps = {
  pin: StreamPin;
}

const StreamPinForm: React.FC<StreamPinFormProps> = ({ pin }) => {
  const dispatch = useDispatch();
  const [label, setLabel] = useState(pin.label);
  const [description, setDescription] = useState(pin.description);
  
  const changeLabel = useCallback((e) => setLabel(e.target.value), []);
  const changeDescription = useCallback((e) => setDescription(e.target.value), []);
  
  const onSubmit = useCallback((e) => {
    e.preventDefault();
    dispatch(updateStreamPin({ ...pin, label, description }));
  }, [description, dispatch, label, pin]);
  
  return (
    <div>
      <form onSubmit={onSubmit}>
        <label>
          Label:
          <input type="text" value={label} onChange={changeLabel} />
        </label>
        <label>
          Description:
          <input type="text" value={description} onChange={changeDescription} />
        </label>
        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default StreamPinForm;
