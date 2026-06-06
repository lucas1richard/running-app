import { Container } from '@/DLS';
import Surface from '@/DLS/Surface';
import SideNav from '@/SideNav';
import TopNav from '@/TopNav';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

const AppContent = styled.div`
  margin-left: 200px;
  min-height: 100vh;
  ${props => props.theme.breakpoints.down('md')} {
    margin-left: 0;
    padding: 0;
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

export default AppLayout;
