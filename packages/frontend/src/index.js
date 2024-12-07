import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import {
  createBrowserRouter,
  Outlet,
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
import SideNav from './SideNav';
import PersonalRecords from './PersonalRecords';
import Volume from './Volume';
import MultiMapPage from './MultiMap';

enableMapSet();

const AppLayout = () => (
  <div>
    <SideNav />
    <div className="flex-item-grow content">
      <Outlet />
    </div>
  </div>
);

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
    element: <AppLayout />,
    children: [
      {
        path: '/',
        Component: App,
      },
      {
        path: '/:id/detail',
        Component: ActivityDetailPage,
      },
      {
        path: '/personal-records',
        Component: PersonalRecords,
      },
      {
        path: '/volume',
        Component: Volume,
      },
      {
        path: '/heart-zones',
        Component: HeartRateZones,
      },
      {
        path: '/multi-map',
        Component: MultiMapPage,
      },
      {
        path: '/admin',
        Component: AdminDashboard,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <DataLayer />
    <RouterProvider router={router} />
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
