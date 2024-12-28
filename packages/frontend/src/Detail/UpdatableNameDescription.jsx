import React, { useCallback, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';
import styles from './Detail.module.css';
import { triggerUpdateActivity } from '../reducers/activitydetail-actions';
import { Basic, Button } from '../DLS';

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
    <div>
      <div>
        <Basic.Input
          type="string"
          fontSize="h4"
          width="100%"
          textAlign="center"
          color="darkGold"
          className={`${styles.quietInput}`}
          value={name}
          onChange={(ev) => setName(ev.target.value)}
        />
      </div>
      <textarea
        type="text"
        className={`heading-5 full-width text-center ${styles.quietInput}`}
        value={description}
        placeholder="Activity Description"
        onChange={(ev) => setDescription(ev.target.value)}
      /> 
      <Button
        onClick={updateActivity}
        className={classNames(
          'full-width',
          {
            'display-none': name === activity.name && description === details?.description
          }
        )}
      >
        Update
      </Button>
    </div>
  );
};

export default UpdatableNameDescription;
