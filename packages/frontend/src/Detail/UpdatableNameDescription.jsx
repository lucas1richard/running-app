import React, { useCallback, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';
import styles from './Detail.module.css';
import { triggerUpdateActivity } from '../reducers/activitydetail-actions';

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
    dispatch(triggerUpdateActivity({ id, name, description }));
  }, [name, id, description, dispatch]);

  return (
    <div className="flex flex-column">
      <input
        type="string"
        className={`heading-1 dls-dark-gold text-center ${styles.quietInput}`}
        value={name}
        onChange={(ev) => setName(ev.target.value)}
      />
      <textarea
        type="text"
        className={`heading-5 text-center ${styles.quietInput}`}
        value={description}
        placeholder="Activity Description"
        onChange={(ev) => setDescription(ev.target.value)}
      /> 
      <button
        onClick={updateActivity}
        className={classNames(
          'full-width',
          {
            'display-none': name === activity.name && description === details?.description
          }
        )}
      >
        Update
      </button>
    </div>
  );
};

export default UpdatableNameDescription;
