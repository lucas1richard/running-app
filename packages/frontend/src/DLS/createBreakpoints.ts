export type BreakPoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
// Sorted ASC by size. That's important.
// It can't be configured as it's used statically for propTypes.
export const keys: BreakPoint[] = ['xs', 'sm', 'md', 'lg', 'xl'];

const defaultBreakpoints = {
  keys,
  values: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  },
  unit: 'px',
};

// Keep in mind that @media is inclusive by the CSS specification.
export default function createBreakpoints(breakpoints = defaultBreakpoints) {
  const {
    // The breakpoint **start** at this value.
    // For instance with the first breakpoint xs: [xs, sm[.
    values = {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
    unit = 'px',
  } = breakpoints;

  function up(key: BreakPoint) {
    return `@container (min-width: ${values[key]}${unit})`;
  }

  function down(key: BreakPoint) {
    return `@container (max-width: ${values[key]}${unit})`;
  }

  function between(start: BreakPoint, end: BreakPoint) {
    return (
      `@container (min-width: ${values[start]}${unit}) and ` +
      `(max-width: ${values[end]}${unit})`
    );
  }

  function only(key: BreakPoint) {
    return (
      `@container (min-width:${values[key]}${unit}) and ` +
      `(max-width:${values[key]}${unit})`
    );
  }

  function width(key: BreakPoint) {
    return values[key];
  }

  return {
    keys,
    values,
    up,
    down,
    between,
    only,
    width,
  };
}
