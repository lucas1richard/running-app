import React from 'react';

const presets = {
  hideBackground: {
    backgroundColor: '#efefef',
    duration: '1s',
    shimmerColor: 'rgba(0,0,0,0.2)',
  },
  openBackground: {
    backgroundColor: 'transparent',
    duration: '1s',
    shimmerColor: 'rgba(0,0,0,0.2)',
  },
};

const Shimmer = ({
  preset = 'hideBackground',
  duration = presets[preset].duration,
  color = presets[preset].shimmerColor,
  backgroundColor = presets[preset].backgroundColor,
  className = '',
  isVisible = true,
}) => {
  return (
    <div
      className={`shine ${isVisible ? '' : 'display-none'} ${className}`}
      style={{
        '--backgroundColor': backgroundColor,
        '--shimmerColor': color,
        '--duration': duration,
      }}
    />
  );
};

export default Shimmer;
