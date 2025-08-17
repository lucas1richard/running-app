import { type FC } from 'react';
import { Link } from 'react-router-dom';
import styles from './sidenav.module.scss';
import Surface from '../DLS/Surface';

type SideNavProps = {};

const SideNav: FC<SideNavProps> = () => {
  return (
    <div className={`${styles['side-nav']} text-blue-900 full-height`}>
      <Surface className="full-height">
        <Link className={`text-blue-400 ${styles.link}`} to="/">Home</Link>
        <Link className={`text-blue-400 ${styles.link}`} to="/calendar">Calendar</Link>
        <Link className={`text-blue-400 ${styles.link}`} to="/personal-records">Personal Records</Link>
        <Link className={`text-blue-400 ${styles.link}`} to="/volume">Volume</Link>
        <Link className={`text-blue-400 ${styles.link}`} to="/multi-map">Multi Map</Link>
        <Link className={`text-blue-400 ${styles.link}`} to="/admin">Admin</Link>
      </Surface>
    </div>
  );
};

export default SideNav;
