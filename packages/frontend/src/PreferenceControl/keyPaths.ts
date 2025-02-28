import type { PreferencesKeyPath, ActivityPreferences } from '../reducers/preferences';

const listState = ['list', 'defined'] as const;

export const listDisplayConfigControls = (): PreferencesKeyPath => [...listState, 'displayConfigControls'];
export const listDisplayHideFunction = (): PreferencesKeyPath => [...listState, 'displayHideFunction'];

type KeypathGenerator = (id: string) => PreferencesKeyPath;

const makeActivityKeyPathCreator = <T extends keyof ActivityPreferences>
  (value: T): KeypathGenerator => (id: string) => ['activities', id, value];

export const activityShouldShowLaps = makeActivityKeyPathCreator('shouldShowLaps');
export const activityShouldShowSegments = makeActivityKeyPathCreator('shouldShowSegments');
export const activityShouldShowSimilarWorkouts = makeActivityKeyPathCreator('shouldShowSimilar');
