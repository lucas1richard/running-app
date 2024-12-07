import { type FC } from 'react';
import { Link } from 'react-router-dom';

type SideNavProps = {};

const SideNav: FC<SideNavProps> = () => {
  return (
    <div className="sidebar card">
      <Link to="/">Home</Link>
      <hr />
      <Link to="/personal-records">Personal Records</Link>
      <hr />
      <Link to="/volume">Volume</Link>
      <hr />
      <Link to="/multi-map">Multi Map</Link>
      <hr />
      <Link to="/admin">Admin</Link>
    </div>
  );
};

export default SideNav;
