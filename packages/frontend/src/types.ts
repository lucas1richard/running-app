export interface AsyncAction {
  [k: string]: any;
  /** used to track the status of the async action in reducer */
  key?: string;
  type: string;
}

export interface ApiStatusAction {
  type: string;
  key: string;
  symbol: symbol;
}
