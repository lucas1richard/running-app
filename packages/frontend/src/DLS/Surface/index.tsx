import { ForwardedRef, forwardRef } from 'react';
import styles from './surface.module.css'

type SurfaceProps = {
  variant?: 'base' | 'foreground';
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
} & React.HTMLAttributes<HTMLDivElement>

const Surface = forwardRef<HTMLDivElement, SurfaceProps>(
  ({ variant = 'foreground', children, className, style, ...rest }, ref) => {
    return (
      <div className={`${styles[variant]} ${className}`} style={style} ref={ref} {...rest}>
        {children}
      </div>
    );
  }
)

export default Surface;