export interface AsyncAction {
  [k: string]: any;
  /** used to track the status of the async action in reducer */
  key?: string;
  type: string;
}
