const listState = ['list', 'defined'];

export const listDisplayConfigControls = () => [...listState, 'displayConfigControls'];
export const listDisplayHideFunction = () => [...listState, 'displayHideFunction'];

export const activityShouldShowLaps = (id) => ['activities', id, 'shouldShowLaps'];
export const activityShouldShowSegments = (id) => ['activities', id, 'shouldShowSegments'];
export const activityShouldShowSimilarWorkouts = (id) => ['activities', id, 'shouldShowSimilar'];