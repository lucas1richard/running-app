import { store } from '@/app/store';
import DataLayer from '@/DataLayer';
import { styledComponentsTheme } from '@/DLS/theme';
import { enableMapSet } from 'immer';
import type { FC, PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';

enableMapSet();

type AppProvidersProps = PropsWithChildren;

const AppProviders: FC<AppProvidersProps> = ({ children }) => (
  <Provider store={store}>
    <ThemeProvider theme={styledComponentsTheme}>
      <DataLayer>
        {children}
      </DataLayer>
    </ThemeProvider>
  </Provider>
);

export default AppProviders;
