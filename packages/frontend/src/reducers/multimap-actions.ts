// REDUCER ACTIONS
export const TOGGLE_COMPARED_ACTIVITY = 'multimapReducer/TOGGLE_COMPARED_ACTIVITY';
export const toggleComparedActivityAct = (activityId: number) => ({
  type: TOGGLE_COMPARED_ACTIVITY,
  payload: activityId,
});
