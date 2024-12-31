import React, { useCallback, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import styles from './Detail.module.css';
import { triggerUpdateActivity } from '../reducers/activitydetail-actions';
import { Basic, Button } from '../DLS';

type UpdatableNameDescriptionProps = {
  activity: Activity;
  details: { description: string };
};

const UpdatableNameDescription: React.FC<UpdatableNameDescriptionProps> = ({
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

  const changeName = useCallback<React.ChangeEventHandler<HTMLInputElement>>((ev) => setName(ev.target.value), []);
  const changeDescription = useCallback<React.ChangeEventHandler<HTMLTextAreaElement>>(
    (ev) => setDescription(ev.target.value), []
  );

  const isDescriptionDifferrent = details?.description !== description
    && Boolean(details?.description) !== Boolean(description);
  const showButton = name !== activity.name || isDescriptionDifferrent;

  return (
    <div>
      <Basic.Input
        type="string"
        fontSize="h4"
        width="100%"
        textAlign="center"
        color="darkGold"
        className={`${styles.quietInput}`}
        value={name}
        onChange={changeName}
      />

      <Basic.Textarea
        fontSize="h5"
        width="100%"
        textAlign="center"
        className={`${styles.quietInput}`}
        value={description}
        placeholder="Activity Description"
        onChange={changeDescription}
      />

      <Button
        onClick={updateActivity}
        width="100%"
        display={showButton ? 'initial' : 'none'}
      >
        Update
      </Button>
    </div>
  );
};

export default UpdatableNameDescription;
