// REDUCER ACTIONS
export const TOGGLE_COMPARED_ACTIVITY = 'multimapReducer/TOGGLE_COMPARED_ACTIVITY';
export const toggleComparedActivityAct = (activityId) => ({
  type: TOGGLE_COMPARED_ACTIVITY,
  payload: activityId,
});
