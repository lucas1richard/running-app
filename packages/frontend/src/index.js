import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import './index.css';
import App from './App';
import { enableMapSet } from 'immer';
import reportWebVitals from './reportWebVitals';
import reducer from './reducers'
import mySaga from './sagas'
import ActivityDetailPage from './Detail';
import DataLayer from './DataLayer';
import HeartRateZones from './HeartRateZones';
import AdminDashboard from './Admin';

enableMapSet();

// create the saga middleware
const sagaMiddleware = createSagaMiddleware()
// mount it on the Store
const store = configureStore({
  reducer, 
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware),
})

// then run the saga
sagaMiddleware.run(mySaga);

const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
  },
  {
    path: '/:id/detail',
    Component: ActivityDetailPage,
  },
  {
    path: '/heart-zones',
    Component: HeartRateZones,
  },
  {
    path: '/admin',
    Component: AdminDashboard,
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <DataLayer />
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
