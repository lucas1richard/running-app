import '@/assets/main.scss';
import AppProviders from '@/app/providers';
import router from '@/app/router';
import { RouterProvider } from 'react-router-dom';

const AppRoot = () => (
  <AppProviders>
    <RouterProvider router={router} />
  </AppProviders>
);

export default AppRoot;
