import AdminDashboard from '@/Admin';
import App from '@/App';
import AppLayout from '@/app/layout/AppLayout';
import CalendarView from '@/Calendar';
import ActivityDetailPage from '@/Detail';
import HeartRateZones from '@/HeartRateZones';
import MultiMapPage from '@/MultiMap';
import PersonalRecords from '@/PersonalRecords';
import Volume from '@/Volume';
import { createBrowserRouter } from 'react-router-dom';

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

export default router;
