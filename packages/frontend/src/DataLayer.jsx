import React from 'react';
import {
  triggerFetchActivities,
  triggerFetchActivitiesSummary,
} from './reducers/activities-actions';
import {
  triggerFetchUserPrefs,
} from './reducers/preferences-actions';
import { triggerFetchHeartZones } from './reducers/heartzones-actions';
import { useTriggerActionIfStatus } from './reducers/apiStatus';

const DataLayer = ({ children }) => {
  useTriggerActionIfStatus(triggerFetchUserPrefs());
  useTriggerActionIfStatus(triggerFetchActivities());
  useTriggerActionIfStatus(triggerFetchActivitiesSummary());
  useTriggerActionIfStatus(triggerFetchHeartZones());

  return (<>{children}</>);
};

export default DataLayer;
