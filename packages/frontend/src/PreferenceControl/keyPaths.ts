import { PreferencesKeyPath, ActivityPreferences } from '../reducers/preferences';

const listState = ['list', 'defined'];

export const listDisplayConfigControls = () => [...listState, 'displayConfigControls'];
export const listDisplayHideFunction = () => [...listState, 'displayHideFunction'];

type KeypathGenerator = (id: string) => PreferencesKeyPath;

const makeActivityKeyPathCreator = <T extends keyof ActivityPreferences>
  (value: T): KeypathGenerator => (id: string) => ['activities', id, value];

export const activityShouldShowLaps = makeActivityKeyPathCreator('shouldShowLaps');
export const activityShouldShowSegments = makeActivityKeyPathCreator('shouldShowSegments');
export const activityShouldShowSimilarWorkouts = makeActivityKeyPathCreator('shouldShowSimilar');
