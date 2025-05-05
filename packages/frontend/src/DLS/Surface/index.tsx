import { ForwardedRef, forwardRef } from 'react';
import styles from './surface.module.css'

type SurfaceProps = {
  variant?: 'base' | 'foreground';
  children: React.ReactNode;
  className?: string;
}

const Surface = forwardRef<HTMLDivElement, SurfaceProps>(
  ({ variant = 'foreground', children, className }, ref) => {
    return (
      <div className={`${styles[variant]} ${className}`} ref={ref}>
        {children}
      </div>
    );
  }
)

export default Surface;