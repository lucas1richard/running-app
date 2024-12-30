import type { ApiStatusAction } from "../types";

export const loadingSymbol = Symbol('loading');
export const successSymbol = Symbol('success');
export const errorSymbol = Symbol('error');

export const SET_API_LOADING = 'apiStatusReducer/SET_LOADING';
export const setApiLoadingAct = (key: string): ApiStatusAction => ({ type: `${SET_API_LOADING}-${key}`, key, symbol: loadingSymbol });

export const SET_API_SUCCESS = 'apiStatusReducer/SET_SUCCESS';
export const setApiSuccessAct = (key: string): ApiStatusAction => ({ type: `${SET_API_SUCCESS}-${key}`, key, symbol: successSymbol });

export const SET_API_ERROR = 'apiStatusReducer/SET_ERROR';
export const setApiErrorAct = (key: string): ApiStatusAction => ({ type: `${SET_API_ERROR}-${key}`, key, symbol: errorSymbol });
