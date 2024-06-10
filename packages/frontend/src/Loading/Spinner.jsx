import React from 'react';
import styles from './Loading.module.css';

const presets = {
  small: {
    diameter: '20px',
    duration: '1s',
  },
  medium: {
    diameter: '40px',
    duration: '1s',
  },
  large: {
    diameter: '60px',
    duration: '1s',
  },
  xlarge: {
    diameter: '80px',
    duration: '1s',
  },
};

const Spinner = ({
  color = '#333',
  size = 'medium',
  diameter = presets[size].diameter,
  duration = presets[size].duration,
}) => {
  return (
    <div
      className={styles.spinner}
      style={{
        '--diameter': diameter,
        '--color': color,
        '--duration': duration,
      }}
    >
      <div className={styles['spinner-inner']}>
        &nbsp;
      </div>
    </div>
  );
};

export default Spinner;
