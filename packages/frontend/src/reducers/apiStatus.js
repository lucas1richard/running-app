import { produce } from 'immer';

const initialState = {
  // give a custom key to every API request, use uuid if you have to
};

const apiStatusReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'apiReducer/SET_LOADING':
      return produce(state, (draft) => {
        draft[action.key] = {
          isLoading: true,
          error: null
        };
      });
    case 'apiReducer/SET_SUCCESS':
      return produce(state, (draft) => {
        draft[action.key] = {
          isLoading: false,
          error: null
        };
      });
    case 'apiReducer/SET_ERROR':
      return produce(state, (draft) => {
        draft[action.key] = {
          isLoading: false,
          error: action.error
        };
      });
    default:
      return state;
  }
};

export const selectApiStatus = (state, key) => {
  const statusObj = state.apiStatus[key];
  if (!statusObj) return 'idle';
  if (statusObj.isLoading) return 'loading';
  if (statusObj.error) return 'error';
  return 'success';
};

export default apiStatusReducer;
