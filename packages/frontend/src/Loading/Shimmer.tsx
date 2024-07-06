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

interface ShimmerProps {
  preset?: keyof typeof presets;
  duration?: number;
  color?: string;
  backgroundColor?: string;
  className?: string;
  isVisible?: boolean;
}

const Shimmer: React.FC<ShimmerProps> = ({
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
      } as React.CSSProperties}
    />
  );
};

export default Shimmer;
