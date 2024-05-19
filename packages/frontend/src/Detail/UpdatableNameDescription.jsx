import React, { useCallback, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

const UpdatableNameDescription = ({
  activity,
  details,
}) => {
  const id = activity.id;
  const dispatch = useDispatch();
  const [name, setName] = useState(activity.name);
  const [description, setDescription] = useState(details?.description);
  useEffect(() => {
    setName(activity?.name);
  }, [activity?.name]);

  useEffect(() => {
    setDescription(details?.description);
  }, [details?.description]);

  const updateActivity = useCallback(() => {
    dispatch({ type: 'activitydetails/UPDATE_ACTIVITY', payload: { id, name, description } });
  }, [name, id, description, dispatch]);

  return (
    <div className="flex flex-column">
      <input
        type="string"
        className="heading-1 text-center"
        value={name}
        onChange={(ev) => setName(ev.target.value)}
      />
      <input
        type="text"
        className="heading-5 text-center"
        value={description}
        placeholder="Activity Description"
        onChange={(ev) => setDescription(ev.target.value)}
      />
      <button
        className="full-width"
        onClick={updateActivity}
        disabled={name === activity.name && description === details?.description}
      >
        Update
      </button>
    </div>
  );
};

export default UpdatableNameDescription;
