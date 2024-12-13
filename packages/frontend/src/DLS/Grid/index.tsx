import React, { useMemo } from 'react';
import styles from './grid.module.css';

type Props = {
  templateColumns?: React.CSSProperties['gridTemplateColumns'];
  templateAreas?: React.CSSProperties['gridTemplateAreas'];
  gap?: React.CSSProperties['gap'];
  columnGap?: React.CSSProperties['columnGap'];
  rowGap?: React.CSSProperties['rowGap'];
  className?: string;
  children?: React.ReactNode;
};

const Grid: React.FC<Props> = ({
  templateColumns = 'inherit',
  templateAreas = 'inherit',
  gap = 'inherit',
  columnGap = gap,
  rowGap = gap,
  className = '',
  children,
}) => {
  const style = useMemo(() => ({
    '--templateColumns': templateColumns,
    '--templateAreas': templateAreas,
    '--columnGap': columnGap,
    '--rowGap': rowGap,
    '--gap': gap,
  }), [columnGap, gap, rowGap, templateAreas, templateColumns]) as React.CSSProperties;
  
  return (
    <div className={`${styles.grid} ${className}`} style={style}>{children}</div>
  )
};

export default Grid;
