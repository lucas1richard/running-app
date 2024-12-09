import { PreferencesKeyPath } from '../reducers/preferences';

const listState = ['list', 'defined'];

export const listDisplayConfigControls = () => [...listState, 'displayConfigControls'];
export const listDisplayHideFunction = () => [...listState, 'displayHideFunction'];

type KeypathGenerator = (id: string) => PreferencesKeyPath;

export const activityShouldShowLaps: KeypathGenerator = (id: string) => ['activities', id, 'shouldShowLaps'];
export const activityShouldShowSegments: KeypathGenerator = (id: string) => ['activities', id, 'shouldShowSegments'];
export const activityShouldShowSimilarWorkouts: KeypathGenerator = (id: string) => ['activities', id, 'shouldShowSimilar'];