import { type FC } from 'react';
import { Link } from 'react-router-dom';
import styles from './sidenav.module.scss';
import Surface from '../DLS/Surface';

type SideNavProps = {};

const SideNav: FC<SideNavProps> = () => {
  return (
    <div className={`${styles['side-nav']} full-height`}>
      <Surface variant="base" className="full-height">
        <Link className={`text-h6 ${styles.link}`} to="/">Home</Link>
        <Link className={`text-h6 ${styles.link}`} to="/calendar">Calendar</Link>
        <Link className={`text-h6 ${styles.link}`} to="/personal-records">Personal Records</Link>
        <Link className={`text-h6 ${styles.link}`} to="/volume">Volume</Link>
        <Link className={`text-h6 ${styles.link}`} to="/multi-map">Multi Map</Link>
        <Link className={`text-h6 ${styles.link}`} to="/admin">Admin</Link>
      </Surface>
    </div>
  );
};

export default SideNav;
