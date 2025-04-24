export const makeGet2ndArg = <T = any>() => (state: any, arg1: T): T => arg1;
export const makeGet3rdArg = <T = any>() => (state: any, arg1: any, arg2: T): T => arg2;
export const makeGet4thArg = <T = any>() => (state: any, arg1: any, arg2: any, arg3: T): T => arg3;