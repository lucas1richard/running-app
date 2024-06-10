import { produce } from 'immer';
import { useSelector } from 'react-redux';

const initialState = {
  // give a custom key to every API request, use uuid if you have to
};

const apiStatusReducer = (state = initialState, action) => {
  if (action.type.startsWith('apiReducer/SET_LOADING')) {
    return produce(state, (draft) => {
      draft[action.key] = {
        status: 'loading',
      };
    });
  }

  if (action.type.startsWith('apiReducer/SET_SUCCESS')) {
    return produce(state, (draft) => {
      draft[action.key] = {
        status: 'success',
      };
    });
  }

  if (action.type.startsWith('apiReducer/SET_ERROR')) {
    return produce(state, (draft) => {
      draft[action.key] = {
        status: 'error',
      };
    });
  }

  return state;
};

export const selectApiStatus = (state, key) => state.apiStatus[key]?.status || 'idle';
export const makeStatusSelector = (key) => (state) => selectApiStatus(state, key);
export const useGetApiStatus = (key) => useSelector(makeStatusSelector(key));

export default apiStatusReducer;
