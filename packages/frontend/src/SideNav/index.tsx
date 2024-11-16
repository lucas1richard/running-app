import { type FC } from 'react';
import { Link } from 'react-router-dom';

type SideNavProps = {};

const SideNav: FC<SideNavProps> = () => {
  return (
    <div className="sidebar card">
      <Link to="/">Home</Link>
    </div>
  );
};

export default SideNav;
