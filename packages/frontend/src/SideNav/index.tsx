import { type FC } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Card } from '../DLS';
import Surface from '../DLS/Surface';

type SideNavProps = {};

const SideBar = styled.div`
  margin: 0;
  padding: 0;
  width: 200px;
  position: fixed;
  height: 100%;
  overflow: auto;

  /* Sidebar links */
  a {
    display: block;
    padding: 0.5rem 0.5rem;
    text-decoration: none;
    font-weight: bold;
    text-decoration: none;
    font-size: 15px;
    display: block;
  }

  /* Active/current link */
  a:active {
    background-color: #04AA6D;
    color: white;
  }

  /* Links on mouse-over */
  a:hover:not(.active) {
    background-color: #555;
    color: white;
  }

  ${(props) => props.theme.breakpoints.down('md')} {
    width: 100%;
    height: auto;
    position: relative;
    a {
      float: left;
      text-align: center;
      float: none;
    }
}`;

const SideNav: FC<SideNavProps> = () => {
  return (
    <SideBar>
      <Surface className="pad">
        <Link to="/">Home</Link>
        <Link to="/calendar">Calendar</Link>
        <Link to="/personal-records">Personal Records</Link>
        <Link to="/volume">Volume</Link>
        <Link to="/multi-map">Multi Map</Link>
        <Link to="/admin">Admin</Link>
      </Surface>
    </SideBar>
  );
};

export default SideNav;
