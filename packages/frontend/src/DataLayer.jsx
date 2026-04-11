import {
    triggerFetchActivities,
    triggerFetchActivitiesSummary,
} from '@/reducers/activities-actions';
import { useTriggerActionIfStatus } from '@/reducers/apiStatus';
import { triggerFetchHeartZones } from '@/reducers/heartzones-actions';
import {
    triggerFetchUserPrefs,
} from '@/reducers/preferences-actions';
import { triggerFetchPrs, triggerFetchPrsByDate } from '@/reducers/prs-actions';

const DataLayer = ({ children }) => {
    useTriggerActionIfStatus(triggerFetchUserPrefs());
    useTriggerActionIfStatus(triggerFetchActivities());
    useTriggerActionIfStatus(triggerFetchActivitiesSummary());
    useTriggerActionIfStatus(triggerFetchHeartZones());
    useTriggerActionIfStatus(triggerFetchPrs());
    useTriggerActionIfStatus(triggerFetchPrsByDate());

    return (<>{children}</>);
};

export default DataLayer;
