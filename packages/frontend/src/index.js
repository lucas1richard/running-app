import AdminDashboard from '@/Admin';
import App from '@/App';
import '@/assets/main.scss';
import CalendarView from '@/Calendar';
import DataLayer from '@/DataLayer';
import ActivityDetailPage from '@/Detail';
import { Container } from '@/DLS';
import Surface from '@/DLS/Surface';
import { styledComponentsTheme } from '@/DLS/theme';
import HeartRateZones from '@/HeartRateZones';
import MultiMapPage from '@/MultiMap';
import PersonalRecords from '@/PersonalRecords';
import reducer from '@/reducers';
import reportWebVitals from '@/reportWebVitals';
import mySaga from '@/sagas';
import SideNav from '@/SideNav';
import TopNav from '@/TopNav';
import Volume from '@/Volume';
import { configureStore } from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import {
    createBrowserRouter,
    Outlet,
    RouterProvider,
} from 'react-router-dom';
import createSagaMiddleware from 'redux-saga';
import styled, { ThemeProvider } from 'styled-components';

enableMapSet();

const AppContent = styled.div`
  margin-left: 200px;
  min-height: 100vh;
  ${props => props.theme.breakpoints.down('md')} {
    margin-left: 0;
    padding:  0;
  }
`;

const AppLayout = () => (
  <Surface variant="base">
    <Container providesViewSize={true}>
      <SideNav />
      <AppContent>
        <Container showViewSizeDisplay={true} providesViewSize={true}>
          <TopNav />
          <Outlet />
        </Container>
      </AppContent>
    </Container>
  </Surface>
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
        path: '/calendar',
        Component: CalendarView,
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
    <ThemeProvider theme={styledComponentsTheme}>
      <DataLayer />
      <RouterProvider router={router} />
    </ThemeProvider>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
