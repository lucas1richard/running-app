export const SET_API_LOADING = 'apiStatusReducer/SET_LOADING';
export const setApiLoadingAct = (key: string) => ({ type: `${SET_API_LOADING}-${key}`, key });

export const SET_API_SUCCESS = 'apiStatusReducer/SET_SUCCESS';
export const setApiSuccessAct = (key: string) => ({ type: `${SET_API_SUCCESS}-${key}`, key });

export const SET_API_ERROR = 'apiStatusReducer/SET_ERROR';
export const setApiErrorAct = (key: string) => ({ type: `${SET_API_ERROR}-${key}`, key });
